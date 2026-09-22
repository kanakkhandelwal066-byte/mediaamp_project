from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.coupon_service import CouponService
from app.models.coupon import Coupon
from app.schemas.coupon import CouponValidateRequest, CouponValidateResponse, CouponOut
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/validate", response_model=ResponseEnvelope[CouponValidateResponse])
def validate_coupon(payload: CouponValidateRequest, db: Session = Depends(get_db)):
    """Validate coupon code against order amount and return discount details."""
    service = CouponService(db)
    result = service.validate_coupon_endpoint(payload.code, payload.order_amount)
    return ResponseEnvelope(
        success=True,
        message=result.message,
        data=result
    )

@router.get("", response_model=ResponseEnvelope[List[CouponOut]])
def list_active_coupons(db: Session = Depends(get_db)):
    """List available promotional coupons."""
    coupons = db.query(Coupon).filter(Coupon.is_active == True).all()
    return ResponseEnvelope(
        success=True,
        message="Coupons retrieved successfully",
        data=[CouponOut.model_validate(c) for c in coupons]
    )
