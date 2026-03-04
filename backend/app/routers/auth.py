"""
Auth Router — Google OAuth id_token verification + JWT issuance.

Flow:
1. Frontend gets Google id_token via @react-oauth/google
2. POST /api/auth/google  { id_token }
3. Backend verifies with google.oauth2.id_token
4. Find-or-create User, issue our own JWT
5. Frontend stores JWT in localStorage, sends as Bearer header
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, status
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from jose import jwt, JWTError
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.config import get_settings
from app.database import get_session
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


# ── Schemas ──────────────────────────────────────────────────

class GoogleLoginRequest(BaseModel):
    id_token: str


class UserInfo(BaseModel):
    id: int
    email: str | None
    display_name: str | None
    avatar_url: str | None
    google_sub: str | None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


# ── JWT helpers ──────────────────────────────────────────────

def create_jwt(user_id: int) -> str:
    """Sign a JWT containing the user's DB id."""
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_jwt(token: str) -> int | None:
    """Return user_id from a valid JWT, or None."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None


# ── Dependencies: optional & required current user ───────────

async def get_optional_user(
    authorization: str | None = Header(None),
    session: AsyncSession = Depends(get_session),
) -> User | None:
    """Dependency: returns User if valid JWT present, else None (anonymous)."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ").strip()
    user_id = decode_jwt(token)
    if user_id is None:
        return None
    user = await session.get(User, user_id)
    return user


async def get_required_user(
    authorization: str | None = Header(None),
    session: AsyncSession = Depends(get_session),
) -> User:
    """Dependency: requires a valid JWT, raises 401 otherwise."""
    user = await get_optional_user(authorization, session)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# ── Routes ───────────────────────────────────────────────────

@router.post("/google", response_model=AuthResponse)
async def google_login(
    body: GoogleLoginRequest,
    session: AsyncSession = Depends(get_session),
):
    """Verify a Google id_token and return a JWT."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured (GOOGLE_CLIENT_ID missing)",
        )

    # Verify the id_token with Google
    try:
        idinfo = google_id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {e}",
        )

    google_sub = idinfo["sub"]
    email = idinfo.get("email")
    display_name = idinfo.get("name")
    avatar_url = idinfo.get("picture")

    # Find or create user by google_sub
    result = await session.execute(
        select(User).where(User.google_sub == google_sub)
    )
    user = result.scalars().first()

    if not user:
        # Create new user; use google_sub as a deterministic client_uuid
        user = User(
            client_uuid=f"google-{google_sub}",
            google_sub=google_sub,
            email=email,
            display_name=display_name,
            avatar_url=avatar_url,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
    else:
        # Update profile info on each login
        user.email = email
        user.display_name = display_name
        user.avatar_url = avatar_url
        session.add(user)
        await session.commit()
        await session.refresh(user)

    token = create_jwt(user.id)  # type: ignore[arg-type]

    return AuthResponse(
        access_token=token,
        user=UserInfo(
            id=user.id,  # type: ignore[arg-type]
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            google_sub=user.google_sub,
        ),
    )


@router.get("/me", response_model=UserInfo)
async def get_current_user_info(
    user: User = Depends(get_required_user),
):
    """Return the currently authenticated user's info."""
    return UserInfo(
        id=user.id,  # type: ignore[arg-type]
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        google_sub=user.google_sub,
    )
