from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database.models import Message, Conversation, User
from database.session import get_session
from auth.auth_handler import get_current_user
from typing import List

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/send")
def send_message(message: Message,
                db: Session = Depends(get_session), 
                current_user: User = Depends(get_current_user)):
    pass

@router.get("/conversation/{conversation_id}", response_model=List[Message])
def get_conversation(conversation_id: int,
                     db: Session = Depends(get_session), 
                     current_user: User = Depends(get_current_user)):
    pass