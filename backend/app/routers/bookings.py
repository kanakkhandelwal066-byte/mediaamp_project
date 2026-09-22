from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.booking_service import BookingService
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.booking import BookingCreateRequest, BookingOut, TicketOut
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=ResponseEnvelope[BookingOut], status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initialize booking for locked seats.
    Calculates prices strictly on the backend.
    """
    service = BookingService(db)
    booking = service.create_booking(payload, user_id=current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Booking created successfully",
        data=service.to_booking_out(booking)
    )

@router.get("/me", response_model=ResponseEnvelope[List[BookingOut]])
def get_my_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List bookings made by the authenticated user."""
    service = BookingService(db)
    bookings = service.get_user_bookings(user_id=current_user.id, skip=skip, limit=limit)
    return ResponseEnvelope(
        success=True,
        message="Bookings retrieved successfully",
        data=[service.to_booking_out(b) for b in bookings]
    )

@router.get("/{booking_id}", response_model=ResponseEnvelope[BookingOut])
def get_booking_details(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details for a single booking."""
    service = BookingService(db)
    is_admin = (current_user.role and current_user.role.name == "ADMIN")
    booking = service.get_booking_details(booking_id, current_user_id=current_user.id, is_admin=is_admin)
    return ResponseEnvelope(
        success=True,
        message="Booking details retrieved successfully",
        data=service.to_booking_out(booking)
    )

@router.post("/{booking_id}/cancel", response_model=ResponseEnvelope[BookingOut])
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel an eligible booking and release seats."""
    service = BookingService(db)
    booking = service.cancel_booking(booking_id, user_id=current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Booking cancelled successfully",
        data=service.to_booking_out(booking)
    )

@router.get("/{booking_id}/ticket", response_model=ResponseEnvelope[TicketOut])
def get_ticket(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve cinema ticket with dynamic QR code verification token."""
    service = BookingService(db)
    is_admin = (current_user.role and current_user.role.name == "ADMIN")
    ticket = service.get_ticket(booking_id, current_user_id=current_user.id, is_admin=is_admin)
    return ResponseEnvelope(
        success=True,
        message="Ticket generated successfully",
        data=ticket
    )
