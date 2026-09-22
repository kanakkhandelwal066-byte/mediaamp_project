from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class RecommendationEvent(Base, TimestampMixin):
    __tablename__ = "recommendation_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True) # movie_view, movie_search, favorite, booking, rating, review
    weight = Column(Float, default=1.0, nullable=False)
    metadata_json = Column(Text, nullable=True)

    user = relationship("User", back_populates="recommendation_events")
    movie = relationship("Movie", back_populates="recommendation_events")
