"""Persona model — AI character definitions for breathing messages."""

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class PersonaBase(SQLModel):
    """Shared fields for Persona create/update schemas."""

    name: str
    description: Optional[str] = None
    system_prompt: str
    visual_theme: str = "dark"           # "dark" | "warm" | "ocean" | "light"
    danmaku_config: Optional[str] = None  # JSON: {"color", "speed", "fontSize"}

    # i18n bilingual fields
    name_en: Optional[str] = None
    name_zh: Optional[str] = None
    description_en: Optional[str] = None
    description_zh: Optional[str] = None


class Persona(PersonaBase, table=True):
    """Persona table — AI Cosplay character settings."""

    __tablename__ = "personas"

    id: Optional[int] = Field(default=None, primary_key=True)
    is_builtin: bool = Field(default=False)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PersonaCreate(PersonaBase):
    """Schema for creating a new persona."""
    pass


class PersonaUpdate(SQLModel):
    """Schema for updating an existing persona (all fields optional)."""

    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    visual_theme: Optional[str] = None
    danmaku_config: Optional[str] = None
    name_en: Optional[str] = None
    name_zh: Optional[str] = None
    description_en: Optional[str] = None
    description_zh: Optional[str] = None


class PersonaRead(PersonaBase):
    """Schema for reading a persona."""

    id: int
    is_builtin: bool
    user_id: Optional[int]
    created_at: datetime
