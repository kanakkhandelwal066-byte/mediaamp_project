from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    amount = Column(Float, nullable=False)
    currency = Column(String(5), default="INR", nullable=False)
    provider = Column(String(50), default="PAYTM", nullable=False) # PAYTM, DEMO_GATEWAY
    transaction_id = Column(String(100), unique=True, nullable=True, index=True)
    order_id = Column(String(100), unique=True, nullable=False, index=True)
    
    status = Column(String(20), default="INITIATED", nullable=False, index=True) # INITIATED, PENDING, SUCCESS, FAILED, REFUNDED
    payment_method = Column(String(50), nullable=True) # UPI, WALLET, CARD, NETBANKING, DEMO
    gateway_response = Column(Text, nullable=True)     # JSON serialized gateway payload
    refund_id = Column(String(100), nullable=True)
    refunded_amount = Column(Float, default=0.0)

    booking = relationship("Booking", back_populates="payments")
    user = relationship("User")
