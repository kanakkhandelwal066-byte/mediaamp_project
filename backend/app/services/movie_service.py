from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.movie import Movie, Genre, Language
from app.repositories.movie_repository import MovieRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.movie import MovieCreate, MovieUpdate, MovieOut, MovieFilterParams, GenreOut, LanguageOut
from app.utils.exceptions import EntityNotFoundException

class MovieService:
    def __init__(self, db: Session):
        self.db = db
        self.movie_repo = MovieRepository(db)
        self.audit_repo = AuditRepository(db)

    def get_movie_by_id(self, movie_id: int) -> Movie:
        movie = self.movie_repo.get_by_id_with_relations(movie_id)
        if not movie:
            raise EntityNotFoundException("Movie", movie_id)
        return movie

    def get_movie_by_slug(self, slug: str) -> Movie:
        movie = self.movie_repo.get_by_slug(slug)
        if not movie:
            raise EntityNotFoundException("Movie", slug)
        return movie

    def list_movies(self, params: MovieFilterParams) -> Tuple[List[Movie], int]:
        skip = (params.page - 1) * params.page_size
        return self.movie_repo.get_filtered_movies(
            search=params.search,
            genre_name=params.genre,
            language_name=params.language,
            rating_min=params.rating_min,
            city_id=params.city_id,
            is_trending=params.is_trending,
            skip=skip,
            limit=params.page_size
        )

    def get_trending_movies(self, limit: int = 8) -> List[Movie]:
        return self.movie_repo.get_trending_movies(limit=limit)

    def get_genres(self) -> List[Genre]:
        return self.movie_repo.get_all_genres()

    def get_languages(self) -> List[Language]:
        return self.movie_repo.get_all_languages()

    def create_movie(self, payload: MovieCreate, admin_user_id: int) -> Movie:
        slug = payload.title.lower().replace(":", "").replace("'", "").replace("-", " ").strip()
        slug = "-".join(slug.split())

        genres = self.db.query(Genre).filter(Genre.id.in_(payload.genre_ids)).all() if payload.genre_ids else []
        languages = self.db.query(Language).filter(Language.id.in_(payload.language_ids)).all() if payload.language_ids else []

        movie = Movie(
            title=payload.title,
            slug=slug,
            description=payload.description,
            duration_minutes=payload.duration_minutes,
            release_date=payload.release_date,
            poster_url=payload.poster_url,
            backdrop_url=payload.backdrop_url,
            trailer_url=payload.trailer_url,
            director=payload.director,
            cast=payload.cast,
            keywords=payload.keywords,
            certification=payload.certification or "UA",
            is_trending=payload.is_trending or False,
            genres=genres,
            languages=languages
        )
        self.movie_repo.create(movie)
        self.db.commit()
        self.db.refresh(movie)

        self.audit_repo.log(
            action="ADMIN_CREATE_MOVIE",
            user_id=admin_user_id,
            entity_type="Movie",
            entity_id=str(movie.id),
            metadata={"title": movie.title}
        )
        self.db.commit()
        return movie

    def update_movie(self, movie_id: int, payload: MovieUpdate, admin_user_id: int) -> Movie:
        movie = self.get_movie_by_id(movie_id)
        update_data = payload.model_dump(exclude_unset=True)

        if "genre_ids" in update_data and update_data["genre_ids"] is not None:
            movie.genres = self.db.query(Genre).filter(Genre.id.in_(update_data["genre_ids"])).all()
            del update_data["genre_ids"]

        if "language_ids" in update_data and update_data["language_ids"] is not None:
            movie.languages = self.db.query(Language).filter(Language.id.in_(update_data["language_ids"])).all()
            del update_data["language_ids"]

        for field, value in update_data.items():
            setattr(movie, field, value)

        self.movie_repo.update(movie)
        self.audit_repo.log(
            action="ADMIN_UPDATE_MOVIE",
            user_id=admin_user_id,
            entity_type="Movie",
            entity_id=str(movie.id)
        )
        self.db.commit()
        self.db.refresh(movie)
        return movie

    def delete_movie(self, movie_id: int, admin_user_id: int) -> None:
        movie = self.get_movie_by_id(movie_id)
        movie.is_active = False # Soft delete
        self.movie_repo.update(movie)
        self.audit_repo.log(
            action="ADMIN_DEACTIVATE_MOVIE",
            user_id=admin_user_id,
            entity_type="Movie",
            entity_id=str(movie.id)
        )
        self.db.commit()
