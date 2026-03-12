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

export interface Message {
  id: number;
  content: string;
  sender_user_id: number;
  receiver_user_id: number | null; // null for group messages
  conversation_id: number | null;
  timestamp: string; // ISO 8601
}

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