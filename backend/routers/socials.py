from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
import models
from auth import get_current_user, require_role

router = APIRouter(tags=["social"])


# ---------- Notes ----------
class NoteCreate(BaseModel):
    course_name: str
    content: str


@router.get("/notes")
def list_notes(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    notes = db.query(models.Note).filter(models.Note.student_id == user.id).order_by(models.Note.created_at.desc()).all()
    return [{"id": n.id, "course_name": n.course_name, "content": n.content, "created_at": n.created_at} for n in notes]


@router.post("/notes")
def add_note(payload: NoteCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    note = models.Note(student_id=user.id, course_name=payload.course_name, content=payload.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "course_name": note.course_name, "content": note.content, "created_at": note.created_at}


@router.get("/shared-notes")
def list_shared_notes(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    items = db.query(models.SharedNote).order_by(models.SharedNote.created_at.desc()).all()
    return [{"id": n.id, "course_name": n.course_name, "content": n.content, "created_at": n.created_at} for n in items]


@router.post("/shared-notes")
def create_shared_note(payload: NoteCreate, db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher"))):
    note = models.SharedNote(author_id=user.id, course_name=payload.course_name, content=payload.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "course_name": note.course_name, "content": note.content, "created_at": note.created_at}


# ---------- Conversations / Messages ----------
class SendMessageRequest(BaseModel):
    text: str


@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role == "student":
        teacher = db.query(models.User).filter(models.User.role == "teacher").first()
        if not teacher:
            return []
        conversation = (
            db.query(models.Conversation)
            .join(models.ConversationParticipant)
            .filter(models.ConversationParticipant.user_id == user.id)
            .filter(models.Conversation.id.in_(
                db.query(models.ConversationParticipant.conversation_id).filter(models.ConversationParticipant.user_id == teacher.id)
            ))
            .first()
        )
        if not conversation:
            conversation = models.Conversation(name=f"{user.name} ↔ {teacher.name}")
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            db.add_all([
                models.ConversationParticipant(conversation_id=conversation.id, user_id=user.id),
                models.ConversationParticipant(conversation_id=conversation.id, user_id=teacher.id),
            ])
            db.commit()
        return [{"id": conversation.id, "name": conversation.name, "last_message": ""}]

    conversations = (
        db.query(models.Conversation)
        .join(models.ConversationParticipant)
        .filter(models.ConversationParticipant.user_id == user.id)
        .all()
    )
    return [{"id": c.id, "name": c.name, "last_message": ""} for c in conversations]


@router.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        db.query(models.Message)
        .filter(models.Message.conversation_id == conversation_id)
        .order_by(models.Message.created_at)
        .all()
    )
    return [{"id": m.id, "sender_id": m.sender_id, "text": m.text, "created_at": m.created_at} for m in messages]


@router.post("/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: str,
    payload: SendMessageRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    message = models.Message(conversation_id=conversation_id, sender_id=user.id, text=payload.text)
    db.add(message)
    db.commit()
    db.refresh(message)
    return {"id": message.id, "sender_id": message.sender_id, "text": message.text, "created_at": message.created_at}


# ---------- Notifications ----------
@router.get("/notifications")
def list_notifications(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    items = db.query(models.Notification).filter(models.Notification.user_id == user.id).order_by(models.Notification.created_at.desc()).all()
    return [{"id": n.id, "text": n.text, "read": n.read, "created_at": n.created_at} for n in items]


@router.post("/notifications/mark-all-read")
def mark_all_read(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    db.query(models.Notification).filter(models.Notification.user_id == user.id).update({"read": True})
    db.commit()
    return {"updated": True}


# ---------- Announcements ----------
class AnnouncementCreate(BaseModel):
    title: str
    body: str
    course_name: str = "All Courses"


@router.get("/announcements")
def list_announcements(db: Session = Depends(get_db)):
    items = db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).all()
    return [{"id": a.id, "title": a.title, "body": a.body, "course_name": a.course_name, "created_at": a.created_at} for a in items]


@router.post("/announcements")
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher"))):
    ann = models.Announcement(author_id=user.id, **payload.dict())
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return {"id": ann.id, "title": ann.title, "body": ann.body, "course_name": ann.course_name, "created_at": ann.created_at}