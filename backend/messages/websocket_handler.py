from .messages_db import *
from messages.connection_manager import ConnectionManager
from database.models import Message, Conversation, User
from database.session import get_session, engine
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload


manager = ConnectionManager()

async def handle_join_conversation(user_id: int, data: dict, manager: ConnectionManager):
    """Handle user joining a conversation"""
    conversation_id = data['conversation_id']
    manager.join_conversation(user_id, conversation_id)

    # Optionally send a message to other participants that a new user has joined
    await manager.send_to_conversation(conversation_id, {
        'type': 'user_joined',
        'user_id': user_id,
        'conversation_id': conversation_id
    })

async def handle_leave_conversation(user_id: int, data: dict, manager: ConnectionManager):
    """Handle user leaving a conversation"""
    conversation_id = data['conversation_id']
    manager.leave_conversation(user_id, conversation_id)

    # Optionally send a message to other participants that a user has left
    await manager.send_to_conversation(conversation_id, {
        'type': 'user_left',
        'user_id': user_id,
        'conversation_id': conversation_id
    })

async def handle_send_message(user_id: int, data: dict, manager: ConnectionManager):
    """Handle sending message"""
    conversation_id = int(data['conversation_id'])
    content = data['content']

    # Look up conversation participants from DB so all connected users receive the message,
    # even if they haven't opened the ChatPage (i.e. not in a conversation room).
    with Session(engine) as db:
        conversation = db.exec(
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .options(selectinload(Conversation.users))
        ).first()

    participant_ids = [u.id for u in conversation.users] if conversation else []

    message_payload = {
        'type': 'new_message',
        'message': {
            'id': int(conversation_id * 1000 + user_id),  # Temporary ID
            'conversation_id': conversation_id,
            'sender_id': user_id,
            'sender_user_id': user_id,
            'content': content,
            'author': data.get('author', f"User {user_id}")
        }
    }

    for pid in participant_ids:
        await manager.send_to_user(pid, message_payload)


async def handle_typing(user_id: int, data: dict, manager: ConnectionManager) :
    """Handle typing indicator"""
    conversation_id = data['conversation_id']
    
    # Broadcast to all users in conversation
    await manager.send_to_conversation(
        conversation_id,
        {'type': 'user_typing', 'user_id': user_id, 'conversation_id': conversation_id}
    )


async def handle_vote_place(user_id: int, data: dict, manager: ConnectionManager):
    """Handle voting on place"""
    place_id = data['place_id']
    plan_id = data['plan_id']
    conversation_id = data.get('conversation_id', 1)
    
    # For now, just broadcast the vote without database operations
    await manager.send_to_conversation(conversation_id, {
        'type': 'vote_place',
        'user_id': user_id,
        'place_id': place_id,
        'plan_id': plan_id
    })

async def handle_remove_vote(user_id: int, data: dict, manager: ConnectionManager):
    """Handle removing vote"""
    place_id = data['place_id']
    plan_id = data['plan_id']
    conversation_id = data.get('conversation_id', 1)
    
    # For now, just broadcast the removal without database operations
    await manager.send_to_conversation(conversation_id, {
        'type': 'remove_vote',
        'user_id': user_id,
        'place_id': place_id,
        'plan_id': plan_id
    })