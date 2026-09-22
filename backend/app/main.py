import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database.connection import engine
from app.database.base import Base
from app.database.session import SessionLocal
from app.utils.exceptions import CineBookException
from app.middleware.error_handler import (
    cinebook_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    generic_exception_handler
)
from app.ml.inference import RecommendationService
from app.routers import (
    auth_router,
    movies_router,
    theatres_router,
    shows_router,
    seats_router,
    bookings_router,
    payments_router,
    coupons_router,
    reviews_router,
    recommendations_router,
    admin_router,
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s"
)
logger = logging.getLogger("cinebook")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🎬 Starting CineBook AI application server...")
    
    # Ensure tables exist
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database connection and schema verified.")
    except Exception as e:
        logger.error(f"Error during schema verification: {e}")

    # Warm-up ML recommendation service
    try:
        db = SessionLocal()
        RecommendationService.get_instance().ensure_model_ready(db)
        db.close()
        logger.info("ML Recommendation engine warmed up.")
    except Exception as e:
        logger.warning(f"ML warmup skipped or deferred: {e}")

    yield

    # Shutdown
    logger.info("CineBook AI application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-Style Full-Stack Movie & Event Booking Platform API.\n\n"
        "**Key Highlights**:\n"
        "- Concurrency-safe seat reservation with row-level locks (`SELECT FOR UPDATE`) and 5-minute auto-expiry.\n"
        "- Transactional booking workflow with strict backend pricing and anti-tampering guards.\n"
        "- Hybrid Machine Learning Recommendation Engine (TF-IDF Content + Item-Item Collaborative + Cold-Start Fallback).\n"
        "- Paytm Staging & Interactive Demo Payment Gateway Simulator.\n"
        "- Dynamic QR Code Ticket Generation.\n"
        "- Role-Based Access Control (USER and ADMIN)."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(CineBookException, cinebook_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include API v1 routers
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(movies_router, prefix=api_prefix)
app.include_router(theatres_router, prefix=api_prefix)
app.include_router(shows_router, prefix=api_prefix)
app.include_router(seats_router, prefix=api_prefix)
app.include_router(bookings_router, prefix=api_prefix)
app.include_router(payments_router, prefix=api_prefix)
app.include_router(coupons_router, prefix=api_prefix)
app.include_router(reviews_router, prefix=api_prefix)
app.include_router(recommendations_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)

@app.get("/", tags=["Health & Status"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health", tags=["Health & Status"])
def health_check():
    return {
        "status": "UP",
        "environment": settings.ENVIRONMENT,
        "mock_payment_mode": settings.MOCK_PAYMENT_MODE
    }
