from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.show_service import ShowService
from app.auth.dependencies import get_current_admin
from app.models.user import User
from app.schemas.show import ShowOut, ShowCreate, ShowtimeFilterParams
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/shows", tags=["Shows"])

def _to_show_out(s) -> ShowOut:
    avail_count = sum(1 for ss in s.show_seats if ss.status == "AVAILABLE") if s.show_seats else 0
    total_count = len(s.show_seats) if s.show_seats else 0
    return ShowOut(
        id=s.id,
        movie_id=s.movie_id,
        movie_title=s.movie.title if s.movie else "",
        movie_poster=s.movie.poster_url if s.movie else None,
        theatre_id=s.theatre_id,
        theatre_name=s.theatre.name if s.theatre else "",
        theatre_address=s.theatre.address if s.theatre else None,
        city_name=s.theatre.city.name if s.theatre and s.theatre.city else None,
        screen_id=s.screen_id,
        screen_name=s.screen.name if s.screen else "",
        start_time=s.start_time,
        end_time=s.end_time,
        base_price=s.base_price,
        format=s.format,
        language=s.language,
        is_active=s.is_active,
        available_seats=avail_count,
        total_seats=total_count
    )

@router.get("", response_model=ResponseEnvelope[List[ShowOut]])
def list_shows(
    movie_id: Optional[int] = Query(None, description="Filter by movie ID"),
    theatre_id: Optional[int] = Query(None, description="Filter by theatre ID"),
    city_id: Optional[int] = Query(None, description="Filter by city ID"),
    date_str: Optional[str] = Query(None, description="Filter date in YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """Retrieve scheduled showtimes with optional filters."""
    params = ShowtimeFilterParams(
        movie_id=movie_id,
        theatre_id=theatre_id,
        city_id=city_id,
        date_str=date_str
    )
    service = ShowService(db)
    shows = service.list_shows(params)
    return ResponseEnvelope(
        success=True,
        message="Shows retrieved successfully",
        data=[_to_show_out(s) for s in shows]
    )

@router.get("/{show_id}", response_model=ResponseEnvelope[ShowOut])
def get_show_details(show_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single showtime."""
    service = ShowService(db)
    show = service.get_show_by_id(show_id)
    return ResponseEnvelope(
        success=True,
        message="Show details retrieved successfully",
        data=_to_show_out(show)
    )

@router.post("", response_model=ResponseEnvelope[ShowOut], status_code=status.HTTP_201_CREATED)
def create_show(
    payload: ShowCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to schedule a show and initialize seats."""
    service = ShowService(db)
    show = service.create_show(payload, admin_user_id=admin_user.id)
    return ResponseEnvelope(
        success=True,
        message="Show scheduled successfully",
        data=_to_show_out(show)
    )

@router.delete("/{show_id}", response_model=ResponseEnvelope[None])
def cancel_show(
    show_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to cancel a show."""
    service = ShowService(db)
    service.cancel_show(show_id, admin_user_id=admin_user.id)
    return ResponseEnvelope(
        success=True,
        message="Show cancelled successfully",
        data=None
    )
