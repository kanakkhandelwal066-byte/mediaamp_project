from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    movie_id: int
    rating: float = Field(..., ge=1.0, le=10.0)
    title: Optional[str] = Field(None, max_length=150)
    content: str = Field(..., min_length=5)

class ReviewOut(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_avatar: Optional[str] = None
    movie_id: int
    rating: float
    title: Optional[str] = None
    content: str
    is_verified_booking: bool
    created_at: datetime

    class Config:
        from_attributes = True

class RatingCreate(BaseModel):
    movie_id: int
    score: float = Field(..., ge=1.0, le=10.0)
