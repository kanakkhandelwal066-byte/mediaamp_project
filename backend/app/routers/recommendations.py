from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.dependencies import get_current_user, get_optional_current_user
from app.models.user import User
from app.ml.inference import RecommendationService
from app.schemas.recommendation import RecommendationResponse, RecommendationItem
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/recommendations", tags=["ML Recommendations"])

@router.get("", response_model=ResponseEnvelope[RecommendationResponse])
def get_recommendations(
    user_id: Optional[int] = Query(None, description="Optional user ID for personalized scoring"),
    top_n: int = Query(6, ge=1, le=20),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Get hybrid AI movie recommendations.
    Uses content similarity (TF-IDF), collaborative item-item patterns, and popularity.
    """
    effective_user_id = user_id or (current_user.id if current_user else None)
    recs = RecommendationService.get_instance().get_recommendations(db, user_id=effective_user_id, top_n=top_n)

    items = [RecommendationItem(**r) for r in recs]
    model_type = "hybrid" if effective_user_id else "popularity_cold_start"

    return ResponseEnvelope(
        success=True,
        message="AI recommendations generated successfully",
        data=RecommendationResponse(recommendations=items, model_type=model_type)
    )

@router.get("/me", response_model=ResponseEnvelope[RecommendationResponse])
def get_my_recommendations(
    top_n: int = Query(6, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Personalized AI recommendations tailored to the logged-in user's bookings and favorites."""
    recs = RecommendationService.get_instance().get_recommendations(db, user_id=current_user.id, top_n=top_n)
    items = [RecommendationItem(**r) for r in recs]

    return ResponseEnvelope(
        success=True,
        message="Personalized recommendations retrieved successfully",
        data=RecommendationResponse(recommendations=items, model_type="hybrid_personalized")
    )
