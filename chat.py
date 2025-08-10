# routers/chat.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.pydantic import ChatInput, ChatResponse
from services.chat_service import chat_service
from utils.database import get_db
from utils.config import get_settings

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
@limiter.limit(settings.rate_limit)
async def chat(
    request: Request,
    chat_input: ChatInput,
    db: Session = Depends(get_db)
) -> ChatResponse:
    """Enhanced chat endpoint with database persistence"""
    try:
        return await chat_service.process_chat_message(
            db, chat_input.user_id, chat_input.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Chat service unavailable")
