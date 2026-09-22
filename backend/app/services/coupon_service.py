from typing import Tuple
from sqlalchemy.orm import Session
from app.repositories.coupon_repository import CouponRepository
from app.models.coupon import Coupon
from app.schemas.coupon import CouponValidateResponse
from app.utils.exceptions import InvalidCouponException

class CouponService:
    def __init__(self, db: Session):
        self.db = db
        self.coupon_repo = CouponRepository(db)

    def validate_and_calculate_discount(self, code: str, order_amount: float) -> Tuple[Coupon, float]:
        """Strictly validate coupon and return (coupon_model, calculated_discount)."""
        coupon = self.coupon_repo.get_valid_coupon_by_code(code)
        if not coupon:
            raise InvalidCouponException("Invalid or expired coupon code")

        if order_amount < coupon.min_amount:
            raise InvalidCouponException(f"Minimum order amount of ₹{coupon.min_amount:.2f} required for coupon {coupon.code}")

        if coupon.discount_type == "PERCENTAGE":
            discount = (coupon.discount_value / 100.0) * order_amount
            if coupon.max_discount is not None:
                discount = min(discount, coupon.max_discount)
        else: # FLAT
            discount = min(coupon.discount_value, order_amount)

        discount = round(discount, 2)
        return coupon, discount

    def validate_coupon_endpoint(self, code: str, order_amount: float) -> CouponValidateResponse:
        coupon, discount = self.validate_and_calculate_discount(code, order_amount)
        return CouponValidateResponse(
            valid=True,
            code=coupon.code,
            discount_amount=discount,
            discount_type=coupon.discount_type,
            message=f"Coupon applied successfully! You saved ₹{discount:.2f}"
        )
