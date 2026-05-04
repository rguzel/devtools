from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from routers.convert import stream_ollama, ALLOWED_MODELS, DEFAULT_MODEL

router = APIRouter()

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


class SqlExplainRequest(BaseModel):
    sql: str
    model: str = ""


@router.post("/sql-explain")
async def sql_explain(req: SqlExplainRequest):
    if not req.sql.strip():
        raise HTTPException(status_code=400, detail="No SQL provided")
    if len(req.sql) > 20_000:
        raise HTTPException(status_code=400, detail="SQL too large (max 20k chars)")

    template = (PROMPTS_DIR / "sql_explain.txt").read_text()
    prompt = template.replace("{sql}", req.sql)
    model = req.model if req.model in ALLOWED_MODELS else DEFAULT_MODEL

    return StreamingResponse(
        stream_ollama(prompt, model),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
