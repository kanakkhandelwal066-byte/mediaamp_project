from datetime import datetime, date, time, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.show import Show, ShowSeat
from app.models.theatre import Seat, Screen
from app.repositories.show_repository import ShowRepository
from app.repositories.movie_repository import MovieRepository
from app.repositories.theatre_repository import TheatreRepository
from app.repositories.seat_repository import SeatRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.show import ShowCreate, ShowUpdate, ShowtimeFilterParams
from app.utils.exceptions import EntityNotFoundException, CineBookException

class ShowService:
    def __init__(self, db: Session):
        self.db = db
        self.show_repo = ShowRepository(db)
        self.movie_repo = MovieRepository(db)
        self.theatre_repo = TheatreRepository(db)
        self.seat_repo = SeatRepository(db)
        self.audit_repo = AuditRepository(db)

    def get_show_by_id(self, show_id: int) -> Show:
        show = self.show_repo.get_show_by_id_with_relations(show_id)
        if not show:
            raise EntityNotFoundException("Show", show_id)
        return show

    def list_shows(self, params: ShowtimeFilterParams) -> List[Show]:
        start_after = None
        start_before = None

        if params.date_str:
            try:
                target_date = datetime.strptime(params.date_str, "%Y-%m-%d").date()
                start_after = datetime.combine(target_date, time.min).replace(tzinfo=timezone.utc)
                start_before = datetime.combine(target_date, time.max).replace(tzinfo=timezone.utc)
            except ValueError:
                raise CineBookException("Invalid date format. Use YYYY-MM-DD", status_code=400)

        return self.show_repo.get_shows_filtered(
            movie_id=params.movie_id,
            theatre_id=params.theatre_id,
            city_id=params.city_id,
            start_after=start_after,
            start_before=start_before
        )

    def create_show(self, payload: ShowCreate, admin_user_id: int) -> Show:
        movie = self.movie_repo.get_by_id(payload.movie_id)
        if not movie:
            raise EntityNotFoundException("Movie", payload.movie_id)

        theatre = self.theatre_repo.get_by_id(payload.theatre_id)
        if not theatre:
            raise EntityNotFoundException("Theatre", payload.theatre_id)

        screen = self.theatre_repo.get_screen_by_id(payload.screen_id)
        if not screen or screen.theatre_id != theatre.id:
            raise CineBookException("Invalid screen for the specified theatre", status_code=400)

        show = Show(
            movie_id=payload.movie_id,
            theatre_id=payload.theatre_id,
            screen_id=payload.screen_id,
            start_time=payload.start_time,
            end_time=payload.end_time,
            base_price=payload.base_price,
            format=payload.format or screen.screen_type,
            language=payload.language or (movie.languages[0].name if movie.languages else "English")
        )
        self.show_repo.create(show)
        self.db.flush()

        # Populate ShowSeats from Screen Seats
        screen_seats = self.db.query(Seat).filter(Seat.screen_id == screen.id).all()
        for s in screen_seats:
            price = round(payload.base_price * s.price_multiplier, 2)
            show_seat = ShowSeat(
                show_id=show.id,
                seat_id=s.id,
                status="AVAILABLE",
                price=price
            )
            self.db.add(show_seat)

        self.db.commit()
        self.db.refresh(show)

        self.audit_repo.log(
            action="ADMIN_CREATE_SHOW",
            user_id=admin_user_id,
            entity_type="Show",
            entity_id=str(show.id),
            metadata={"movie": movie.title, "theatre": theatre.name, "start_time": str(show.start_time)}
        )
        self.db.commit()
        return show

    def cancel_show(self, show_id: int, admin_user_id: int) -> Show:
        show = self.get_show_by_id(show_id)
        show.is_active = False
        self.show_repo.update(show)

        self.audit_repo.log(
            action="ADMIN_CANCEL_SHOW",
            user_id=admin_user_id,
            entity_type="Show",
            entity_id=str(show.id)
        )
        self.db.commit()
        return show
