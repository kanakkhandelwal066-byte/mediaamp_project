from typing import Dict, Any
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.payment_service import PaymentService
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.payment import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentVerifyRequest,
    PaymentOut,
    DemoPaymentSimulateRequest
)
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create", response_model=ResponseEnvelope[PaymentInitiateResponse], status_code=status.HTTP_201_CREATED)
async def initiate_payment(
    payload: PaymentInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate payment session via Paytm Staging or Demo Gateway."""
    service = PaymentService(db)
    resp = await service.initiate_payment(payload, current_user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Payment order created successfully",
        data=resp
    )

@router.post("/verify", response_model=ResponseEnvelope[PaymentOut])
async def verify_payment(
    payload: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify payment gateway response.
    When SUCCESS: updates payment to SUCCESS and confirms booking + marks seats BOOKED.
    When FAILED: updates payment to FAILED and releases locked seats back to AVAILABLE.
    """
    service = PaymentService(db)
    payment = await service.verify_payment(payload, current_user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Payment verified successfully",
        data=PaymentOut.model_validate(payment)
    )

@router.post("/simulate-demo", response_model=ResponseEnvelope[PaymentOut])
async def simulate_demo_payment(
    payload: DemoPaymentSimulateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Interactive Mock/Demo Payment Simulator.
    Simulate SUCCESS, FAILURE, or PENDING state with zero external payment dependencies.
    """
    service = PaymentService(db)
    payment = await service.simulate_demo_payment(payload, current_user=current_user)
    return ResponseEnvelope(
        success=True,
        message=f"Demo payment processed with outcome: {payload.outcome}",
        data=PaymentOut.model_validate(payment)
    )

@router.post("/callback")
async def paytm_callback(request: Request, db: Session = Depends(get_db)):
    """Paytm webhook / browser callback endpoint."""
    form_data = await request.form()
    payload = dict(form_data)
    # Log callback and verify
    order_id = payload.get("ORDERID")
    status_str = "SUCCESS" if payload.get("STATUS") == "TXN_SUCCESS" else "FAILED"
    return {
        "ORDERID": order_id,
        "STATUS": status_str,
        "MESSAGE": "Callback handled"
    }
