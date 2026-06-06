"""Canvas connection endpoints.

Two ways to connect (Thomas More Canvas = https://canvas.thomasmore.be):
  • OAuth2  — required for a multi-user product (needs a Developer Key approved
    by the institution's Canvas admin). Stubbed below.
  • Personal access token — fine for a single user's own account / dev. The
    /canvas/connect endpoint stores it ENCRYPTED for the signed-in user.

Fetching courses/files and running the ingest pipeline is a later task.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..config import settings
from ..models.db_models import User, CanvasConnection
from ..core.deps import get_current_user
from ..core.security import encrypt_secret

router = APIRouter(prefix="/canvas", tags=["canvas"])


class ConnectIn(BaseModel):
    access_token: str
    base_url: str | None = None


@router.post("/connect")
def connect_with_token(body: ConnectIn, db: Session = Depends(get_db),
                       user: User = Depends(get_current_user)):
    """Store a personal access token (encrypted at rest) for this user."""
    conn = db.query(CanvasConnection).filter(CanvasConnection.user_id == user.id).first()
    if not conn:
        conn = CanvasConnection(user_id=user.id)
        db.add(conn)
    conn.base_url = body.base_url or settings.canvas_base_url
    conn.token_encrypted = encrypt_secret(body.access_token)
    db.commit()
    return {"connected": True, "base_url": conn.base_url}


@router.get("/login")
def oauth_login():
    """Build the Canvas OAuth2 authorize URL. TODO (needs Developer Key)."""
    authorize = (
        f"{settings.canvas_base_url}/login/oauth2/auth"
        f"?client_id={settings.canvas_client_id}&response_type=code"
        f"&redirect_uri={settings.canvas_redirect_uri}"
    )
    return {"authorize_url": authorize}


@router.get("/callback")
def oauth_callback(code: str):
    """Exchange the code for a token at /login/oauth2/token. TODO."""
    raise NotImplementedError
