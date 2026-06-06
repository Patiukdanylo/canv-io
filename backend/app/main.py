"""Canv.io API — FastAPI entrypoint.

Run (Docker):  docker compose up
Run (local):   uvicorn app.main:app --reload
Docs:          http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .api import auth, canvas, courses, exams

app = FastAPI(title=settings.app_name, version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(canvas.router)
app.include_router(courses.router)
app.include_router(exams.router)


@app.get("/health")
def health():
    return {"ok": True, "service": "canv-io-api", "version": "0.2.0", "env": settings.environment}
