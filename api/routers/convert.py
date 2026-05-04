import json
import os
from pathlib import Path
from typing import AsyncIterator

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

OLLAMA_BASE_URL  = os.getenv("OLLAMA_BASE_URL",  "http://localhost:11434")
OLLAMA_LOCAL_URL = os.getenv("OLLAMA_LOCAL_URL",  "http://localhost:11434")
DEFAULT_MODEL    = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:14b")
PROMPTS_DIR      = Path(__file__).parent.parent / "prompts"

ALLOWED_MODELS = {
    "qwen2.5-coder:14b",
    "qwen2.5-coder:3b",
    "deepseek-coder:latest",
    "deepseek-coder:6.7b",
    "gemma4:e4b",
    "gemma4:e2b",
}

LOCAL_MODELS = {"gemma4:e4b", "gemma4:e2b"}


def get_ollama_url(model: str) -> str:
    return OLLAMA_LOCAL_URL if model in LOCAL_MODELS else OLLAMA_BASE_URL


class ConvertRequest(BaseModel):
    source_lang: str
    target_lang: str
    code: str
    style_hint: str = ""
    model: str = ""


def load_prompt(src: str, dst: str) -> str:
    key = f"{src.lower()}_to_{dst.lower()}"
    path = PROMPTS_DIR / f"{key}.txt"
    if path.exists():
        return path.read_text()
    return (PROMPTS_DIR / "generic_convert.txt").read_text()


def build_prompt(req: ConvertRequest) -> str:
    template = load_prompt(req.source_lang, req.target_lang)
    style = req.style_hint or "idiomatic"
    return (
        template
        .replace("{src}", req.source_lang.upper())
        .replace("{dst}", req.target_lang.upper())
        .replace("{style}", style)
        .replace("{code}", req.code)
    )


async def stream_ollama(prompt: str, model: str) -> AsyncIterator[str]:
    base_url = get_ollama_url(model)
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": True,
        "options": {
            "temperature": 0.1,
            "num_ctx": 8192,
        },
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST", f"{base_url}/api/generate", json=payload
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    token = data.get("response", "")
                    if token:
                        yield f"data: {json.dumps({'token': token})}\n\n"
                    if data.get("done"):
                        yield "data: [DONE]\n\n"
                except json.JSONDecodeError:
                    continue


@router.post("/convert")
async def convert(req: ConvertRequest):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="No code provided")
    if len(req.code) > 20_000:
        raise HTTPException(status_code=400, detail="Code too large (max 20k chars)")

    model = req.model if req.model in ALLOWED_MODELS else DEFAULT_MODEL
    prompt = build_prompt(req)

    return StreamingResponse(
        stream_ollama(prompt, model),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
