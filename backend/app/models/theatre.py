from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class City(Base, TimestampMixin):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    state = Column(String(100), nullable=False)
    
    theatres = relationship("Theatre", back_populates="city", cascade="all, delete-orphan")

class Theatre(Base, TimestampMixin):
    __tablename__ = "theatres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    address = Column(String(300), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String(20), nullable=True)

    city = relationship("City", back_populates="theatres")
    screens = relationship("Screen", back_populates="theatre", cascade="all, delete-orphan")
    shows = relationship("Show", back_populates="theatre", cascade="all, delete-orphan")

class Screen(Base, TimestampMixin):
    __tablename__ = "screens"

    id = Column(Integer, primary_key=True, index=True)
    theatre_id = Column(Integer, ForeignKey("theatres.id"), nullable=False, index=True)
    screen_number = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)  # Screen 1, Audi 2 - IMAX
    screen_type = Column(String(50), default="2D", nullable=False)  # 2D, IMAX 3D, 4DX, Dolby Atmos
    total_seats = Column(Integer, default=0)

    __table_args__ = (
        UniqueConstraint("theatre_id", "screen_number", name="uq_theatre_screen_number"),
    )

    theatre = relationship("Theatre", back_populates="screens")
    seats = relationship("Seat", back_populates="screen", cascade="all, delete-orphan")
    shows = relationship("Show", back_populates="screen", cascade="all, delete-orphan")

class Seat(Base, TimestampMixin):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, index=True)
    screen_id = Column(Integer, ForeignKey("screens.id"), nullable=False, index=True)
    row = Column(String(5), nullable=False)           # 'A', 'B', 'C'
    seat_number = Column(Integer, nullable=False)      # 1, 2, 3 ...
    tier = Column(String(20), default="STANDARD", nullable=False) # STANDARD, PREMIUM, VIP
    price_multiplier = Column(Float, default=1.0, nullable=False) # 1.0 standard, 1.4 premium, 2.0 VIP

    __table_args__ = (
        UniqueConstraint("screen_id", "row", "seat_number", name="uq_screen_row_seat"),
    )

    screen = relationship("Screen", back_populates="seats")
    show_seats = relationship("ShowSeat", back_populates="seat", cascade="all, delete-orphan")
