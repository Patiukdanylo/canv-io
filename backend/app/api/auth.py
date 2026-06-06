"""App authentication: register, login (JWT), and current-user."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.db_models import User
from ..core.security import hash_password, verify_password, create_access_token
from ..core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


@router.post("/register", response_model=TokenOut, status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if len(body.password) < 6:
        raise HTTPException(422, "Password must be at least 6 characters.")
    email = body.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(409, "That email is already registered.")
    user = User(name=body.name.strip(), email=email,
                password_hash=hash_password(body.password), role="student")
    db.add(user); db.commit(); db.refresh(user)
    return TokenOut(access_token=create_access_token(user.email, user.role))


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    return TokenOut(access_token=create_access_token(user.email, user.role))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
