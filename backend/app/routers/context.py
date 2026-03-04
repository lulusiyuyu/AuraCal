"""
Context Router — save/load custom context.

- Anonymous users: by client_uuid (from localStorage)
- Logged-in users: by user_id (from JWT)
"""

from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models.user import User
from app.routers.auth import get_optional_user

router = APIRouter(prefix="/api/context", tags=["context"])


class ContextUpdate(BaseModel):
    client_uuid: str | None = None
    custom_context: str | None = None


@router.post("/save")
async def save_context(
    data: ContextUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User | None = Depends(get_optional_user),
):
    """Save custom context. Logged-in: uses JWT user. Anonymous: uses client_uuid."""
    if current_user:
        user = current_user
    elif data.client_uuid:
        result = await session.execute(
            select(User).where(User.client_uuid == data.client_uuid)
        )
        user = result.scalars().first()
        if not user:
            user = User(client_uuid=data.client_uuid)
            session.add(user)
    else:
        return {"message": "No user identity provided", "custom_context": None}

    user.custom_context = data.custom_context
    await session.commit()
    await session.refresh(user)

    return {"message": "Context saved", "custom_context": user.custom_context}


@router.get("/load/{client_uuid}")
async def load_context(
    client_uuid: str,
    session: AsyncSession = Depends(get_session),
    current_user: User | None = Depends(get_optional_user),
):
    """Load custom context. Logged-in: uses JWT user. Anonymous: uses client_uuid."""
    if current_user:
        return {"custom_context": current_user.custom_context}

    result = await session.execute(
        select(User).where(User.client_uuid == client_uuid)
    )
    user = result.scalars().first()

    return {
        "custom_context": user.custom_context if user else None,
    }


@router.get("/load")
async def load_context_me(
    current_user: User = Depends(get_optional_user),
):
    """Load context for the logged-in user (no client_uuid needed)."""
    if not current_user:
        return {"custom_context": None}
    return {"custom_context": current_user.custom_context}
