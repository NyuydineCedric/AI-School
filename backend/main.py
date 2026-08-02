import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from database import engine, Base, SessionLocal
from seed_data import seed_if_empty

import models
from routers import auth, academics, ai, socials, admin

Base.metadata.create_all(bind=engine)


def ensure_exam_answer_columns():
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("exam_answers")}
    if "score" not in columns or "feedback" not in columns:
        with SessionLocal() as db:
            if "score" not in columns:
                db.execute(text("ALTER TABLE exam_answers ADD COLUMN score VARCHAR DEFAULT '-'"))
            if "feedback" not in columns:
                db.execute(text("ALTER TABLE exam_answers ADD COLUMN feedback TEXT"))
            db.commit()


ensure_exam_answer_columns()

app = FastAPI(title="Smart School AI Backend")

# In production (Render), set ALLOWED_ORIGINS to a comma-separated list of the
# real frontend URL(s), e.g.:
#   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main-you.vercel.app
# Localhost is always allowed via the regex below so local dev keeps working
# regardless of that env var.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(academics.router)
app.include_router(ai.router)
app.include_router(socials.router)
app.include_router(admin.router)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Smart School AI Backend is running."
    }