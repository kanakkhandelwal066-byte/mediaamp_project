import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "CineBook AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./cinebook.db",
        env="DATABASE_URL",
        description="PostgreSQL or SQLite connection string"
    )
    
    # JWT & Security
    JWT_SECRET: str = Field(default="cinebook-super-secret-production-key-2026-secure-32bytes", env="JWT_SECRET")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=120, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # Seat Lock Configuration
    SEAT_LOCK_TIMEOUT_SECONDS: int = Field(default=300, env="SEAT_LOCK_TIMEOUT_SECONDS")  # 5 minutes
    
    # Paytm Gateway Configuration
    PAYTM_MERCHANT_ID: str = Field(default="CINEBOOK_DEMO_MID", env="PAYTM_MERCHANT_ID")
    PAYTM_MERCHANT_KEY: str = Field(default="CINEBOOK_DEMO_KEY", env="PAYTM_MERCHANT_KEY")
    PAYTM_WEBSITE: str = Field(default="WEBSTAGING", env="PAYTM_WEBSITE")
    PAYTM_CHANNEL_ID: str = Field(default="WEB", env="PAYTM_CHANNEL_ID")
    PAYTM_INDUSTRY_TYPE_ID: str = Field(default="Retail", env="PAYTM_INDUSTRY_TYPE_ID")
    PAYTM_CALLBACK_URL: str = Field(default="http://localhost:8000/api/v1/payments/callback", env="PAYTM_CALLBACK_URL")
    PAYTM_ENVIRONMENT: str = Field(default="STAGING", env="PAYTM_ENVIRONMENT")
    PAYTM_PAYMENT_URL: str = Field(default="https://securegw-stage.paytm.in/order/process", env="PAYTM_PAYMENT_URL")
    MOCK_PAYMENT_MODE: bool = Field(default=True, env="MOCK_PAYMENT_MODE")
    
    # Redis (Optional)
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    USE_REDIS: bool = Field(default=False, env="USE_REDIS")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # ML Recommendation
    ML_MODEL_DIR: str = Field(default="app/ml/artifacts", env="ML_MODEL_DIR")
    CONTENT_WEIGHT: float = 0.5
    COLLABORATIVE_WEIGHT: float = 0.3
    POPULARITY_WEIGHT: float = 0.2
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
