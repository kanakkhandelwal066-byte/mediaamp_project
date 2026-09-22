import json
import uuid
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models.payment import Payment
from app.models.booking import Booking
from app.models.user import User
from app.repositories.payment_repository import PaymentRepository
from app.repositories.booking_repository import BookingRepository
from app.repositories.audit_repository import AuditRepository
from app.payments.paytm import PaytmPaymentProvider, DemoPaymentProvider
from app.services.booking_service import BookingService
from app.notifications.service import NotificationService
from app.schemas.payment import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentVerifyRequest,
    PaymentOut,
    DemoPaymentSimulateRequest
)
from app.utils.exceptions import (
    EntityNotFoundException,
    PaymentFailedException,
    ForbiddenException,
    CineBookException
)

logger = logging.getLogger("cinebook.payments")

class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.payment_repo = PaymentRepository(db)
        self.booking_repo = BookingRepository(db)
        self.audit_repo = AuditRepository(db)
        self.booking_service = BookingService(db)
        self.paytm_provider = PaytmPaymentProvider()
        self.demo_provider = DemoPaymentProvider()

    async def initiate_payment(self, payload: PaymentInitiateRequest, current_user: User) -> PaymentInitiateResponse:
        booking = self.booking_repo.get_by_id_with_relations(payload.booking_id)
        if not booking:
            raise EntityNotFoundException("Booking", payload.booking_id)

        if booking.user_id != current_user.id:
            raise ForbiddenException("You cannot pay for another user's booking")

        if booking.status != "PENDING":
            raise CineBookException(f"Cannot pay for booking with status '{booking.status}'", status_code=400)

        order_id = self.payment_repo.generate_order_id()
        use_mock = (payload.provider == "DEMO_GATEWAY" or settings.MOCK_PAYMENT_MODE)

        # Create payment record
        payment = Payment(
            booking_id=booking.id,
            user_id=current_user.id,
            amount=booking.final_amount,
            currency="INR",
            provider="DEMO_GATEWAY" if use_mock else "PAYTM",
            order_id=order_id,
            status="INITIATED",
            payment_method=payload.payment_method or "UPI"
        )
        self.payment_repo.create(payment)
        self.db.commit()
        self.db.refresh(payment)

        # Call gateway provider
        if use_mock:
            gateway_data = await self.demo_provider.create_order(
                order_id=order_id,
                amount=booking.final_amount,
                customer_id=str(current_user.id),
                customer_email=current_user.email,
                customer_phone=current_user.phone
            )
        else:
            gateway_data = await self.paytm_provider.create_order(
                order_id=order_id,
                amount=booking.final_amount,
                customer_id=str(current_user.id),
                customer_email=current_user.email,
                customer_phone=current_user.phone
            )

        self.audit_repo.log(
            action="PAYMENT_INITIATED",
            user_id=current_user.id,
            entity_type="Payment",
            entity_id=str(payment.id),
            metadata={"order_id": order_id, "amount": booking.final_amount, "provider": payment.provider}
        )
        self.db.commit()

        return PaymentInitiateResponse(
            payment_id=payment.id,
            order_id=order_id,
            booking_id=booking.id,
            amount=booking.final_amount,
            currency="INR",
            provider=payment.provider,
            is_mock=use_mock,
            gateway_data=gateway_data
        )

    async def verify_payment(self, payload: PaymentVerifyRequest, current_user: User) -> PaymentOut:
        payment = self.payment_repo.get_by_order_id(payload.order_id)
        if not payment:
            raise EntityNotFoundException("Payment Order", payload.order_id)

        if payment.user_id != current_user.id:
            raise ForbiddenException("Access denied to this payment order")

        booking = self.booking_repo.get_by_id_with_relations(payment.booking_id)
        if not booking:
            raise EntityNotFoundException("Booking", payment.booking_id)

        # Gateway verification
        if payment.provider == "DEMO_GATEWAY":
            verify_res = await self.demo_provider.verify_payment(payload.model_dump())
        else:
            verify_res = await self.paytm_provider.verify_payment(payload.model_dump())

        txn_id = verify_res.get("transaction_id") or payload.transaction_id or f"TXN_{uuid.uuid4().hex[:10].upper()}"
        payment.transaction_id = txn_id
        payment.gateway_response = json.dumps(verify_res.get("raw_response", {}))

        if verify_res.get("is_success"):
            payment.status = "SUCCESS"
            self.db.commit()

            # Confirm booking atomically and transition seats LOCKED -> BOOKED
            self.booking_service.confirm_booking(booking.id)

            NotificationService.send_notification(
                db=self.db,
                user_id=current_user.id,
                notification_type="PAYMENT_SUCCESS",
                title="Payment Successful",
                message=f"Received payment of ₹{payment.amount:.2f} for booking {booking.booking_reference}. Transaction ID: {txn_id}",
                metadata={"payment_id": payment.id, "transaction_id": txn_id}
            )

            self.audit_repo.log(
                action="PAYMENT_SUCCESS",
                user_id=current_user.id,
                entity_type="Payment",
                entity_id=str(payment.id),
                metadata={"order_id": payment.order_id, "amount": payment.amount}
            )
            self.db.commit()
            self.db.refresh(payment)
            return payment

        elif verify_res.get("status") == "PENDING":
            payment.status = "PENDING"
            self.db.commit()
            self.db.refresh(payment)
            return payment

        else:
            payment.status = "FAILED"
            self.db.commit()

            # Release locked seats and mark booking CANCELLED
            self.booking_service.handle_payment_failure(booking.id, reason="Payment verification failed")

            self.audit_repo.log(
                action="PAYMENT_FAILED",
                user_id=current_user.id,
                entity_type="Payment",
                entity_id=str(payment.id),
                metadata={"order_id": payment.order_id}
            )
            self.db.commit()
            self.db.refresh(payment)
            raise PaymentFailedException(f"Payment verification failed with status: {verify_res.get('status')}")

    async def simulate_demo_payment(self, payload: DemoPaymentSimulateRequest, current_user: User) -> PaymentOut:
        """Helper specifically for interviewer demo evaluation."""
        verify_req = PaymentVerifyRequest(
            order_id=payload.order_id,
            status=payload.outcome.upper().strip(),
            transaction_id=f"DEMO_TXN_{uuid.uuid4().hex[:8].upper()}"
        )
        return await self.verify_payment(verify_req, current_user)
