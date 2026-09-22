from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class CouponValidateRequest(BaseModel):
    code: str
    order_amount: float = Field(..., gt=0)

class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_amount: float
    discount_type: str
    message: str

class CouponOut(BaseModel):
    id: int
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_amount: float
    max_discount: Optional[float] = None
    valid_to: datetime
    is_active: bool

    class Config:
        from_attributes = True
