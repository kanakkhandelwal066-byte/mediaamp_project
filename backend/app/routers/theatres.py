from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.theatre_service import TheatreService
from app.auth.dependencies import get_current_admin
from app.models.user import User
from app.schemas.theatre import TheatreOut, TheatreCreate, CityOut, ScreenOut, ScreenCreate
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/theatres", tags=["Theatres"])

@router.get("/cities", response_model=ResponseEnvelope[List[CityOut]])
def list_cities(db: Session = Depends(get_db)):
    """List all available cities."""
    service = TheatreService(db)
    cities = service.get_cities()
    return ResponseEnvelope(
        success=True,
        message="Cities retrieved successfully",
        data=[CityOut.model_validate(c) for c in cities]
    )

@router.get("", response_model=ResponseEnvelope[List[TheatreOut]])
def list_theatres(
    city_id: Optional[int] = Query(None, description="Filter theatres by city ID"),
    db: Session = Depends(get_db)
):
    """List theatres, optionally filtered by city."""
    service = TheatreService(db)
    theatres = service.get_theatres(city_id=city_id)
    return ResponseEnvelope(
        success=True,
        message="Theatres retrieved successfully",
        data=[TheatreOut.model_validate(t) for t in theatres]
    )

@router.get("/{theatre_id}", response_model=ResponseEnvelope[TheatreOut])
def get_theatre_details(theatre_id: int, db: Session = Depends(get_db)):
    """Get theatre details including its screens."""
    service = TheatreService(db)
    theatre = service.get_theatre_by_id(theatre_id)
    return ResponseEnvelope(
        success=True,
        message="Theatre details retrieved successfully",
        data=TheatreOut.model_validate(theatre)
    )

@router.post("", response_model=ResponseEnvelope[TheatreOut], status_code=status.HTTP_201_CREATED)
def create_theatre(
    payload: TheatreCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to create a new theatre."""
    service = TheatreService(db)
    theatre = service.create_theatre(payload, admin_user_id=admin_user.id)
    return ResponseEnvelope(
        success=True,
        message="Theatre created successfully",
        data=TheatreOut.model_validate(theatre)
    )

@router.post("/screens", response_model=ResponseEnvelope[ScreenOut], status_code=status.HTTP_201_CREATED)
def add_screen_to_theatre(
    payload: ScreenCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to add a screen and auto-configure seats."""
    service = TheatreService(db)
    screen = service.add_screen_to_theatre(payload, admin_user_id=admin_user.id)
    return ResponseEnvelope(
        success=True,
        message="Screen configured successfully",
        data=ScreenOut.model_validate(screen)
    )
