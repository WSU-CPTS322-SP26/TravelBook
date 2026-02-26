from fastapi import WebSocket
from typing import Dict, List, Set

class ConnectionManager:
    def __init__(self, websocket: WebSocket, user_id: int):
        self.active_connections: list[WebSocket] = []

        self.user_connections: Dict[int, List[WebSocket]] = {}

        self.conversation_rooms: Dict[int, Set[int]] = {}

        self.user_active_rooms: Dict[int, Set[int]] = {}


#
# Connection management
#
    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept WebSocket connection for a user"""
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
            self.user_active_rooms[user_id] = set()

        self.user_connections[user_id].append(websocket)
        print(f"User {user_id} connected. Total connections: {len(self.user_connections[user_id])}")


    def disconnect(self, websocket: WebSocket, user_id: int):
        """Remove WebSocket connection for a user"""
        if user_id in self.user_connections:
            self.user_connections[user_id].remove(websocket)

            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

                for conv_id in list(self.user_active_rooms.get(user_id, [])):
                        del self.conversation_rooms[conv_id]

        print(f"User {user_id} disconnected. Remaining connections: {len(self.user_connections.get(user_id, []))}")


    def is_user_connected(self, user_id: int) -> bool:
        """Check if a user is connected"""
        return user_id in self.user_connections and len(self.user_connections[user_id]) > 0


#
# Room management
#
    def join_conversation(self, user_id: int, conversation_id: int) -> None:
        """User joins a conversation room"""
        if conversation_id not in self.conversation_rooms:
            self.conversation_rooms[conversation_id] = set()

        self.conversation_rooms[conversation_id].add(user_id)

        if user_id not in self.user_active_rooms:
            self.user_active_rooms[user_id] = set()

        self.user_active_rooms[user_id].add(conversation_id)

        print(f"User {user_id} joined conversation {conversation_id}.")
        print(f"Active users in conversation: {len(self.conversation_rooms[conversation_id])}")


    def leave_conversation(self, user_id: int, conversation_id: int):
        """User leaves a conversation room"""
        if conversation_id in self.conversation_rooms:
            self.conversation_rooms[conversation_id].discard(user_id)

            if not self.conversation_rooms[conversation_id]:
                del self.conversation_rooms[conversation_id]

        if user_id in self.user_active_rooms:
            self.user_active_rooms[user_id].discard(conversation_id)

        print(f"User {user_id} left conversation {conversation_id}.")
        print(f"Active users in conversation: {len(self.conversation_rooms.get(conversation_id, []))}")


    def get_conversation_participants(self, conversation_id: int) -> Set[int]:
        """Get all user IDs in a conversation room"""
        return self.conversation_rooms.get(conversation_id, set())


#
# Broadcasting
#
    async def send_to_user(self, user_id: int, message: str):
        """Send a personal  message to all their devices"""
        if user_id in self.user_connections:
            disconnected = []

            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending message to user {user_id}: {e}")
                    disconnected.append(connection)

            for connection in disconnected:
                self.user_connections[user_id].remove(connection)


    async def broadcast_to_conversation(self, conversation_id: int, message: str):
        """Broadcast a message to all users in a conversation room"""
        if conversation_id not in self.conversation_rooms:
            print(f"No active users in conversation {conversation_id} to broadcast message.")
            return
        
        users_in_room = self.conversation_rooms[conversation_id]

        for user_id in users_in_room:
            await self.send_personal_message(user_id, message)

        print(f"Broadcasted message to conversation {conversation_id} for users: {users_in_room}")


    async def broadcast_to_all(self, participant_ids: List[int], message: str):
        """Broadcast a message to all users in a conversation room"""
        for user_id in participant_ids:
            await self.send_personal_message(user_id, message)
