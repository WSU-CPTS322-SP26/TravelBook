from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .connection_manager import ConnectionManager

router = APIRouter()

manager = ConnectionManager()

# @router.websocket("sendmsg")
# async def websocket_endpoint(websocket: WebSocket):
#     await manager.connect(websocket)
#     try: 
#         while True:
#             data = await websocket.receive_json()
#             await manager.broadcast_to_all(f"Message received: {data}")

#     except WebSocketDisconnect:
#         manager.disconnect(websocket)
#         await manager.broadcast_to_all("A user has disconnected.")


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data['type'] == 'send_message':
                # Handle message
                ...
            
            elif data['type'] == 'vote_place':
                # Handle vote
                ...
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)