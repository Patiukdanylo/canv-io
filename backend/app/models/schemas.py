"""Pydantic schemas — the shared shapes between API, services and the frontend.

These mirror the question-bank format the static app already understands
(see public/app/data.js: BANK / QUIZZES), so generated content can drop
straight into the existing exam engine.
"""
from __future__ import annotations
from enum import Enum
from pydantic import BaseModel


class QType(str, Enum):
    mc = "mc"        # single multiple-choice
    fill = "fill"    # fill in the blank
    match = "match"  # matching items
    essay = "essay"  # written answer (self-graded against a model answer)


class Difficulty(str, Enum):
    standard = "standard"
    challenging = "challenging"
    essay = "essay"


class Question(BaseModel):
    t: QType
    topic: str
    q: str
    # mc
    o: list[str] | None = None
    a: str | None = None
    # fill
    accept: list[str] | None = None
    # match
    left: list[str] | None = None
    right: list[str] | None = None
    correct: dict[str, str] | None = None
    # essay
    model: str | None = None
    keywords: list[str] | None = None
    # shared
    e: str | None = None          # explanation
    difficulty: Difficulty = Difficulty.standard
    source_ref: str | None = None  # which course file/page this came from


class ExamRecipe(BaseModel):
    """How an exam is composed from the bank (matches the app's QUIZZES)."""
    id: str
    title: str
    blurb: str = ""
    compose: dict[str, int] = {"standard": 32, "challenging": 4, "essay": 2}
    topics: list[str] | None = None


class Course(BaseModel):
    id: str
    canvas_course_id: int | None = None
    name: str
    term: str | None = None
    question_count: int = 0
    updated_at: str | None = None


class CourseBank(BaseModel):
    course: Course
    questions: list[Question] = []
    exams: list[ExamRecipe] = []


class IngestStatus(BaseModel):
    course_id: str
    state: str            # queued | fetching | parsing | generating | ready | error
    detail: str = ""
    questions_generated: int = 0
