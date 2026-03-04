"""
Persona CRUD Router — manage AI character presets.
Supports anonymous (all builtins) and logged-in users (builtins + own custom).
"""

from typing import Optional, Sequence

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, or_

from app.database import get_session
from app.models.persona import Persona, PersonaCreate, PersonaUpdate, PersonaRead
from app.models.user import User
from app.routers.auth import get_optional_user

router = APIRouter(prefix="/api/personas", tags=["personas"])


def _localize_persona(persona: Persona, lang: Optional[str]) -> Persona:
    """Fill `name` and `description` with the requested language variant."""
    if lang == "zh":
        persona.name = persona.name_zh or persona.name
        persona.description = persona.description_zh or persona.description
    elif lang == "en":
        persona.name = persona.name_en or persona.name
        persona.description = persona.description_en or persona.description
    return persona


@router.get("/", response_model=list[PersonaRead])
async def list_personas(
    lang: Optional[str] = Query(None, pattern="^(en|zh)$"),
    session: AsyncSession = Depends(get_session),
    current_user: User | None = Depends(get_optional_user),
) -> Sequence[Persona]:
    """List personas. Anonymous: builtins only. Logged in: builtins + own custom."""
    if current_user:
        stmt = select(Persona).where(
            or_(
                Persona.is_builtin == True,  # noqa: E712
                Persona.user_id == current_user.id,
            )
        )
    else:
        # Anonymous: show builtins + personas with no owner (legacy custom)
        stmt = select(Persona).where(
            or_(
                Persona.is_builtin == True,  # noqa: E712
                Persona.user_id == None,  # noqa: E711
            )
        )
    result = await session.execute(stmt)
    personas = list(result.scalars().all())
    if lang:
        personas = [_localize_persona(p, lang) for p in personas]
    return personas


@router.post("/", response_model=PersonaRead, status_code=status.HTTP_201_CREATED)
async def create_persona(
    data: PersonaCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User | None = Depends(get_optional_user),
) -> Persona:
    """Create a new custom persona. Binds to user_id if logged in."""
    persona = Persona(
        **data.model_dump(),
        is_builtin=False,
        user_id=current_user.id if current_user else None,
    )
    session.add(persona)
    await session.commit()
    await session.refresh(persona)
    return persona


@router.get("/{persona_id}", response_model=PersonaRead)
async def get_persona(
    persona_id: int,
    lang: Optional[str] = Query(None, pattern="^(en|zh)$"),
    session: AsyncSession = Depends(get_session),
) -> Persona:
    """Get a persona by ID. Use ?lang=en|zh for i18n."""
    persona = await session.get(Persona, persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    if lang:
        _localize_persona(persona, lang)
    return persona


@router.put("/{persona_id}", response_model=PersonaRead)
async def update_persona(
    persona_id: int,
    data: PersonaUpdate,
    session: AsyncSession = Depends(get_session),
) -> Persona:
    """Update an existing persona."""
    persona = await session.get(Persona, persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(persona, key, value)

    session.add(persona)
    await session.commit()
    await session.refresh(persona)
    return persona


@router.delete("/{persona_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_persona(
    persona_id: int,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a persona (builtin personas cannot be deleted)."""
    persona = await session.get(Persona, persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    if persona.is_builtin:
        raise HTTPException(
            status_code=400, detail="Cannot delete builtin persona"
        )

    await session.delete(persona)
    await session.commit()
