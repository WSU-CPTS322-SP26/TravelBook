from .messages_db import *
from messages.connection_manager import ConnectionManager
from database.models import Conversation, MessageType, User, Message
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
    meta_data = data['meta_data']

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
        'ws_event': 'new_message',
        'message': {
            'id': int(conversation_id * 1000 + user_id),  # Temporary ID
            'conversation_id': conversation_id,
            'sender_id': user_id,
            'sender_user_id': user_id,
            'content': content,
            'type': MessageType.TEXT.value,
            'meta_data': meta_data,
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


async def handle_poll(user_id: int, data: Message, manager: ConnectionManager):
    """Handle creating a poll"""
    conversation_id = int(data['conversation_id'])
    content = data['content']
    meta_data = data['meta_data']

    # Look up conversation and save poll to database
    with Session(engine) as db:
        conversation = db.exec(
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .options(selectinload(Conversation.users))
        ).first()

        if not conversation:
            raise ValueError("Conversation not found")

        # Create and save message to database
        poll_message = Message(
            conversation_id=conversation_id,
            sender_user_id=user_id,
            content=content,
            type=MessageType.POLL,
            meta_data=meta_data
        )
        
        db.add(poll_message)
        db.commit()
        db.refresh(poll_message)
        
        participant_ids = [u.id for u in conversation.users]
        poll_id = poll_message.id

    # Broadcast poll to all participants
    message_payload = {
        'ws_event': 'add_poll',
        'message': {
            'id': poll_id,
            'conversation_id': conversation_id,
            'sender_id': user_id,
            'sender_user_id': user_id,
            'content': content,
            'type': MessageType.POLL.value,
            'meta_data': meta_data,
            'author': f"User {user_id}"
        }
    }

    for pid in participant_ids:
        await manager.send_to_user(pid, message_payload)

async def handle_update_vote(user_id: int, data: Message, manager: ConnectionManager):
    """Handle updating a vote"""
    conversation_id = int(data['conversation_id'])
    message_id = int(data['message_id'])

    # Look up poll and update vote
    with Session(engine) as db:
        poll = db.exec(
            select(Message)
            .where(Message.id == message_id)
        ).first()
        
        if not poll:
            raise ValueError("Poll message not found")
        
        # Overwrite meta_data with new vote data
        poll.meta_data = data['meta_data']
        db.add(poll)
        db.commit()
        db.refresh(poll)

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
        'ws_event': 'update_poll',
        'message': {
            'id': message_id,
            'conversation_id': conversation_id,
            'sender_id': user_id,
            'sender_user_id': user_id,
            'content': poll.content,
            'type': MessageType.POLL.value,
            'meta_data': poll.meta_data,
            'author': data.get('author', f"User {user_id}")
        }
    }

    for pid in participant_ids:
        await manager.send_to_user(pid, message_payload)
