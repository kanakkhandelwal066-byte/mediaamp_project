from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class Coupon(Base, TimestampMixin):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    discount_type = Column(String(20), default="PERCENTAGE", nullable=False) # PERCENTAGE, FLAT
    discount_value = Column(Float, nullable=False) # e.g. 20 (for 20%) or 100 (for ₹100 flat)
    min_amount = Column(Float, default=0.0, nullable=False)
    max_discount = Column(Float, nullable=True)     # Cap for percentage discounts
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_to = Column(DateTime(timezone=True), nullable=False)
    usage_limit = Column(Integer, default=1000)
    times_used = Column(Integer, default=0)

    usages = relationship("CouponUsage", back_populates="coupon", cascade="all, delete-orphan")

class CouponUsage(Base, TimestampMixin):
    __tablename__ = "coupon_usages"

    id = Column(Integer, primary_key=True, index=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    discount_applied = Column(Float, nullable=False)

    coupon = relationship("Coupon", back_populates="usages")
    user = relationship("User", back_populates="coupon_usages")
    booking = relationship("Booking", back_populates="coupon_usages")
