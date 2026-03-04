"""
Breath Router — the single stateless API endpoint.

Frontend calls POST /api/breath every N minutes with AI config.
Backend assembles time-aware prompt, calls AI, returns danmaku text.
"""

import json
from typing import Optional

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models.persona import Persona
from app.services.prompt_engine import build_breathing_prompt
from app.services.ai_provider import chat_completion_stateless

router = APIRouter(prefix="/api", tags=["breath"])


import re

class BreathRequest(BaseModel):
    """Request body — frontend sends AI config + context."""
    persona_id: int = 1
    custom_context: str = ""
    ai_provider: str = "minimax"      # minimax | deepseek | openai | custom
    ai_api_key: str = ""              # User's key from localStorage
    ai_base_url: Optional[str] = None # For custom provider
    ai_model: Optional[str] = None    # For custom provider
    language: str = "en"              # en | zh


class BreathResponse(BaseModel):
    """Response — arrays of danmaku and wordcloud items."""
    danmaku: list[str]
    word_cloud: list[str]
    persona_name: str
    color: str = "#e2e8f0"
    base_speed: str = "normal"


@router.post("/breath", response_model=BreathResponse)
async def trigger_breath(
    req: BreathRequest,
    session: AsyncSession = Depends(get_session),
):
    """
    Stateless breathing endpoint.
    Frontend timer triggers this every N minutes.
    """
    # 1. Get persona
    persona = await session.get(Persona, req.persona_id)
    if not persona:
        # Fallback to first builtin
        result = await session.execute(
            select(Persona).where(Persona.is_builtin == True).limit(1)  # noqa: E712
        )
        persona = result.scalars().first()

    if not persona:
        raise HTTPException(status_code=404, detail="No persona available")

    # 2. Build time-aware prompt
    messages = build_breathing_prompt(
        persona_prompt=persona.system_prompt,
        custom_context=req.custom_context,
        language=req.language,
    )

    # 3. Call AI
    if not req.ai_api_key:
        raise HTTPException(
            status_code=400,
            detail="Please configure your AI API key in Settings",
        )

    try:
        response_text = await chat_completion_stateless(
            messages=messages,
            provider=req.ai_provider,
            api_key=req.ai_api_key,
            base_url=req.ai_base_url,
            model=req.ai_model,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI call failed: {str(e)[:100]}")

    # Parse AI response (strip markdown and <think> tags)
    clean_text = response_text.strip()
    clean_text = re.sub(r'<think>.*?</think>', '', clean_text, flags=re.DOTALL).strip()
    if clean_text.startswith('```'):
        clean_text = re.sub(r'^```(?:json)?\s*', '', clean_text)
        clean_text = re.sub(r'\s*```$', '', clean_text)

    # Try to find the first { and the last } in case AI added conversational text
    start_idx = clean_text.find('{')
    end_idx = clean_text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        clean_text = clean_text[start_idx:end_idx+1]

    try:
        parsed_data = json.loads(clean_text)
        danmaku_list = parsed_data.get("danmaku", [])
        word_cloud_list = parsed_data.get("word_cloud", [])
        if not isinstance(danmaku_list, list): danmaku_list = []
        if not isinstance(word_cloud_list, list): word_cloud_list = []
    except json.JSONDecodeError:
        # Fallback if parsing fails
        danmaku_list = ["(AI响应解析失败，请检查模型)", clean_text[:50]]
        word_cloud_list = []

    # 4. Parse danmaku config from persona
    danmaku_config = {}
    if persona.danmaku_config:
        try:
            danmaku_config = json.loads(persona.danmaku_config)
        except json.JSONDecodeError:
            pass

    return BreathResponse(
        danmaku=danmaku_list,
        word_cloud=word_cloud_list,
        persona_name=persona.name,
        color=danmaku_config.get("color", "#e2e8f0"),
        base_speed=danmaku_config.get("speed", "normal"),
    )
