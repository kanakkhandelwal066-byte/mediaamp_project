from typing import List, Dict, Any
from pydantic import BaseModel

class AdminOverviewStats(BaseModel):
    total_users: int
    total_bookings: int
    total_revenue: float
    active_movies: int
    active_theatres: int
    total_shows: int
    average_occupancy_rate: float
    payment_success_rate: float
    cancellation_rate: float

class DailyRevenueItem(BaseModel):
    date: str
    revenue: float
    bookings_count: int

class PopularMovieStat(BaseModel):
    movie_id: int
    title: str
    poster_url: str | None = None
    bookings_count: int
    revenue: float

class PopularGenreStat(BaseModel):
    genre: str
    count: int

class TheatreOccupancyStat(BaseModel):
    theatre_id: int
    theatre_name: str
    city_name: str
    total_seats: int
    booked_seats: int
    occupancy_percentage: float

class AdminAnalyticsResponse(BaseModel):
    overview: AdminOverviewStats
    daily_revenue: List[DailyRevenueItem]
    popular_movies: List[PopularMovieStat]
    genre_distribution: List[PopularGenreStat]
    theatre_occupancy: List[TheatreOccupancyStat]
