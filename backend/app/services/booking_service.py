import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.booking import Booking, BookingItem
from app.models.show import Show, ShowSeat
from app.models.coupon import Coupon
from app.repositories.booking_repository import BookingRepository
from app.repositories.seat_repository import SeatRepository
from app.repositories.show_repository import ShowRepository
from app.repositories.coupon_repository import CouponRepository
from app.repositories.audit_repository import AuditRepository
from app.services.coupon_service import CouponService
from app.notifications.service import NotificationService
from app.schemas.booking import BookingCreateRequest, BookingOut, BookingItemOut, TicketOut
from app.schemas.show import ShowOut
from app.utils.exceptions import (
    EntityNotFoundException,
    SeatUnavailableException,
    SeatLockExpiredException,
    BookingNotFoundException,
    BookingAlreadyCancelledException,
    ForbiddenException,
    CineBookException
)
from app.utils.qr_generator import generate_qr_code_base64
from app.utils.datetime_utils import is_past
import logging

logger = logging.getLogger("cinebook.bookings")

class BookingService:
    def __init__(self, db: Session):
        self.db = db
        self.booking_repo = BookingRepository(db)
        self.seat_repo = SeatRepository(db)
        self.show_repo = ShowRepository(db)
        self.coupon_service = CouponService(db)
        self.coupon_repo = CouponRepository(db)
        self.audit_repo = AuditRepository(db)

    def calculate_pricing(
        self,
        show_seats: List[ShowSeat],
        coupon_code: Optional[str] = None
    ) -> Tuple[float, float, float, float, float, Optional[Coupon]]:
        """
        Calculates all financial figures on the backend.
        Never trusts user/frontend input for pricing.
        """
        total_ticket_amount = sum(ss.price for ss in show_seats)
        
        # Coupon discount
        discount_amount = 0.0
        applied_coupon = None
        if coupon_code:
            applied_coupon, discount_amount = self.coupon_service.validate_and_calculate_discount(
                coupon_code, total_ticket_amount
            )

        # Convenience fee: flat ₹30 + 5% of subtotal
        convenience_fee = round(30.0 + (0.05 * total_ticket_amount), 2)
        
        # GST: 18% on convenience fee
        tax_amount = round(0.18 * convenience_fee, 2)
        
        # Final amount
        final_amount = round(total_ticket_amount - discount_amount + convenience_fee + tax_amount, 2)
        final_amount = max(final_amount, 0.0)

        return total_ticket_amount, discount_amount, convenience_fee, tax_amount, final_amount, applied_coupon

    def create_booking(self, payload: BookingCreateRequest, user_id: int) -> Booking:
        """
        Transactional booking initialization.
        Validates seat locks, calculates verified prices, creates Booking + BookingItems.
        """
        show = self.show_repo.get_by_id(payload.show_id)
        if not show or not show.is_active:
            raise EntityNotFoundException("Show", payload.show_id)

        now = datetime.now(timezone.utc)

        try:
            # Query seats with row lock
            show_seats = (
                self.db.query(ShowSeat)
                .filter(
                    ShowSeat.show_id == payload.show_id,
                    ShowSeat.seat_id.in_(payload.seat_ids)
                )
                .with_for_update()
                .all()
            )

            if len(show_seats) != len(payload.seat_ids):
                raise SeatUnavailableException("One or more selected seats do not exist for this show.")

            # Validate that seats are locked by THIS user and lock has not expired
            for ss in show_seats:
                if ss.status == "BOOKED":
                    raise SeatUnavailableException(f"Seat {ss.seat.row}{ss.seat.seat_number} has already been booked.")
                if ss.status != "LOCKED" or ss.locked_by_user_id != user_id:
                    raise SeatUnavailableException(f"Seat {ss.seat.row}{ss.seat.seat_number} must be locked by you before checkout.")
                if ss.locked_until and is_past(ss.locked_until):
                    raise SeatLockExpiredException(f"Lock on seat {ss.seat.row}{ss.seat.seat_number} has expired. Please reselect.")

            # Backend pricing calculation
            total_amt, discount_amt, fee_amt, tax_amt, final_amt, applied_coupon = self.calculate_pricing(
                show_seats, payload.coupon_code
            )

            booking_ref = self.booking_repo.generate_booking_reference()
            qr_token = f"CB-{uuid.uuid4().hex}"

            booking = Booking(
                booking_reference=booking_ref,
                user_id=user_id,
                show_id=show.id,
                total_amount=total_amt,
                discount_amount=discount_amt,
                convenience_fee=fee_amt,
                tax_amount=tax_amt,
                final_amount=final_amt,
                status="PENDING",
                qr_code_token=qr_token
            )
            self.booking_repo.create(booking)
            self.db.flush()

            # Create Booking Items
            for ss in show_seats:
                item = BookingItem(
                    booking_id=booking.id,
                    show_seat_id=ss.id,
                    seat_row=ss.seat.row,
                    seat_number=ss.seat.seat_number,
                    seat_tier=ss.seat.tier,
                    price=ss.price
                )
                self.db.add(item)

            # Record coupon usage if applied
            if applied_coupon:
                self.coupon_repo.record_usage(
                    coupon_id=applied_coupon.id,
                    user_id=user_id,
                    booking_id=booking.id,
                    discount_applied=discount_amt
                )

            self.audit_repo.log(
                action="BOOKING_INITIATED",
                user_id=user_id,
                entity_type="Booking",
                entity_id=str(booking.id),
                metadata={"booking_reference": booking_ref, "final_amount": final_amt}
            )

            self.db.commit()
            self.db.refresh(booking)
            logger.info(f"Created pending booking {booking_ref} (₹{final_amt}) for user {user_id}")
            return booking

        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create booking: {str(e)}")
            raise e

    def confirm_booking(self, booking_id: int) -> Booking:
        """
        Atomic transition to CONFIRMED when payment succeeds.
        Marks ShowSeats as BOOKED.
        """
        booking = self.booking_repo.get_by_id_with_relations(booking_id)
        if not booking:
            raise BookingNotFoundException()

        if booking.status == "CONFIRMED":
            return booking # Idempotent

        # Transition seats LOCKED -> BOOKED
        seat_ids = [item.show_seat.seat_id for item in booking.items]
        self.seat_repo.transition_locked_to_booked(
            show_id=booking.show_id,
            seat_ids=seat_ids,
            user_id=booking.user_id
        )

        booking.status = "CONFIRMED"
        self.booking_repo.update(booking)

        # Notify user
        NotificationService.send_notification(
            db=self.db,
            user_id=booking.user_id,
            notification_type="BOOKING_CONFIRMED",
            title="Booking Confirmed! 🎉",
            message=f"Your tickets for {booking.show.movie.title} at {booking.show.theatre.name} have been confirmed. Ref: {booking.booking_reference}",
            metadata={"booking_id": booking.id, "booking_reference": booking.booking_reference}
        )

        self.audit_repo.log(
            action="BOOKING_CONFIRMED",
            user_id=booking.user_id,
            entity_type="Booking",
            entity_id=str(booking.id),
            metadata={"booking_reference": booking.booking_reference, "final_amount": booking.final_amount}
        )
        self.db.commit()
        self.db.refresh(booking)
        logger.info(f"Confirmed booking {booking.booking_reference}")
        return booking

    def handle_payment_failure(self, booking_id: int, reason: str = "Payment failed") -> Booking:
        """Releases seats back to AVAILABLE when payment fails."""
        booking = self.booking_repo.get_by_id_with_relations(booking_id)
        if not booking:
            raise BookingNotFoundException()

        seat_ids = [item.show_seat.seat_id for item in booking.items]
        self.seat_repo.release_user_locks(
            show_id=booking.show_id,
            seat_ids=seat_ids,
            user_id=booking.user_id
        )

        booking.status = "CANCELLED"
        booking.cancelled_at = datetime.now(timezone.utc)
        self.booking_repo.update(booking)

        NotificationService.send_notification(
            db=self.db,
            user_id=booking.user_id,
            notification_type="PAYMENT_FAILED",
            title="Payment Failed",
            message=f"Payment for booking {booking.booking_reference} could not be processed. Your reserved seats have been released.",
            metadata={"booking_id": booking.id}
        )
        self.db.commit()
        return booking

    def cancel_booking(self, booking_id: int, user_id: int) -> Booking:
        """Cancel an eligible booking and release seats back to AVAILABLE."""
        booking = self.booking_repo.get_by_id_with_relations(booking_id)
        if not booking:
            raise BookingNotFoundException()

        if booking.user_id != user_id:
            raise ForbiddenException("You cannot cancel another user's booking")

        if booking.status == "CANCELLED":
            raise BookingAlreadyCancelledException()

        # Check show has not already started
        if is_past(booking.show.start_time):
            raise CineBookException("Cannot cancel booking for a show that has already started", status_code=400)

        # Release show seats
        for item in booking.items:
            item.show_seat.status = "AVAILABLE"
            item.show_seat.locked_until = None
            item.show_seat.locked_by_user_id = None

        booking.status = "CANCELLED"
        booking.cancelled_at = now
        self.booking_repo.update(booking)

        NotificationService.send_notification(
            db=self.db,
            user_id=booking.user_id,
            notification_type="BOOKING_CANCELLED",
            title="Booking Cancelled",
            message=f"Your booking {booking.booking_reference} for {booking.show.movie.title} has been cancelled.",
            metadata={"booking_id": booking.id}
        )

        self.audit_repo.log(
            action="BOOKING_CANCELLED",
            user_id=user_id,
            entity_type="Booking",
            entity_id=str(booking.id),
            metadata={"booking_reference": booking.booking_reference}
        )
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def get_booking_details(self, booking_id: int, current_user_id: int, is_admin: bool = False) -> Booking:
        booking = self.booking_repo.get_by_id_with_relations(booking_id)
        if not booking:
            raise BookingNotFoundException()

        if not is_admin and booking.user_id != current_user_id:
            raise ForbiddenException("Access denied to this booking")

        return booking

    def get_user_bookings(self, user_id: int, skip: int = 0, limit: int = 20) -> List[Booking]:
        return self.booking_repo.get_user_bookings(user_id, skip=skip, limit=limit)

    def get_ticket(self, booking_id: int, current_user_id: int, is_admin: bool = False) -> TicketOut:
        booking = self.get_booking_details(booking_id, current_user_id, is_admin)

        seat_labels = [f"{item.seat_row}{item.seat_number}" for item in booking.items]
        
        # QR Code payload
        qr_payload = {
            "booking_id": booking.id,
            "ref": booking.booking_reference,
            "token": booking.qr_code_token,
            "movie": booking.show.movie.title,
            "theatre": booking.show.theatre.name,
            "screen": booking.show.screen.name,
            "show_time": booking.show.start_time.isoformat(),
            "seats": seat_labels,
            "amount": booking.final_amount
        }

        qr_base64 = generate_qr_code_base64(qr_payload)

        return TicketOut(
            booking_id=booking.id,
            booking_reference=booking.booking_reference,
            movie_title=booking.show.movie.title,
            movie_poster=booking.show.movie.poster_url,
            theatre_name=booking.show.theatre.name,
            theatre_address=booking.show.theatre.address,
            screen_name=booking.show.screen.name,
            show_time=booking.show.start_time,
            seats=seat_labels,
            total_seats=len(seat_labels),
            final_amount=booking.final_amount,
            status=booking.status,
            qr_code_base64=qr_base64,
            booking_date=booking.created_at
        )

    def to_booking_out(self, b: Booking) -> BookingOut:
        items_out = [
            BookingItemOut(
                id=item.id,
                show_seat_id=item.show_seat_id,
                seat_row=item.seat_row,
                seat_number=item.seat_number,
                seat_tier=item.seat_tier,
                price=item.price
            )
            for item in b.items
        ]
        return BookingOut(
            id=b.id,
            booking_reference=b.booking_reference,
            user_id=b.user_id,
            show_id=b.show_id,
            movie_title=b.show.movie.title,
            movie_poster=b.show.movie.poster_url,
            theatre_name=b.show.theatre.name,
            theatre_address=b.show.theatre.address,
            city_name=b.show.theatre.city.name if b.show.theatre.city else "City",
            screen_name=b.show.screen.name,
            screen_format=b.show.format,
            show_time=b.show.start_time,
            items=items_out,
            total_amount=b.total_amount,
            discount_amount=b.discount_amount,
            convenience_fee=b.convenience_fee,
            tax_amount=b.tax_amount,
            final_amount=b.final_amount,
            status=b.status,
            created_at=b.created_at,
            qr_code_token=b.qr_code_token
        )
