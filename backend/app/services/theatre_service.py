from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.theatre import City, Theatre, Screen, Seat
from app.repositories.theatre_repository import TheatreRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.theatre import TheatreCreate, TheatreUpdate, ScreenCreate
from app.utils.exceptions import EntityNotFoundException

class TheatreService:
    def __init__(self, db: Session):
        self.db = db
        self.theatre_repo = TheatreRepository(db)
        self.audit_repo = AuditRepository(db)

    def get_cities(self) -> List[City]:
        return self.theatre_repo.get_cities()

    def get_theatres(self, city_id: Optional[int] = None) -> List[Theatre]:
        return self.theatre_repo.get_theatres_by_city(city_id)

    def get_theatre_by_id(self, theatre_id: int) -> Theatre:
        theatre = self.theatre_repo.get_theatre_with_screens(theatre_id)
        if not theatre:
            raise EntityNotFoundException("Theatre", theatre_id)
        return theatre

    def create_theatre(self, payload: TheatreCreate, admin_user_id: int) -> Theatre:
        city = self.theatre_repo.get_city_by_id(payload.city_id)
        if not city:
            raise EntityNotFoundException("City", payload.city_id)

        theatre = Theatre(
            name=payload.name,
            city_id=payload.city_id,
            address=payload.address,
            latitude=payload.latitude,
            longitude=payload.longitude,
            phone=payload.phone
        )
        self.theatre_repo.create(theatre)
        self.db.commit()
        self.db.refresh(theatre)

        self.audit_repo.log(
            action="ADMIN_CREATE_THEATRE",
            user_id=admin_user_id,
            entity_type="Theatre",
            entity_id=str(theatre.id),
            metadata={"name": theatre.name}
        )
        self.db.commit()
        return theatre

    def add_screen_to_theatre(self, payload: ScreenCreate, admin_user_id: int) -> Screen:
        theatre = self.get_theatre_by_id(payload.theatre_id)

        screen = Screen(
            theatre_id=theatre.id,
            screen_number=payload.screen_number,
            name=payload.name,
            screen_type=payload.screen_type,
            total_seats=payload.rows_count * payload.seats_per_row
        )
        self.db.add(screen)
        self.db.flush()

        # Generate seats for the screen
        rows = [chr(65 + i) for i in range(payload.rows_count)] # A, B, C...
        for r_idx, row_letter in enumerate(rows):
            if r_idx < 3:
                tier, mult = "STANDARD", 1.0
            elif r_idx < 6:
                tier, mult = "PREMIUM", 1.4
            else:
                tier, mult = "VIP", 2.0

            for seat_num in range(1, payload.seats_per_row + 1):
                seat = Seat(
                    screen_id=screen.id,
                    row=row_letter,
                    seat_number=seat_num,
                    tier=tier,
                    price_multiplier=mult
                )
                self.db.add(seat)

        self.db.commit()
        self.db.refresh(screen)

        self.audit_repo.log(
            action="ADMIN_CREATE_SCREEN",
            user_id=admin_user_id,
            entity_type="Screen",
            entity_id=str(screen.id),
            metadata={"theatre": theatre.name, "seats": screen.total_seats}
        )
        self.db.commit()
        return screen
