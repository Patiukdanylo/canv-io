"""SQLAlchemy ORM models — the Canv.io data model.

Roles/types are stored as short strings (validated at the app layer) to keep
migrations portable. JSON columns hold the type-specific question payloads and
exam recipes, matching the shapes the frontend app already understands.
"""
from datetime import datetime
from sqlalchemy import (
    BigInteger, Boolean, Column, DateTime, Float, ForeignKey, Integer,
    String, Text, JSON, UniqueConstraint, func,
)
from sqlalchemy.orm import relationship

from ..db import Base

# allowed values (app-level enums)
ROLES = ("student", "admin")
Q_TYPES = ("mc", "fill", "match", "essay")
DIFFICULTIES = ("standard", "challenging", "essay")
BANK_STATUS = ("draft", "reviewed", "published")
INGEST_STATES = ("queued", "fetching", "parsing", "generating", "ready", "error")


class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(120), nullable=False)
    role = Column(String(20), default="student", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    canvas = relationship("CanvasConnection", back_populates="user", uselist=False,
                          cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="owner", cascade="all, delete-orphan")
    attempts = relationship("Attempt", back_populates="user", cascade="all, delete-orphan")


class CanvasConnection(Base, TimestampMixin):
    """A user's link to Canvas. Token is stored ENCRYPTED (Fernet) at rest."""
    __tablename__ = "canvas_connections"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                     unique=True, nullable=False)
    base_url = Column(String(255), default="https://canvas.thomasmore.be", nullable=False)
    token_encrypted = Column(Text, nullable=False)
    token_type = Column(String(20), default="bearer", nullable=False)
    scope = Column(String(500), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="canvas")


class Course(Base, TimestampMixin):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    canvas_course_id = Column(BigInteger, index=True, nullable=True)
    name = Column(String(255), nullable=False)
    term = Column(String(120), nullable=True)
    source = Column(String(20), default="manual", nullable=False)   # manual | canvas
    status = Column(String(20), default="active", nullable=False)

    owner = relationship("User", back_populates="courses")
    banks = relationship("QuestionBank", back_populates="course", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="course", cascade="all, delete-orphan")
    documents = relationship("SourceDocument", back_populates="course", cascade="all, delete-orphan")


class QuestionBank(Base, TimestampMixin):
    __tablename__ = "question_banks"
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    status = Column(String(20), default="draft", nullable=False)    # draft|reviewed|published

    course = relationship("Course", back_populates="banks")
    questions = relationship("Question", back_populates="bank", cascade="all, delete-orphan")


class Question(Base, TimestampMixin):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    bank_id = Column(Integer, ForeignKey("question_banks.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(10), nullable=False)          # mc|fill|match|essay
    difficulty = Column(String(20), default="standard", nullable=False)
    topic = Column(String(120), nullable=True)
    prompt = Column(Text, nullable=False)
    payload = Column(JSON, nullable=False, default=dict)  # options/accept/left/right/correct/model/keywords
    explanation = Column(Text, nullable=True)
    source_ref = Column(String(255), nullable=True)

    bank = relationship("QuestionBank", back_populates="questions")


class Exam(Base, TimestampMixin):
    """An exam recipe: how to compose a paper from a course's bank."""
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    slug = Column(String(60), nullable=False)
    title = Column(String(200), nullable=False)
    blurb = Column(Text, nullable=True)
    compose = Column(JSON, nullable=False, default=dict)   # {"standard":32,"challenging":4,"essay":2}
    topics = Column(JSON, nullable=True)                   # optional topic filter
    target_pct = Column(Integer, default=80, nullable=False)
    time_limit_min = Column(Integer, nullable=True)

    course = relationship("Course", back_populates="exams")
    attempts = relationship("Attempt", back_populates="exam", cascade="all, delete-orphan")
    __table_args__ = (UniqueConstraint("course_id", "slug", name="uq_exam_course_slug"),)


class Attempt(Base, TimestampMixin):
    __tablename__ = "attempts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    snapshot = Column(JSON, nullable=False, default=list)  # the drawn paper
    answers = Column(JSON, nullable=True)
    score = Column(Float, nullable=True)
    max_score = Column(Float, nullable=True)
    minutes = Column(Integer, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="attempts")
    exam = relationship("Exam", back_populates="attempts")


class IngestJob(Base, TimestampMixin):
    """Tracks a Canvas fetch -> parse -> generate pipeline run."""
    __tablename__ = "ingest_jobs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=True)
    state = Column(String(20), default="queued", nullable=False)
    detail = Column(Text, default="", nullable=False)
    questions_generated = Column(Integer, default=0, nullable=False)


class SourceDocument(Base, TimestampMixin):
    """Ingested course material (a Canvas file/page) and its extracted text."""
    __tablename__ = "source_documents"
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    canvas_file_id = Column(BigInteger, nullable=True)
    filename = Column(String(400), nullable=False)
    content_type = Column(String(120), nullable=True)
    source_ref = Column(String(255), nullable=True)
    text = Column(Text, nullable=True)

    course = relationship("Course", back_populates="documents")
