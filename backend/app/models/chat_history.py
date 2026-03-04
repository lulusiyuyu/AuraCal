"""ChatHistory model — daily conversation memory capsule."""

from datetime import date, datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class ChatHistory(SQLModel, table=True):
    """Chat history table — stores daily AI conversation context."""

    __tablename__ = "chat_history"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    persona_id: int = Field(foreign_key="personas.id")

    role: str           # "system" | "user" | "assistant"
    content: str        # Message content

    session_date: date = Field(index=True)  # Archived by day
    created_at: datetime = Field(default_factory=datetime.utcnow)
