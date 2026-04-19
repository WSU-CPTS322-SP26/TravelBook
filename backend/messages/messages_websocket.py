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
            match (data['ws_event']):
                case 'join_conversation':
                    await handle_join_conversation(user_id, data, manager)

                case 'leave_conversation':
                    await handle_leave_conversation(user_id, data, manager)

                case 'send_message':
                    await handle_send_message(user_id, data['message'], manager)

                case 'typing':
                    await handle_typing(user_id, data, manager)

                case 'add_poll':
                    await handle_poll(user_id, data['message'], manager)

                case 'update_vote':
                    await handle_update_vote(user_id, data['message'], manager)

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)