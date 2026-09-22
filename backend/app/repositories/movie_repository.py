from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc
from app.models.movie import Movie, Genre, Language, movie_genres, movie_languages
from app.models.show import Show
from app.models.theatre import Theatre
from app.repositories.base import BaseRepository

class MovieRepository(BaseRepository[Movie]):
    def __init__(self, db: Session):
        super().__init__(Movie, db)

    def get_by_id_with_relations(self, movie_id: int) -> Optional[Movie]:
        return (
            self.db.query(Movie)
            .options(joinedload(Movie.genres), joinedload(Movie.languages))
            .filter(Movie.id == movie_id, Movie.is_active == True)
            .first()
        )

    def get_by_slug(self, slug: str) -> Optional[Movie]:
        return (
            self.db.query(Movie)
            .options(joinedload(Movie.genres), joinedload(Movie.languages))
            .filter(Movie.slug == slug, Movie.is_active == True)
            .first()
        )

    def get_filtered_movies(
        self,
        search: Optional[str] = None,
        genre_name: Optional[str] = None,
        language_name: Optional[str] = None,
        rating_min: Optional[float] = None,
        city_id: Optional[int] = None,
        is_trending: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Movie], int]:
        query = self.db.query(Movie).filter(Movie.is_active == True)

        if search:
            search_fmt = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Movie.title.ilike(search_fmt),
                    Movie.description.ilike(search_fmt),
                    Movie.director.ilike(search_fmt),
                    Movie.cast.ilike(search_fmt),
                    Movie.keywords.ilike(search_fmt)
                )
            )

        if genre_name:
            query = query.join(Movie.genres).filter(Genre.name.ilike(genre_name.strip()))

        if language_name:
            query = query.join(Movie.languages).filter(Language.name.ilike(language_name.strip()))

        if rating_min is not None:
            query = query.filter(Movie.rating >= rating_min)

        if is_trending is not None:
            query = query.filter(Movie.is_trending == is_trending)

        if city_id is not None:
            query = query.join(Show, Show.movie_id == Movie.id).join(Theatre, Theatre.id == Show.theatre_id).filter(Theatre.city_id == city_id).distinct()

        total = query.count()
        movies = (
            query.options(joinedload(Movie.genres), joinedload(Movie.languages))
            .order_by(desc(Movie.rating), desc(Movie.release_date))
            .offset(skip)
            .limit(limit)
            .all()
        )
        return movies, total

    def get_trending_movies(self, limit: int = 8) -> List[Movie]:
        return (
            self.db.query(Movie)
            .options(joinedload(Movie.genres), joinedload(Movie.languages))
            .filter(Movie.is_active == True, Movie.is_trending == True)
            .order_by(desc(Movie.rating))
            .limit(limit)
            .all()
        )

    def get_all_genres(self) -> List[Genre]:
        return self.db.query(Genre).order_by(Genre.name).all()

    def get_all_languages(self) -> List[Language]:
        return self.db.query(Language).order_by(Language.name).all()
