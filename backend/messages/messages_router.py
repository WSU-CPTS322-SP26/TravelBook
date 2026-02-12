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
    db_message = Message.model_validate(message, update={"sender_user_id": current_user.id})
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/conversation/{conversation_id}", response_model=List[Message])
def get_conversation(conversation_id: int,
                     db: Session = Depends(get_session), 
                     current_user: User = Depends(get_current_user)):
    conversation = db.exec(select(Conversation).where(Conversation.id == conversation_id)).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in [user.id for user in conversation.user]:
        raise HTTPException(status_code=403, detail="Not authorized to view this conversation")
    return conversation.messages