"""Auth dependencies: resolve the current user from a Bearer JWT."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.db_models import User
from .security import decode_token

bearer = HTTPBearer(auto_error=True)


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    cred_err = HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    try:
        payload = decode_token(creds.credentials)
        email = payload.get("sub")
    except Exception:
        raise cred_err
    if not email:
        raise cred_err
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise cred_err
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user
