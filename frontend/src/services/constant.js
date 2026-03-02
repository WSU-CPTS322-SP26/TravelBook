// WebSocket event types
export const WS_EVENTS = {
  // Outgoing (client → server)
  SEND_MESSAGE: 'send_message',
  ADD_PLACE: 'add_place',
  REMOVE_PLACE: 'remove_place',
  UPDATE_PLACE: 'update_place',
  TYPING: 'typing',
  JOIN_PLAN: 'join_plan',
  LEAVE_PLAN: 'leave_plan',
  
  // Incoming (server → client)
  NEW_MESSAGE: 'new_message',
  PLACE_ADDED: 'place_added',
  PLACE_REMOVED: 'place_removed',
  PLACE_UPDATED: 'place_updated',
  USER_TYPING: 'user_typing',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ONLINE_USERS: 'online_users',
  NOTIFICATION: 'notification',
  
  // Connection
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};