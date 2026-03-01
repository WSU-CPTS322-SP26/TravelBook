from database.models import Message, Conversation, User
from database.session import get_session
from auth.auth_handler import get_current_user
from fastapi import Depends, HTTPException
from sqlmodel import Session, select


def save_message(message: Message, conversation: Conversation,
                db: Session = Depends(get_session)):
    
    # Add message to conversation's message list
    conversation.messages.append(message)
    db.add(message)
    db.add(conversation)
    db.commit()
    db.refresh(message)
    
    return message


def create_conversation_handler(conversation: Conversation,
                        db: Session = Depends(get_session)):
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation