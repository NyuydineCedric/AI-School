from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
import models
from auth import (
    verify_password,
    hash_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "student" | "teacher" | "admin"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    user_id: str


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(
        {"sub": user.id, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(access_token=token, role=user.role, name=user.name, user_id=user.id)


# Public self-registration is limited to students. Teacher/admin accounts are
# higher-privilege (can create courses, grade, message every student, etc.)
# and shouldn't be self-service — create those via the seed script or have an
# existing admin add them.
@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Public registration is only available for student accounts.",
        )

    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="student",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenResponse(access_token=token, role=user.role, name=user.name, user_id=user.id)


@router.get("/me")
def me(user: models.User = Depends(get_current_user)):
    return {
        "id": user.id, "name": user.name, "email": user.email,
        "role": user.role, "bio": user.bio or "",
    }


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"saved": True}


class UpdateProfileRequest(BaseModel):
    name: str
    email: str
    bio: str = ""


@router.post("/profile")
def update_profile(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if not payload.name.strip() or not payload.email.strip():
        raise HTTPException(status_code=400, detail="Name and email are required.")

    existing = (
        db.query(models.User)
        .filter(models.User.email == payload.email, models.User.id != user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="That email is already in use.")

    user.name = payload.name.strip()
    user.email = payload.email.strip()
    user.bio = payload.bio.strip()
    db.commit()
    return {
        "id": user.id, "name": user.name, "email": user.email,
        "role": user.role, "bio": user.bio or "",
    }