"""Course sync + ingestion endpoints."""
from fastapi import APIRouter, BackgroundTasks
from ..models.schemas import Course, CourseBank, IngestStatus

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[Course])
async def list_my_courses():
    """List the signed-in user's Canvas courses (via CanvasClient). TODO."""
    raise NotImplementedError


@router.post("/{course_id}/sync", response_model=IngestStatus)
async def sync_course(course_id: str, bg: BackgroundTasks):
    """Kick off fetch -> ingest -> generate as a background job.

    bg.add_task(run_pipeline, course_id)  # canvas_client + ingestion + generator
    Returns an IngestStatus the frontend can poll. TODO.
    """
    raise NotImplementedError


@router.get("/{course_id}/bank", response_model=CourseBank)
async def get_bank(course_id: str):
    """Return the generated (and human-reviewed) question bank. TODO."""
    raise NotImplementedError
