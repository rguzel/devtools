from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import convert, sql

app = FastAPI(title="CodeToolbox API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert.router, prefix="/api")
app.include_router(sql.router, prefix="/api")

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}
