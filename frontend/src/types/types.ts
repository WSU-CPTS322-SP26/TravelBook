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
  name: string;
  friends: number[];
}

export interface SuggestedFriend {
    id: number;
    name: string;
    mutual: number;
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
  name: string;
  username: string;
  email: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface Event {
 id: number | null;
 user_id: number;
 title: string;
 description: string | null;
 start: string; // ISO 8601 datetime
 end: string; // ISO 8601 datetime
 location: {
   name?: string;
   address?: string;
   latitude?: number;
   longitude?: number;
   [key: string]: any; // for any additional location details
 };
 trip_id: number | null;
}

// class Event(SQLModel, table=True):
//     id: Optional[int] = Field(default=None, primary_key=True)
//     user_id: int = Field(foreign_key="user.id")
//     title: str
//     description: Optional[str] = None
//     trip_id: Optional[int] = Field(default=None, foreign_key="trip.id")
//     start: datetime = Field(sa_column=Column(TIMESTAMP(timezone=True)))
//     end: datetime = Field(sa_column=Column(TIMESTAMP(timezone=True)))
//     location: dict = Field(sa_column=Column(JSON, nullable=False))
//     trip: "Trip" = Relationship(back_populates="events")