from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, joinedload
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.social import Review, Rating
from app.models.movie import Movie
from app.schemas.social import ReviewCreate, ReviewOut
from app.schemas.common import ResponseEnvelope
from app.utils.exceptions import EntityNotFoundException

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])

@router.get("/movie/{movie_id}", response_model=ResponseEnvelope[List[ReviewOut]])
def get_movie_reviews(movie_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a movie."""
    reviews = (
        db.query(Review)
        .options(joinedload(Review.user))
        .filter(Review.movie_id == movie_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    results = [
        ReviewOut(
            id=r.id,
            user_id=r.user_id,
            user_name=r.user.full_name if r.user else "User",
            user_avatar=r.user.avatar_url if r.user else None,
            movie_id=r.movie_id,
            rating=r.rating,
            title=r.title,
            content=r.content,
            is_verified_booking=r.is_verified_booking,
            created_at=r.created_at
        )
        for r in reviews
    ]
    return ResponseEnvelope(
        success=True,
        message="Reviews retrieved successfully",
        data=results
    )

@router.post("", response_model=ResponseEnvelope[ReviewOut], status_code=status.HTTP_201_CREATED)
def add_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a rating and review for a movie."""
    movie = db.query(Movie).filter(Movie.id == payload.movie_id).first()
    if not movie:
        raise EntityNotFoundException("Movie", payload.movie_id)

    # Check if rating already exists, update or create
    existing_rating = db.query(Rating).filter(Rating.user_id == current_user.id, Rating.movie_id == movie.id).first()
    if existing_rating:
        existing_rating.score = payload.rating
    else:
        db.add(Rating(user_id=current_user.id, movie_id=movie.id, score=payload.rating))

    review = Review(
        user_id=current_user.id,
        movie_id=movie.id,
        rating=payload.rating,
        title=payload.title,
        content=payload.content,
        is_verified_booking=True
    )
    db.add(review)

    # Recalculate movie average rating
    all_ratings = db.query(Rating.score).filter(Rating.movie_id == movie.id).all()
    if all_ratings:
        scores = [r[0] for r in all_ratings]
        movie.rating = round(sum(scores) / len(scores), 1)
        movie.vote_count = len(scores)

    db.commit()
    db.refresh(review)

    return ResponseEnvelope(
        success=True,
        message="Review added successfully",
        data=ReviewOut(
            id=review.id,
            user_id=current_user.id,
            user_name=current_user.full_name,
            user_avatar=current_user.avatar_url,
            movie_id=review.movie_id,
            rating=review.rating,
            title=review.title,
            content=review.content,
            is_verified_booking=review.is_verified_booking,
            created_at=review.created_at
        )
    )
