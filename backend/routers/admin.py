from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
import models
from auth import require_role, hash_password

router = APIRouter(prefix="/admin", tags=["admin"])


def _serialize_user(u: models.User) -> dict:
    return {"id": u.id, "name": u.name, "email": u.email, "role": u.role}


@router.get("/users")
def list_users(db: Session = Depends(get_db), _: models.User = Depends(require_role("admin"))):
    users = db.query(models.User).order_by(models.User.role, models.User.name).all()
    return [_serialize_user(u) for u in users]


class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "student" | "teacher" | "admin"


@router.post("/users")
def create_user(
    payload: CreateUserRequest,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role("admin")),
):
    if payload.role not in ("student", "teacher", "admin"):
        raise HTTPException(status_code=400, detail="Role must be student, teacher, or admin.")
    if not payload.name.strip() or not payload.email.strip():
        raise HTTPException(status_code=400, detail="Name and email are required.")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = models.User(
        name=payload.name.strip(),
        email=payload.email.strip(),
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # A course auto-enrolls every existing student when it's created (see
    # create_course in academics.py). Mirror that here: a student added after
    # the fact should see every existing course too, not start with zero.
    if user.role == "student":
        for course in db.query(models.Course).all():
            db.add(models.Enrollment(student_id=user.id, course_id=course.id, progress=0))
        db.commit()

    return _serialize_user(user)


class ResetPasswordRequest(BaseModel):
    new_password: str


@router.post("/users/{user_id}/reset-password")
def reset_password(
    user_id: str,
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role("admin")),
):
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"saved": True}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role("admin")),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You can't delete your own account.")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    db.delete(user)
    db.commit()
    return {"deleted": True}
