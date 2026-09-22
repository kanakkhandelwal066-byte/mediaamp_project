from sqlalchemy import Column, Integer, String, Text, Date, Float, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base, TimestampMixin

movie_genres = Table(
    "movie_genres",
    Base.metadata,
    Column("movie_id", Integer, ForeignKey("movies.id", ondelete="CASCADE"), primary_key=True),
    Column("genre_id", Integer, ForeignKey("genres.id", ondelete="CASCADE"), primary_key=True)
)

movie_languages = Table(
    "movie_languages",
    Base.metadata,
    Column("movie_id", Integer, ForeignKey("movies.id", ondelete="CASCADE"), primary_key=True),
    Column("language_id", Integer, ForeignKey("languages.id", ondelete="CASCADE"), primary_key=True)
)

class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False)

    movies = relationship("Movie", secondary=movie_genres, back_populates="genres")

class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    code = Column(String(10), unique=True, nullable=False)

    movies = relationship("Movie", secondary=movie_languages, back_populates="languages")

class Movie(Base, TimestampMixin):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(220), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    release_date = Column(Date, nullable=False, index=True)
    poster_url = Column(String(500), nullable=True)
    backdrop_url = Column(String(500), nullable=True)
    trailer_url = Column(String(500), nullable=True)
    rating = Column(Float, default=0.0)
    vote_count = Column(Integer, default=0)
    director = Column(String(150), nullable=True)
    cast = Column(String(500), nullable=True)  # Comma separated actors
    keywords = Column(String(500), nullable=True)
    certification = Column(String(10), default="UA")
    is_trending = Column(Boolean, default=False)

    genres = relationship("Genre", secondary=movie_genres, back_populates="movies", lazy="joined")
    languages = relationship("Language", secondary=movie_languages, back_populates="movies", lazy="joined")
    shows = relationship("Show", back_populates="movie", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="movie", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="movie", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="movie", cascade="all, delete-orphan")
    recommendation_events = relationship("RecommendationEvent", back_populates="movie", cascade="all, delete-orphan")
