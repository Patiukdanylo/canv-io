"""LLM-powered question generation.

Takes ingested course text and produces a question bank in the exact shape
the existing static app already consumes (schemas.Question / CourseBank),
so generated content drops straight into the exam engine. A human review
step should gate anything before it is shown to students (quality + IP).
"""
from __future__ import annotations
from ..config import settings
from ..models.schemas import Question, CourseBank, Course
from .ingestion import TextChunk

SYSTEM_PROMPT = """You are an exam-question author. From the supplied course
material, write accurate practice questions (mix of mc / fill / match / essay)
that test understanding, not trivia. For every question include a short
explanation and a topic tag. Never copy the institution's real exam questions;
produce original practice items. Return JSON matching the Question schema."""


async def generate_questions(chunks: list[TextChunk],
                             per_chunk: int = 4) -> list[Question]:
    """Call the LLM per chunk and parse results into Question objects.

    TODO: implement with the Anthropic SDK using settings.generation_model.
    Pseudocode:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        for c in chunks:
            msg = client.messages.create(model=settings.generation_model,
                  system=SYSTEM_PROMPT, messages=[{"role":"user",
                  "content": render(c, per_chunk)}], ...)
            questions += parse_json(msg)
    """
    raise NotImplementedError


async def build_course_bank(course: Course,
                            chunks: list[TextChunk]) -> CourseBank:
    """Full course -> reviewed question bank + default exam recipes. TODO."""
    raise NotImplementedError
