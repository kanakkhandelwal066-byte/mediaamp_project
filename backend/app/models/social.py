from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False, index=True)
    rating = Column(Float, nullable=False) # 1.0 to 10.0
    title = Column(String(150), nullable=True)
    content = Column(Text, nullable=False)
    is_verified_booking = Column(Boolean, default=False)

    user = relationship("User", back_populates="reviews")
    movie = relationship("Movie", back_populates="reviews")

class Rating(Base, TimestampMixin):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False, index=True)
    score = Column(Float, nullable=False) # 1.0 to 10.0

    __table_args__ = (
        UniqueConstraint("user_id", "movie_id", name="uq_user_movie_rating"),
    )

    user = relationship("User", back_populates="ratings")
    movie = relationship("Movie", back_populates="ratings")

class Favorite(Base, TimestampMixin):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("user_id", "movie_id", name="uq_user_movie_favorite"),
    )

    user = relationship("User", back_populates="favorites")
    movie = relationship("Movie", back_populates="favorites")
