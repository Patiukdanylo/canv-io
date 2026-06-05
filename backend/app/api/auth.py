"""Canvas OAuth2 flow + Canv.io session.

Multi-user Canvas access REQUIRES OAuth2 (a Developer Key approved by the
institution's Canvas admin). Flow:
  1. GET  /auth/canvas/login     -> redirect user to Canvas authorize URL
  2. Canvas redirects back with ?code=...
  3. GET  /auth/canvas/callback  -> exchange code for an access token, store it
                                    server-side bound to the Canv.io user
"""
from fastapi import APIRouter
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/canvas/login")
async def canvas_login():
    """Build the Canvas authorize URL and redirect. TODO: implement."""
    authorize = (
        f"{settings.canvas_base_url}/login/oauth2/auth"
        f"?client_id={settings.canvas_client_id}"
        f"&response_type=code"
        f"&redirect_uri={settings.canvas_redirect_uri}"
        f"&scope=url:GET|/api/v1/courses url:GET|/api/v1/courses/:id/files"
    )
    return {"redirect": authorize}


@router.get("/canvas/callback")
async def canvas_callback(code: str):
    """Exchange `code` at /login/oauth2/token for an access token. TODO."""
    raise NotImplementedError
