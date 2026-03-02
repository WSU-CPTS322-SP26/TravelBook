from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .connection_manager import ConnectionManager
from .websocket_handler import *
from auth.auth_handler import get_current_user

router = APIRouter()

manager = ConnectionManager()

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Route to appropriate handler function
            if data['type'] == 'join_conversation':
                await handle_join_conversation(user_id, data, manager)
            
            elif data['type'] == 'leave_conversation':
                await handle_leave_conversation(user_id, data, manager)
            
            elif data['type'] == 'send_message':
                await handle_send_message(user_id, data, manager)
            
            elif data['type'] == 'typing':
                await handle_typing(user_id, data, manager)
            
            elif data['type'] == 'vote_place':
                await handle_vote_place(user_id, data, manager)
            
            elif data['type'] == 'remove_vote':
                await handle_remove_vote(user_id, data, manager)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)