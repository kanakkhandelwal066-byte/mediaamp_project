from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.movie_service import MovieService
from app.auth.dependencies import get_current_admin
from app.models.user import User
from app.schemas.movie import MovieOut, MovieCreate, MovieUpdate, MovieFilterParams, GenreOut, LanguageOut
from app.schemas.common import ResponseEnvelope, PaginatedData

router = APIRouter(prefix="/movies", tags=["Movies"])

@router.get("", response_model=ResponseEnvelope[PaginatedData[MovieOut]])
def list_movies(
    search: Optional[str] = Query(None, description="Search by title, director, cast, keywords"),
    genre: Optional[str] = Query(None, description="Filter by genre name"),
    language: Optional[str] = Query(None, description="Filter by language"),
    rating_min: Optional[float] = Query(None, description="Minimum rating"),
    city_id: Optional[int] = Query(None, description="Filter movies playing in city"),
    is_trending: Optional[bool] = Query(None, description="Filter trending movies"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List movies with full-text search, multi-faceted filtering, and pagination."""
    params = MovieFilterParams(
        search=search,
        genre=genre,
        language=language,
        rating_min=rating_min,
        city_id=city_id,
        is_trending=is_trending,
        page=page,
        page_size=page_size
    )
    service = MovieService(db)
    movies, total = service.list_movies(params)

    movie_outs = [MovieOut.model_validate(m) for m in movies]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return ResponseEnvelope(
        success=True,
        message="Movies retrieved successfully",
        data=PaginatedData(
            items=movie_outs,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )

@router.get("/trending", response_model=ResponseEnvelope[List[MovieOut]])
def get_trending_movies(limit: int = 8, db: Session = Depends(get_db)):
    """Fetch featured trending movies."""
    service = MovieService(db)
    movies = service.get_trending_movies(limit=limit)
    return ResponseEnvelope(
        success=True,
        message="Trending movies retrieved successfully",
        data=[MovieOut.model_validate(m) for m in movies]
    )

@router.get("/genres", response_model=ResponseEnvelope[List[GenreOut]])
def list_genres(db: Session = Depends(get_db)):
    """List all available movie genres."""
    service = MovieService(db)
    genres = service.get_genres()
    return ResponseEnvelope(
        success=True,
        message="Genres retrieved successfully",
        data=[GenreOut.model_validate(g) for g in genres]
    )

@router.get("/languages", response_model=ResponseEnvelope[List[LanguageOut]])
def list_languages(db: Session = Depends(get_db)):
    """List all available movie languages."""
    service = MovieService(db)
    languages = service.get_languages()
    return ResponseEnvelope(
        success=True,
        message="Languages retrieved successfully",
        data=[LanguageOut.model_validate(l) for l in languages]
    )

@router.get("/{movie_id}", response_model=ResponseEnvelope[MovieOut])
def get_movie_details(movie_id: int, db: Session = Depends(get_db)):
    """Retrieve full details for a single movie."""
    service = MovieService(db)
    movie = service.get_movie_by_id(movie_id)
    return ResponseEnvelope(
        success=True,
        message="Movie details retrieved successfully",
        data=MovieOut.model_validate(movie)
    )

@router.post("", response_model=ResponseEnvelope[MovieOut], status_code=status.HTTP_201_CREATED)
def create_movie(
    payload: MovieCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to create a new movie."""
    service = MovieService(db)
    movie = service.create_movie(payload, admin_user_id=admin_user.id)
    return ResponseEnvelope(
        success=True,
        message="Movie created successfully",
        data=MovieOut.model_validate(movie)
    )

@router.put("/{movie_id}", response_model=ResponseEnvelope[MovieOut])
def update_movie(
    movie_id: int,
    payload: MovieUpdate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to update movie details."""
    service = MovieService(db)
    movie = service.update_movie(movie_id, payload, admin_user_id=admin_user.id)
    return ResponseEnvelope(
        success=True,
        message="Movie updated successfully",
        data=MovieOut.model_validate(movie)
    )

@router.delete("/{movie_id}", response_model=ResponseEnvelope[None])
def delete_movie(
    movie_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to deactivate/soft-delete a movie."""
    service = MovieService(db)
    service.delete_movie(movie_id, admin_user_id=admin_user.id)
    return ResponseEnvelope(
        success=True,
        message="Movie deactivated successfully",
        data=None
    )
