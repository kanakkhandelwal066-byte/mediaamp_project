from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.show import Show
from app.models.theatre import Theatre, Screen
from app.models.movie import Movie
from app.repositories.base import BaseRepository

class ShowRepository(BaseRepository[Show]):
    def __init__(self, db: Session):
        super().__init__(Show, db)

    def get_show_by_id_with_relations(self, show_id: int) -> Optional[Show]:
        return (
            self.db.query(Show)
            .options(
                joinedload(Show.movie),
                joinedload(Show.theatre).joinedload(Theatre.city),
                joinedload(Show.screen)
            )
            .filter(Show.id == show_id, Show.is_active == True)
            .first()
        )

    def get_shows_filtered(
        self,
        movie_id: Optional[int] = None,
        theatre_id: Optional[int] = None,
        city_id: Optional[int] = None,
        start_after: Optional[datetime] = None,
        start_before: Optional[datetime] = None
    ) -> List[Show]:
        query = (
            self.db.query(Show)
            .options(
                joinedload(Show.movie),
                joinedload(Show.theatre).joinedload(Theatre.city),
                joinedload(Show.screen)
            )
            .filter(Show.is_active == True)
        )

        if movie_id:
            query = query.filter(Show.movie_id == movie_id)

        if theatre_id:
            query = query.filter(Show.theatre_id == theatre_id)

        if city_id:
            query = query.join(Show.theatre).filter(Theatre.city_id == city_id)

        if start_after:
            query = query.filter(Show.start_time >= start_after)

        if start_before:
            query = query.filter(Show.start_time <= start_before)

        return query.order_by(Show.start_time).all()

    def count_active_shows(self) -> int:
        return self.db.query(Show).filter(Show.is_active == True).count()
