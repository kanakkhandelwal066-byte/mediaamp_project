from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.repositories.seat_repository import SeatRepository
from app.repositories.show_repository import ShowRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.seat import ShowSeatOut, SeatLockRequest, SeatLockResponse
from app.utils.exceptions import EntityNotFoundException, CineBookException

class SeatService:
    def __init__(self, db: Session):
        self.db = db
        self.seat_repo = SeatRepository(db)
        self.show_repo = ShowRepository(db)
        self.audit_repo = AuditRepository(db)

    def get_show_seats(self, show_id: int, user_id: Optional[int] = None) -> List[ShowSeatOut]:
        show = self.show_repo.get_by_id(show_id)
        if not show:
            raise EntityNotFoundException("Show", show_id)

        raw_seats = self.seat_repo.get_show_seats(show_id, current_user_id=user_id)
        return [ShowSeatOut(**s) for s in raw_seats]

    def lock_seats(self, payload: SeatLockRequest, user_id: int) -> SeatLockResponse:
        show = self.show_repo.get_by_id(payload.show_id)
        if not show:
            raise EntityNotFoundException("Show", payload.show_id)
        if not show.is_active:
            raise CineBookException("This show is not active", status_code=400)

        # Concurrency-safe atomic lock with row-level locks
        locked_seats = self.seat_repo.lock_seats(
            show_id=payload.show_id,
            seat_ids=payload.seat_ids,
            user_id=user_id,
            lock_seconds=settings.SEAT_LOCK_TIMEOUT_SECONDS
        )

        self.db.commit()

        # Calculate subtotal
        subtotal = sum(s.price for s in locked_seats)
        expires_at = locked_seats[0].locked_until

        self.audit_repo.log(
            action="SEATS_LOCKED",
            user_id=user_id,
            entity_type="Show",
            entity_id=str(payload.show_id),
            metadata={"seat_ids": payload.seat_ids, "subtotal": subtotal}
        )
        self.db.commit()

        return SeatLockResponse(
            show_id=payload.show_id,
            locked_seat_ids=payload.seat_ids,
            lock_expires_at=expires_at,
            expires_in_seconds=settings.SEAT_LOCK_TIMEOUT_SECONDS,
            subtotal=round(subtotal, 2)
        )
