from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.coupon import Coupon, CouponUsage
from app.repositories.base import BaseRepository

class CouponRepository(BaseRepository[Coupon]):
    def __init__(self, db: Session):
        super().__init__(Coupon, db)

    def get_valid_coupon_by_code(self, code: str) -> Optional[Coupon]:
        now = datetime.now(timezone.utc)
        return (
            self.db.query(Coupon)
            .filter(
                Coupon.code == code.upper().strip(),
                Coupon.is_active == True,
                Coupon.valid_from <= now,
                Coupon.valid_to >= now,
                Coupon.times_used < Coupon.usage_limit
            )
            .first()
        )

    def record_usage(self, coupon_id: int, user_id: int, booking_id: int, discount_applied: float) -> CouponUsage:
        coupon = self.get_by_id(coupon_id)
        if coupon:
            coupon.times_used += 1

        usage = CouponUsage(
            coupon_id=coupon_id,
            user_id=user_id,
            booking_id=booking_id,
            discount_applied=discount_applied
        )
        self.db.add(usage)
        self.db.flush()
        return usage
