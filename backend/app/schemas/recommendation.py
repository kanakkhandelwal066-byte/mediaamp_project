from typing import List, Optional
from pydantic import BaseModel

class RecommendationItem(BaseModel):
    movie_id: int
    title: str
    slug: str
    poster_url: Optional[str] = None
    rating: float
    duration_minutes: int
    genres: List[str] = []
    score: float
    reason: str

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    model_type: str = "hybrid" # hybrid, content, collaborative, popularity_cold_start
