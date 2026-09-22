from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.dependencies import get_current_admin
from app.models.user import User
from app.models.system import AuditLog
from app.services.admin_analytics_service import AdminAnalyticsService
from app.services.booking_service import BookingService
from app.repositories.user_repository import UserRepository
from app.repositories.booking_repository import BookingRepository
from app.schemas.analytics import AdminAnalyticsResponse
from app.schemas.booking import BookingOut
from app.schemas.auth import UserOut
from app.schemas.common import ResponseEnvelope, PaginatedData

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/analytics", response_model=ResponseEnvelope[AdminAnalyticsResponse])
def get_admin_analytics(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve full analytics payload for admin metrics and visualization charts."""
    service = AdminAnalyticsService(db)
    analytics = service.get_analytics()
    return ResponseEnvelope(
        success=True,
        message="Analytics retrieved successfully",
        data=analytics
    )

@router.get("/bookings", response_model=ResponseEnvelope[PaginatedData[BookingOut]])
def get_all_bookings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin view for all customer bookings across the platform."""
    booking_repo = BookingRepository(db)
    booking_service = BookingService(db)

    skip = (page - 1) * page_size
    bookings, total = booking_repo.get_all_bookings_admin(skip=skip, limit=page_size)

    items = [booking_service.to_booking_out(b) for b in bookings]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return ResponseEnvelope(
        success=True,
        message="Bookings retrieved successfully",
        data=PaginatedData(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )

@router.get("/users", response_model=ResponseEnvelope[List[UserOut]])
def get_users_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to inspect registered users."""
    user_repo = UserRepository(db)
    users = user_repo.get_all_users(skip=skip, limit=limit)
    return ResponseEnvelope(
        success=True,
        message="Users retrieved successfully",
        data=[
            UserOut(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                phone=u.phone,
                role=u.role.name if u.role else "USER",
                avatar_url=u.avatar_url,
                created_at=u.created_at
            )
            for u in users
        ]
    )
