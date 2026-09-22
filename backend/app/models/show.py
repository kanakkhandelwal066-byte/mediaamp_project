from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class Show(Base, TimestampMixin):
    __tablename__ = "shows"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False, index=True)
    theatre_id = Column(Integer, ForeignKey("theatres.id"), nullable=False, index=True)
    screen_id = Column(Integer, ForeignKey("screens.id"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)
    base_price = Column(Float, nullable=False, default=250.0)
    format = Column(String(50), default="2D", nullable=False) # 2D, 3D, IMAX 3D, 4DX
    language = Column(String(50), default="English", nullable=False)

    movie = relationship("Movie", back_populates="shows")
    theatre = relationship("Theatre", back_populates="shows")
    screen = relationship("Screen", back_populates="shows")
    show_seats = relationship("ShowSeat", back_populates="show", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="show", cascade="all, delete-orphan")

class ShowSeat(Base, TimestampMixin):
    __tablename__ = "show_seats"

    id = Column(Integer, primary_key=True, index=True)
    show_id = Column(Integer, ForeignKey("shows.id"), nullable=False, index=True)
    seat_id = Column(Integer, ForeignKey("seats.id"), nullable=False, index=True)
    status = Column(String(20), default="AVAILABLE", nullable=False, index=True) # AVAILABLE, LOCKED, BOOKED
    locked_until = Column(DateTime(timezone=True), nullable=True)
    locked_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    price = Column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("show_id", "seat_id", name="uq_show_seat"),
    )

    show = relationship("Show", back_populates="show_seats")
    seat = relationship("Seat", back_populates="show_seats")
    booking_items = relationship("BookingItem", back_populates="show_seat")
