from typing import Optional, List
from pydantic import BaseModel, Field

class CityOut(BaseModel):
    id: int
    name: str
    state: str

    class Config:
        from_attributes = True

class ScreenOut(BaseModel):
    id: int
    theatre_id: int
    screen_number: int
    name: str
    screen_type: str
    total_seats: int

    class Config:
        from_attributes = True

class ScreenCreate(BaseModel):
    theatre_id: int
    screen_number: int
    name: str
    screen_type: str = "2D"
    rows_count: int = 8
    seats_per_row: int = 14

class TheatreBase(BaseModel):
    name: str = Field(..., max_length=150)
    city_id: int
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None

class TheatreCreate(TheatreBase):
    pass

class TheatreUpdate(BaseModel):
    name: Optional[str] = None
    city_id: Optional[int] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class TheatreOut(TheatreBase):
    id: int
    is_active: bool
    city: Optional[CityOut] = None
    screens: List[ScreenOut] = []

    class Config:
        from_attributes = True
