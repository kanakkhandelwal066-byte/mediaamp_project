from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    show_id = Column(Integer, ForeignKey("shows.id"), nullable=False, index=True)
    
    # Financial breakdown (Strictly calculated on backend)
    total_amount = Column(Float, nullable=False)        # Sum of ticket prices
    discount_amount = Column(Float, default=0.0, nullable=False)
    convenience_fee = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    final_amount = Column(Float, nullable=False)        # Total - discount + fee + tax
    
    status = Column(String(20), default="PENDING", nullable=False, index=True) # PENDING, CONFIRMED, CANCELLED, EXPIRED
    qr_code_token = Column(String(100), unique=True, nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="bookings")
    show = relationship("Show", back_populates="bookings")
    items = relationship("BookingItem", back_populates="booking", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")
    coupon_usages = relationship("CouponUsage", back_populates="booking", cascade="all, delete-orphan")

class BookingItem(Base, TimestampMixin):
    __tablename__ = "booking_items"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    show_seat_id = Column(Integer, ForeignKey("show_seats.id"), nullable=False, index=True)
    seat_row = Column(String(5), nullable=False)
    seat_number = Column(Integer, nullable=False)
    seat_tier = Column(String(20), nullable=False)
    price = Column(Float, nullable=False)

    booking = relationship("Booking", back_populates="items")
    show_seat = relationship("ShowSeat", back_populates="booking_items")
