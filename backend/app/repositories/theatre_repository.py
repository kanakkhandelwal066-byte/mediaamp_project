from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.theatre import City, Theatre, Screen, Seat
from app.repositories.base import BaseRepository

class TheatreRepository(BaseRepository[Theatre]):
    def __init__(self, db: Session):
        super().__init__(Theatre, db)

    def get_cities(self) -> List[City]:
        return self.db.query(City).filter(City.is_active == True).order_by(City.name).all()

    def get_city_by_id(self, city_id: int) -> Optional[City]:
        return self.db.query(City).filter(City.id == city_id).first()

    def get_theatres_by_city(self, city_id: Optional[int] = None) -> List[Theatre]:
        query = self.db.query(Theatre).options(joinedload(Theatre.city), joinedload(Theatre.screens)).filter(Theatre.is_active == True)
        if city_id:
            query = query.filter(Theatre.city_id == city_id)
        return query.order_by(Theatre.name).all()

    def get_theatre_with_screens(self, theatre_id: int) -> Optional[Theatre]:
        return (
            self.db.query(Theatre)
            .options(joinedload(Theatre.city), joinedload(Theatre.screens))
            .filter(Theatre.id == theatre_id, Theatre.is_active == True)
            .first()
        )

    def get_screen_by_id(self, screen_id: int) -> Optional[Screen]:
        return self.db.query(Screen).filter(Screen.id == screen_id).first()

    def count_theatres(self) -> int:
        return self.db.query(Theatre).filter(Theatre.is_active == True).count()
