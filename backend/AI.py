#AI Tutor
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List

from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

app = FastAPI()

class ChatMessage(BaseModel):
    role: str        # "user" or "assistant"
    content: str

class Question(BaseModel):
    messages: List[ChatMessage]   # full conversation so far, not just one question
    accent: str = "USA"
    temperature: float = 1.0

@app.post("/ai")
def ask_ai(q: Question):
    lim = ChatGoogleGenerativeAI(
        model = "gemini-3.1-flash-lite",
        google_api_key = GOOGLE_API_KEY,
        temperature = q.temperature
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


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)