from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.seat_service import SeatService
from app.auth.dependencies import get_current_user, get_optional_current_user
from app.models.user import User
from app.schemas.seat import ShowSeatOut, SeatLockRequest, SeatLockResponse
from app.schemas.common import ResponseEnvelope

router = APIRouter(tags=["Seat Management"])

@router.get("/shows/{show_id}/seats", response_model=ResponseEnvelope[List[ShowSeatOut]])
def get_show_seats(
    show_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Get cinema seating layout and real-time seat status for a showtime.
    Automatically releases expired locks.
    """
    service = SeatService(db)
    user_id = current_user.id if current_user else None
    seats = service.get_show_seats(show_id=show_id, user_id=user_id)
    return ResponseEnvelope(
        success=True,
        message="Seats retrieved successfully",
        data=seats
    )

@router.post("/seats/lock", response_model=ResponseEnvelope[SeatLockResponse])
def lock_seats(
    payload: SeatLockRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Concurrency-safe seat lock endpoint with row-level locks.
    Locks selected seats for 5 minutes (300 seconds).
    Prevents double-booking race conditions.
    """
    service = SeatService(db)
    lock_res = service.lock_seats(payload=payload, user_id=current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Seats locked successfully for 5 minutes",
        data=lock_res
    )
