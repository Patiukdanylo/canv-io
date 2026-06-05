"""Canv.io API — FastAPI entrypoint.

Run (dev):  uvicorn app.main:app --reload
Docs:       http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .api import auth, courses, exams

app = FastAPI(title="Canv.io API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(exams.router)


@app.get("/health")
async def health():
    return {"ok": True, "service": "canv-io-api", "version": "0.1.0"}
