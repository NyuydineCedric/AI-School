import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List

from auth import get_current_user, require_role
import models

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

router = APIRouter(tags=["ai"])


def extract_text(content) -> str:
    """Gemini sometimes returns content as a list of blocks (e.g.
    [{'type': 'text', 'text': '...'}]) instead of a plain string. Flatten
    that down to plain text either way."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for chunk in content:
            if isinstance(chunk, str):
                parts.append(chunk)
            elif isinstance(chunk, dict) and "text" in chunk:
                parts.append(chunk["text"])
        return "".join(parts)
    return str(content)


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class Question(BaseModel):
    messages: List[ChatMessage]
    accent: str = "USA"
    temperature: float = 1.0


@router.post("/ai")
def ask_ai(q: Question, user: models.User = Depends(get_current_user)):
    lim = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite",
        google_api_key=GOOGLE_API_KEY,
        temperature=q.temperature,
    )

    message = [
        ("system", f"You are an AI tutor and you answer questions only for AI related topics. Reply in a {q.accent} English tone.")
    ]
    for m in q.messages:
        message.append((m.role, m.content))

    def token_stream():
        for part in lim.stream(message):
            if isinstance(part.content, str):
                yield part.content
            elif isinstance(part.content, list):
                for chunk in part.content:
                    if isinstance(chunk, str):
                        yield chunk
                    elif isinstance(chunk, dict) and "text" in chunk:
                        yield chunk["text"]

    return StreamingResponse(token_stream(), media_type="text/plain")


class GenerateNotesRequest(BaseModel):
    course_name: str
    topic: str = ""


class GenerateNotesResponse(BaseModel):
    content: str


@router.post("/ai/generate-notes", response_model=GenerateNotesResponse)
def generate_notes(
    payload: GenerateNotesRequest,
    user: models.User = Depends(require_role("teacher")),
):
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.5,
    )

    prompt = f'Write clear, well-organized study notes for a course called "{payload.course_name}".'
    if payload.topic.strip():
        prompt += f" Focus specifically on this topic: {payload.topic.strip()}."
    prompt += (
        " Use short paragraphs and/or bullet points, keep it study-friendly, "
        "and keep the whole thing under roughly 300 words."
    )

    response = llm.invoke([
        ("system", "You are an assistant that writes clear, well-structured class notes for students."),
        ("user", prompt),
    ])
    content = extract_text(response.content)
    return GenerateNotesResponse(content=content)