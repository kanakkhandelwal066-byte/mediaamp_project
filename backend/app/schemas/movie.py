from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class GenreOut(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True

class LanguageOut(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True

class MovieBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    duration_minutes: int = Field(..., gt=0)
    release_date: date
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    trailer_url: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    keywords: Optional[str] = None
    certification: Optional[str] = "UA"
    is_trending: Optional[bool] = False

class MovieCreate(MovieBase):
    genre_ids: List[int] = []
    language_ids: List[int] = []

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    release_date: Optional[date] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    trailer_url: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    keywords: Optional[str] = None
    certification: Optional[str] = None
    is_trending: Optional[bool] = None
    genre_ids: Optional[List[int]] = None
    language_ids: Optional[List[int]] = None

class MovieOut(MovieBase):
    id: int
    slug: str
    rating: float
    vote_count: int
    is_active: bool
    created_at: datetime
    genres: List[GenreOut] = []
    languages: List[LanguageOut] = []

    class Config:
        from_attributes = True

class MovieFilterParams(BaseModel):
    search: Optional[str] = None
    genre: Optional[str] = None
    language: Optional[str] = None
    rating_min: Optional[float] = None
    city_id: Optional[int] = None
    is_trending: Optional[bool] = None
    page: int = 1
    page_size: int = 20
