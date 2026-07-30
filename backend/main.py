from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
from seed_data import seed_if_empty

import models
from routers import auth, academics, ai

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart School AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(academics.router)
app.include_router(ai.router)

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