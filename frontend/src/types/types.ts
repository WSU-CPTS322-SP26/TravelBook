export interface Conversation {
  id: number;
  name: string | null;
  is_group: boolean;
  users: User[];
  messages: Message[];
  trip: Trip | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  friends: number[];
}

export enum MessageType {
  TEXT = 'text',
  POLL = 'poll',
  IMAGE = 'image',
  VIDEO = 'video'
}

export interface Message {
  id: number | null;
  content: string;
  type: MessageType;
  meta_data: Record<string, Array<any>> | null; // e.g. for polls: { options: string, userIds: number[] } }
  sender_user_id: number;
  receiver_user_id: number | null; // null for group messages
  conversation_id: number | null;
  timestamp: string; // ISO 8601
}

// {
//   "message_type": "poll",
//   "content": "Where should we eat?",
//   "metadata": {
//     "options": { "Ramen": [1, 3], "Sushi": [2] },
//     "expires_at": "2026-04-01T00:00:00"
//   }
// }

export interface Trip {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
  conversation_id: number | null;
  start_date: string | null; // ISO 8601
  end_date: string | null;
}

export interface Friend {
  id: number;
  username: string;
  email: string;
}