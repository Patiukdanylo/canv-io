"""Exam generation, attempts and grading.

Grading logic mirrors the static app (mc exact match; fill = tolerant;
match = partial credit; essay = model-answer self-grade) so web, future
mobile and API stay consistent.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from ..models.schemas import ExamRecipe

router = APIRouter(prefix="/exams", tags=["exams"])


class Attempt(BaseModel):
    exam_id: str
    answers: dict
    score: float | None = None


@router.get("/{course_id}", response_model=list[ExamRecipe])
async def list_exams(course_id: str):
    """Exam recipes available for a course. TODO."""
    raise NotImplementedError


@router.post("/{exam_id}/draw")
async def draw_exam(exam_id: str):
    """Draw a fresh paper from the bank per the recipe (shuffle). TODO."""
    raise NotImplementedError


@router.post("/{exam_id}/submit", response_model=Attempt)
async def submit_exam(exam_id: str, attempt: Attempt):
    """Grade + persist an attempt for the signed-in user. TODO."""
    raise NotImplementedError
