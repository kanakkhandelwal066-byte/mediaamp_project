import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.models.booking import Booking, BookingItem
from app.models.show import Show, ShowSeat
from app.models.theatre import Theatre, Screen
from app.models.movie import Movie
from app.models.user import User
from app.repositories.base import BaseRepository

class BookingRepository(BaseRepository[Booking]):
    def __init__(self, db: Session):
        super().__init__(Booking, db)

    def generate_booking_reference(self) -> str:
        unique_suffix = uuid.uuid4().hex[:8].upper()
        year = datetime.now(timezone.utc).year
        return f"CB-{year}-{unique_suffix}"

    def get_by_reference(self, booking_ref: str) -> Optional[Booking]:
        return (
            self.db.query(Booking)
            .options(
                joinedload(Booking.show).joinedload(Show.movie),
                joinedload(Booking.show).joinedload(Show.theatre).joinedload(Theatre.city),
                joinedload(Booking.show).joinedload(Show.screen),
                joinedload(Booking.items),
                joinedload(Booking.payments),
                joinedload(Booking.user)
            )
            .filter(Booking.booking_reference == booking_ref)
            .first()
        )

    def get_by_id_with_relations(self, booking_id: int) -> Optional[Booking]:
        return (
            self.db.query(Booking)
            .options(
                joinedload(Booking.show).joinedload(Show.movie),
                joinedload(Booking.show).joinedload(Show.theatre).joinedload(Theatre.city),
                joinedload(Booking.show).joinedload(Show.screen),
                joinedload(Booking.items),
                joinedload(Booking.payments),
                joinedload(Booking.user)
            )
            .filter(Booking.id == booking_id)
            .first()
        )

    def get_user_bookings(self, user_id: int, skip: int = 0, limit: int = 20) -> List[Booking]:
        return (
            self.db.query(Booking)
            .options(
                joinedload(Booking.show).joinedload(Show.movie),
                joinedload(Booking.show).joinedload(Show.theatre).joinedload(Theatre.city),
                joinedload(Booking.show).joinedload(Show.screen),
                joinedload(Booking.items)
            )
            .filter(Booking.user_id == user_id)
            .order_by(desc(Booking.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_all_bookings_admin(self, skip: int = 0, limit: int = 50) -> Tuple[List[Booking], int]:
        query = (
            self.db.query(Booking)
            .options(
                joinedload(Booking.show).joinedload(Show.movie),
                joinedload(Booking.show).joinedload(Show.theatre),
                joinedload(Booking.user),
                joinedload(Booking.items)
            )
            .order_by(desc(Booking.created_at))
        )
        total = query.count()
        bookings = query.offset(skip).limit(limit).all()
        return bookings, total

    def count_bookings(self) -> int:
        return self.db.query(Booking).count()
