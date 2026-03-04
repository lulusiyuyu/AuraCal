"""
AI Provider Service — stateless, key comes from frontend.
"""

import json
from pathlib import Path
from typing import Optional

from openai import AsyncOpenAI

from app.config import get_settings

settings = get_settings()

# ── Load provider presets ────────────────────────────────────

_providers_cache: dict | None = None


def _load_providers() -> dict:
    global _providers_cache
    if _providers_cache is None:
        config_path = Path(settings.AI_PROVIDERS_PATH)
        if config_path.exists():
            with open(config_path, "r", encoding="utf-8") as f:
                _providers_cache = json.load(f)
        else:
            _providers_cache = {"providers": {}, "default_provider": "minimax"}
    return _providers_cache


def get_available_providers() -> list[dict[str, str]]:
    """Get list of available AI providers for frontend."""
    config = _load_providers()
    providers = []
    for key, info in config.get("providers", {}).items():
        providers.append({
            "key": key,
            "name": info.get("name", key),
            "base_url": info.get("base_url", ""),
            "model": info.get("model", ""),
            "description": info.get("description", ""),
        })
    return providers


async def chat_completion_stateless(
    messages: list[dict[str, str]],
    provider: str,
    api_key: str,
    base_url: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.85,
    max_tokens: int = 2000,
) -> str:
    """
    Stateless chat completion — key comes from request, not DB.
    """
    config = _load_providers()
    providers = config.get("providers", {})

    if provider in providers and not base_url:
        preset = providers[provider]
        base_url = preset["base_url"]
        model = model or preset["model"]
    elif not base_url:
        base_url = "https://api.minimaxi.com/v1"
        model = model or "MiniMax-M2.5"

    # Use system default key as fallback
    if not api_key:
        key_map = {
            "minimax": settings.MINIMAX_API_KEY,
            "deepseek": settings.DEEPSEEK_API_KEY,
        }
        api_key = key_map.get(provider, "")

    if not api_key:
        raise ValueError(f"No API key for provider '{provider}'")

    client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    response = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content or ""
