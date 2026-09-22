from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from app.models.show import ShowSeat, Show
from app.models.theatre import Seat
from app.utils.exceptions import SeatUnavailableException, DoubleBookingException, SeatLockExpiredException
from app.utils.datetime_utils import is_past, is_future
import logging

logger = logging.getLogger("cinebook.seats")

class SeatRepository:
    def __init__(self, db: Session):
        self.db = db

    def release_expired_locks(self, show_id: Optional[int] = None) -> int:
        """Release any seats whose 5-minute lock has expired."""
        now = datetime.now(timezone.utc)
        is_sqlite = (self.db.bind and self.db.bind.dialect.name == "sqlite")
        now_query = now.replace(tzinfo=None) if is_sqlite else now

        query = self.db.query(ShowSeat).filter(
            ShowSeat.status == "LOCKED",
            ShowSeat.locked_until != None,
            ShowSeat.locked_until < now_query
        )
        if show_id:
            query = query.filter(ShowSeat.show_id == show_id)

        expired_seats = query.all()
        count = len(expired_seats)
        if count > 0:
            for seat in expired_seats:
                seat.status = "AVAILABLE"
                seat.locked_until = None
                seat.locked_by_user_id = None
            self.db.flush()
            logger.info(f"Released {count} expired seat locks")
        return count

    def get_show_seats(self, show_id: int, current_user_id: Optional[int] = None) -> List[dict]:
        """Fetch all seats for a show with real-time status and lock ownership."""
        self.release_expired_locks(show_id)

        show_seats = (
            self.db.query(ShowSeat)
            .options(joinedload(ShowSeat.seat))
            .filter(ShowSeat.show_id == show_id)
            .all()
        )

        result = []
        for ss in show_seats:
            status = ss.status
            # In-memory check in case lock just expired
            if status == "LOCKED" and ss.locked_until and is_past(ss.locked_until):
                status = "AVAILABLE"

            is_locked_by_me = (
                current_user_id is not None
                and ss.locked_by_user_id == current_user_id
                and status == "LOCKED"
            )

            result.append({
                "id": ss.id,
                "show_id": ss.show_id,
                "seat_id": ss.seat_id,
                "row": ss.seat.row,
                "seat_number": ss.seat.seat_number,
                "tier": ss.seat.tier,
                "price": ss.price,
                "status": status,
                "is_locked_by_me": is_locked_by_me,
                "locked_until": ss.locked_until
            })

        # Sort by row and seat number
        result.sort(key=lambda x: (x["row"], x["seat_number"]))
        return result

    def lock_seats(
        self,
        show_id: int,
        seat_ids: List[int],
        user_id: int,
        lock_seconds: int = 300
    ) -> List[ShowSeat]:
        """
        Concurrency-safe atomic seat locking using row-level locks (with_for_update).
        Prevents race conditions when two users select the same seat simultaneously.
        """
        self.release_expired_locks(show_id)
        now = datetime.now(timezone.utc)

        # Row-level lock on show_seats
        seats_to_lock = (
            self.db.query(ShowSeat)
            .options(joinedload(ShowSeat.seat))
            .filter(
                ShowSeat.show_id == show_id,
                ShowSeat.seat_id.in_(seat_ids)
            )
            .with_for_update()
            .all()
        )

        if len(seats_to_lock) != len(seat_ids):
            found_ids = {s.seat_id for s in seats_to_lock}
            missing_ids = set(seat_ids) - found_ids
            raise SeatUnavailableException(f"Seat IDs {list(missing_ids)} do not exist for this show.")

        expires_at = now + timedelta(seconds=lock_seconds)
        conflicted_seats = []

        for ss in seats_to_lock:
            if ss.status == "BOOKED":
                conflicted_seats.append(f"{ss.seat.row}{ss.seat.seat_number} (already booked)")
            elif ss.status == "LOCKED":
                # Check if locked by someone else and not expired
                if ss.locked_by_user_id != user_id and ss.locked_until and is_future(ss.locked_until):
                    conflicted_seats.append(f"{ss.seat.row}{ss.seat.seat_number} (reserved by another user)")

        if conflicted_seats:
            conflict_msg = ", ".join(conflicted_seats)
            logger.warning(f"Double-booking conflict for user {user_id}: {conflict_msg}")
            raise DoubleBookingException(f"Cannot lock seats: {conflict_msg}")

        # All seats are available for this user - lock them atomically
        for ss in seats_to_lock:
            ss.status = "LOCKED"
            ss.locked_until = expires_at
            ss.locked_by_user_id = user_id

        self.db.flush()
        logger.info(f"Successfully locked {len(seats_to_lock)} seats for user {user_id} until {expires_at}")
        return seats_to_lock

    def transition_locked_to_booked(
        self,
        show_id: int,
        seat_ids: List[int],
        user_id: int
    ) -> List[ShowSeat]:
        """
        Transitions LOCKED seats to BOOKED upon successful payment verification.
        Uses row-level locking for atomic state transition.
        """
        seats = (
            self.db.query(ShowSeat)
            .filter(
                ShowSeat.show_id == show_id,
                ShowSeat.seat_id.in_(seat_ids)
            )
            .with_for_update()
            .all()
        )

        for ss in seats:
            if ss.status == "BOOKED":
                continue # already booked
            if ss.status != "LOCKED" or ss.locked_by_user_id != user_id:
                raise SeatUnavailableException(f"Seat {ss.seat_id} is not properly locked by this user.")
            if ss.locked_until and is_past(ss.locked_until):
                raise SeatLockExpiredException(f"Lock on seat {ss.seat_id} expired before payment was verified.")

            ss.status = "BOOKED"
            ss.locked_until = None

        self.db.flush()
        return seats

    def release_user_locks(self, show_id: int, seat_ids: List[int], user_id: int) -> None:
        """Release locks back to AVAILABLE on cancellation or payment failure."""
        seats = (
            self.db.query(ShowSeat)
            .filter(
                ShowSeat.show_id == show_id,
                ShowSeat.seat_id.in_(seat_ids),
                ShowSeat.locked_by_user_id == user_id
            )
            .all()
        )
        for ss in seats:
            if ss.status == "LOCKED":
                ss.status = "AVAILABLE"
                ss.locked_until = None
                ss.locked_by_user_id = None
        self.db.flush()
