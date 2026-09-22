from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class PaymentInitiateRequest(BaseModel):
    booking_id: int
    provider: str = Field(default="DEMO_GATEWAY", description="PAYTM or DEMO_GATEWAY")
    payment_method: Optional[str] = "UPI"

class PaymentInitiateResponse(BaseModel):
    payment_id: int
    order_id: str
    booking_id: int
    amount: float
    currency: str
    provider: str
    is_mock: bool
    # Gateway specific params (e.g., Paytm txnToken or demo instructions)
    gateway_data: Dict[str, Any]

class PaymentVerifyRequest(BaseModel):
    order_id: str
    transaction_id: Optional[str] = None
    status: str = Field(..., description="SUCCESS, FAILURE, or PENDING")
    response_code: Optional[str] = "01"
    gateway_response: Optional[Dict[str, Any]] = None

class PaymentOut(BaseModel):
    id: int
    booking_id: int
    user_id: int
    amount: float
    currency: str
    provider: str
    transaction_id: Optional[str]
    order_id: str
    status: str
    payment_method: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class DemoPaymentSimulateRequest(BaseModel):
    order_id: str
    outcome: str = Field(..., description="SUCCESS, FAILURE, or PENDING")
