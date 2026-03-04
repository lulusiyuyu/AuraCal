"""AuraCal Settings — simplified for stateless architecture."""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # AI Provider default keys (optional system fallback)
    DEFAULT_AI_PROVIDER: str = "minimax"
    MINIMAX_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""

    # AI providers JSON config path
    AI_PROVIDERS_PATH: str = "ai_providers.json"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./auracal.db"

    # App
    SECRET_KEY: str = "auracal-dev-secret-change-me"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    # JWT
    JWT_SECRET: str = "auracal-jwt-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 168  # 7 days

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
