from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ShowBase(BaseModel):
    movie_id: int
    theatre_id: int
    screen_id: int
    start_time: datetime
    end_time: datetime
    base_price: float = Field(..., gt=0)
    format: str = "2D"
    language: str = "English"

class ShowCreate(ShowBase):
    pass

class ShowUpdate(BaseModel):
    movie_id: Optional[int] = None
    theatre_id: Optional[int] = None
    screen_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    base_price: Optional[float] = None
    format: Optional[str] = None
    language: Optional[str] = None
    is_active: Optional[bool] = None

class ShowOut(ShowBase):
    id: int
    movie_title: str
    movie_poster: Optional[str] = None
    theatre_name: str
    theatre_address: Optional[str] = None
    city_name: Optional[str] = None
    screen_name: str
    is_active: bool
    available_seats: Optional[int] = None
    total_seats: Optional[int] = None

    class Config:
        from_attributes = True

class ShowtimeFilterParams(BaseModel):
    movie_id: Optional[int] = None
    theatre_id: Optional[int] = None
    city_id: Optional[int] = None
    date_str: Optional[str] = None # YYYY-MM-DD
