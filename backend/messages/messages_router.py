from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database.models import Message, Conversation, User
from database.session import get_session
from auth.auth_handler import get_current_user
from typing import List
from .messages_db import *

router = APIRouter(tags=["messages"])

@router.post("/send")
def send_message(message: Message,
                db: Session = Depends(get_session), 
                current_user: User = Depends(get_current_user)):
    
    # Validate message has a conversation_id
    if message.conversation_id is None:
        raise HTTPException(status_code=400, detail=f"Message must be associated with a conversation {message}")
    
    # Check if conversation exists and user has access
    conversation = db.exec(select(Conversation).where(Conversation.id == message.conversation_id)).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in [user.id for user in conversation.users]:
        raise HTTPException(status_code=403, detail="Not authorized to send message in this conversation")
    
    db_message = Message.model_validate(message, update={"sender_user_id": current_user.id})
    

    return save_message(db_message, conversation, db)
    

@router.post("/conversation")
def create_conversation(conversation: Conversation,
                        db: Session = Depends(get_session), 
                        current_user: User = Depends(get_current_user)):
    db_conversation = Conversation.model_validate(conversation, update={"users": [current_user]})

    return create_conversation_handler(db_conversation, db)

@router.get("/conversation/{conversation_id}", response_model=List[Message])
def get_conversation_handler(conversation_id: int,
                     db: Session = Depends(get_session), 
                     current_user: User = Depends(get_current_user)):
    conversation = db.exec(select(Conversation).where(Conversation.id == conversation_id)).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in [user.id for user in conversation.users]:
        raise HTTPException(status_code=403, detail="Not authorized to view this conversation")
    return conversation.messages