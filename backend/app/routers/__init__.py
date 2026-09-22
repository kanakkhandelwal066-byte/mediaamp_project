from app.routers.auth import router as auth_router
from app.routers.movies import router as movies_router
from app.routers.theatres import router as theatres_router
from app.routers.shows import router as shows_router
from app.routers.seats import router as seats_router
from app.routers.bookings import router as bookings_router
from app.routers.payments import router as payments_router
from app.routers.coupons import router as coupons_router
from app.routers.reviews import router as reviews_router
from app.routers.recommendations import router as recommendations_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "movies_router",
    "theatres_router",
    "shows_router",
    "seats_router",
    "bookings_router",
    "payments_router",
    "coupons_router",
    "reviews_router",
    "recommendations_router",
    "admin_router",
]
