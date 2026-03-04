"""User model — supports both anonymous UUID and Google OAuth users."""

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    """User — identified by browser UUID (anonymous) or Google sub (logged in)."""

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    client_uuid: str = Field(unique=True, index=True)  # Frontend-generated UUID
    active_persona_id: Optional[int] = Field(default=None, foreign_key="personas.id")
    custom_context: Optional[str] = None  # User's memo/goals text
    breathing_interval_min: int = Field(default=15)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Google OAuth fields (populated after first Google login)
    google_sub: Optional[str] = Field(default=None, unique=True, index=True)
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
