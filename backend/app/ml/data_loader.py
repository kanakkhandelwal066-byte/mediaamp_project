from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.movie import Movie
from app.models.recommendation import RecommendationEvent
from app.models.booking import Booking, BookingItem
from app.models.social import Rating, Favorite
from app.ml.config import ml_config

def load_movie_corpus(db: Session) -> List[Dict[str, Any]]:
    """Loads all active movies with their rich textual features for content-based TF-IDF."""
    movies = db.query(Movie).filter(Movie.is_active == True).all()
    corpus = []
    for m in movies:
        genre_str = " ".join([g.name for g in m.genres])
        lang_str = " ".join([l.name for l in m.languages])
        director_str = m.director or ""
        cast_str = (m.cast or "").replace(",", " ")
        keywords_str = (m.keywords or "").replace(",", " ")

        # Combined content soup
        content_soup = f"{m.title} {genre_str} {director_str} {cast_str} {keywords_str} {m.description}"

        corpus.append({
            "movie_id": m.id,
            "title": m.title,
            "slug": m.slug,
            "rating": m.rating,
            "vote_count": m.vote_count,
            "poster_url": m.poster_url,
            "duration_minutes": m.duration_minutes,
            "genres": [g.name for g in m.genres],
            "content_soup": content_soup
        })
    return corpus

def load_interaction_data(db: Session) -> List[Tuple[int, int, float]]:
    """
    Extracts user-item interaction signals combining:
    - Explicit RecommendationEvents (views, searches)
    - Confirmed Bookings (highest intent: weight 5.0)
    - User Ratings (score / 2.0)
    - User Favorites (weight 3.0)
    Returns list of (user_id, movie_id, interaction_weight)
    """
    interactions = []

    # 1. RecommendationEvents
    events = db.query(RecommendationEvent).all()
    for ev in events:
        weight = ml_config.EVENT_WEIGHTS.get(ev.event_type, 1.0)
        interactions.append((ev.user_id, ev.movie_id, weight))

    # 2. Confirmed Bookings
    bookings = db.query(Booking).filter(Booking.status == "CONFIRMED").all()
    for b in bookings:
        if b.show and b.show.movie_id:
            interactions.append((b.user_id, b.show.movie_id, ml_config.EVENT_WEIGHTS["booking"]))

    # 3. User Ratings
    ratings = db.query(Rating).all()
    for r in ratings:
        interactions.append((r.user_id, r.movie_id, float(r.score) / 2.0))

    # 4. User Favorites
    favs = db.query(Favorite).all()
    for f in favs:
        interactions.append((f.user_id, f.movie_id, ml_config.EVENT_WEIGHTS["favorite"]))

    return interactions
