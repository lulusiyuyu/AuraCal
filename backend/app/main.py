"""
AuraCal 灵光画布 — FastAPI Entry Point (v4 Stateless)

No auth, no WebSocket, no Redis.
Just personas + breath API + context storage.
"""

import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import init_db, async_session
from app.models.persona import Persona
from app.routers import personas, context, breath, auth


# ── Builtin Persona Seed Data (loaded from JSON) ────────────

BUILTIN_PERSONAS_PATH = Path(__file__).resolve().parent.parent / "builtin_personas.json"


def _load_builtin_personas() -> list[dict]:
    """Read builtin persona definitions from the JSON file."""
    with open(BUILTIN_PERSONAS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


async def seed_personas():
    """Inject builtin personas if they don't exist yet."""
    builtin_data = _load_builtin_personas()
    async with async_session() as session:
        for data in builtin_data:
            # Use name_en as the unique key for builtin personas
            result = await session.execute(
                select(Persona).where(
                    Persona.name == data["name"],
                    Persona.is_builtin == True,  # noqa: E712
                )
            )
            if not result.scalars().first():
                persona = Persona(**data)
                session.add(persona)
        await session.commit()


# ── App Lifespan ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_personas()
    yield


# ── FastAPI App ──────────────────────────────────────────────

app = FastAPI(
    title="AuraCal 灵光画布",
    version="0.4.0",
    description="Stateless breathing ambient display API",
    lifespan=lifespan,
)

# CORS — allow all origins for simplicity (no auth needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(breath.router)
app.include_router(personas.router)
app.include_router(context.router)
app.include_router(auth.router)


@app.get("/", tags=["health"])
async def health_check():
    return {
        "name": "AuraCal 灵光画布",
        "version": "0.4.0",
        "status": "breathing ✨",
        "architecture": "stateless",
    }
