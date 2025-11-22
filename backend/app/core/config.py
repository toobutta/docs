from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Evoteli API"
    VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/evoteli"

    # Redis/Valkey
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # SendGrid
    SENDGRID_API_KEY: Optional[str] = None
    SENDGRID_FROM_EMAIL: str = "alerts@evoteli.com"
    SENDGRID_FROM_NAME: str = "Evoteli Alerts"
    SENDGRID_UNSUBSCRIBE_GROUP_ID: Optional[int] = None

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # Frontend URL (for email links)
    FRONTEND_URL: str = "http://localhost:3000"

    # Google Ads
    GOOGLE_ADS_CLIENT_ID: Optional[str] = None
    GOOGLE_ADS_CLIENT_SECRET: Optional[str] = None
    GOOGLE_ADS_DEVELOPER_TOKEN: Optional[str] = None
    GOOGLE_ADS_REDIRECT_URI: str = "http://localhost:3000/settings/integrations/google-ads/callback"

    # Pagination
    DEFAULT_PAGE_SIZE: int = 100
    MAX_PAGE_SIZE: int = 500

    # Cache TTL (seconds)
    CACHE_PROPERTY_SEARCH_TTL: int = 300  # 5 minutes
    CACHE_PROPERTY_DETAIL_TTL: int = 900  # 15 minutes
    CACHE_PRODUCT_ANALYSIS_TTL: int = 1800  # 30 minutes

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
