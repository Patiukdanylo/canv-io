"""Thin async client over the Canvas LMS REST API.

Canvas (Instructure) exposes an official REST API — we use it instead of
scraping (scraping would violate Canvas' Terms). Auth is a Bearer token
obtained via OAuth2 (see app/api/auth.py). Per Canvas API policy, a
multi-user product MUST use OAuth2; personal tokens are dev-only.

Docs: https://developerdocs.instructure.com/services/canvas
"""
from __future__ import annotations
import httpx
from ..config import settings


class CanvasClient:
    def __init__(self, access_token: str, base_url: str | None = None):
        self.base = (base_url or settings.canvas_base_url).rstrip("/")
        self._headers = {"Authorization": f"Bearer {access_token}"}

    async def _get(self, path: str, **params):
        """GET with Canvas link-header pagination handled."""
        url = f"{self.base}/api/v1{path}"
        out: list[dict] = []
        async with httpx.AsyncClient(headers=self._headers, timeout=30) as c:
            while url:
                r = await c.get(url, params=params)
                r.raise_for_status()
                data = r.json()
                out.extend(data if isinstance(data, list) else [data])
                url = r.links.get("next", {}).get("url")
                params = {}  # subsequent pages carry their own query
        return out

    async def list_courses(self) -> list[dict]:
        """Courses the authorised user is enrolled in."""
        return await self._get("/courses", enrollment_state="active", per_page=100)

    async def list_modules(self, course_id: int) -> list[dict]:
        return await self._get(f"/courses/{course_id}/modules",
                               include=["items"], per_page=100)

    async def list_files(self, course_id: int) -> list[dict]:
        """Course files (PDF/PPTX/etc). Requires file read permission."""
        return await self._get(f"/courses/{course_id}/files", per_page=100)

    async def list_pages(self, course_id: int) -> list[dict]:
        return await self._get(f"/courses/{course_id}/pages", per_page=100)

    async def download(self, file_url: str) -> bytes:
        async with httpx.AsyncClient(headers=self._headers, timeout=120) as c:
            r = await c.get(file_url)
            r.raise_for_status()
            return r.content
