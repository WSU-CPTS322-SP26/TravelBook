from sqlmodel import SQLModel, Field, Relationship, Column, TIMESTAMP, JSON
from typing import Dict, Optional, List
import json
from datetime import datetime
from dotenv import load_dotenv
import os
from enum import Enum

################################################
#
# User Models
#
################################################

class UserBase(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    email: str = Field(unique=True)
    name: str


class UserConversationLink(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", primary_key=True)
    conversation_id: Optional[int] = Field(default=None, foreign_key="conversation.id", primary_key=True)


class User(UserBase, table=True):    
    hashed_password: str = Field()
    conversations: List["Conversation"] = Relationship(back_populates="users", link_model=UserConversationLink)
    friends: List[int] = Field(sa_column=Column(JSON, default=[]))


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = None


class UserRead(SQLModel):
    id: int
    username: str
    email: str
    name: str

################################################
#
# Trip Models
#
################################################

class TripCreate(SQLModel, table=False):
    name: str
    description: Optional[str] = None
    conversation_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class Trip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    user_id: int = Field(foreign_key="user.id")
    conversation_id: Optional[int] = Field(default=None, foreign_key="conversation.id")
    conversation: Optional["Conversation"] = Relationship(back_populates="trip")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    events: List["Event"] = Relationship(back_populates="trip")
    albums: List["Album"] = Relationship(back_populates="trip")


class TripRead(SQLModel):
    id: int
    name: str
    description: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]

################################################
#
# Message Models
#
################################################

class MessageType(Enum):
    TEXT = 'text'
    POLL = 'poll'
    IMAGE = 'image'
    VIDEO = 'video'

class Poll(SQLModel):
    question: str
    options: Dict[str, List[int]] = Field(default_factory=dict)  # option -> list of user_ids who voted

# class MessageContent(SQLModel):
#     type: MessageType
#     content: json

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: Optional[str] = None
    type: MessageType = Field(default=MessageType.TEXT)
    meta_data: Optional[dict] = Field(sa_column= Column(JSON, nullable=True))
    sender_user_id: int = Field(foreign_key="user.id")
    receiver_user_id: Optional[int] = Field(foreign_key="user.id")
    conversation_id: Optional[int] = Field(default=None, foreign_key="conversation.id")
    timestamp: Optional[datetime] = Field(sa_column=Column(TIMESTAMP(timezone=True), default=datetime.now()))
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")

class MessageRead(SQLModel):
    id: int
    content: Optional[str]
    type: MessageType
    meta_data: Optional[dict]
    sender_user_id: int
    receiver_user_id: Optional[int]
    conversation_id: Optional[int]
    timestamp: Optional[datetime]


################################################
#
# Conversation Models
#
################################################

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = None
    is_group: bool = Field(default=False)
    users: List["User"] = Relationship(back_populates="conversations", link_model=UserConversationLink)
    messages: List["Message"] = Relationship(back_populates="conversation")
    trip: Optional["Trip"] = Relationship(back_populates="conversation")


class ConversationRead(SQLModel):
    id: int
    name: Optional[str]
    is_group: bool
    users: List[UserRead] = []
    messages: List[MessageRead] = []
    trip: Optional[TripRead] = None

################################################
#
# Event Models
#
################################################

class Location(SQLModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    name: str
    address: Optional[str] = None

class EventCreate(SQLModel, table=False):
    name: str
    description: Optional[str] = None
    trip_id: Optional[int] = None
    date: datetime
    location: dict

class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    description: Optional[str] = None
    trip_id: Optional[int] = Field(default=None, foreign_key="trip.id")
    date: datetime = Field(sa_column=Column(TIMESTAMP(timezone=True)))
    location: dict = Field(sa_column=Column(JSON, nullable=False))
    trip: "Trip" = Relationship(back_populates="events")


class Album(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    trip_id: Optional[int] = Field(default=None, foreign_key="trip.id")
    link: Optional[str] = None
    trip: "Trip" = Relationship(back_populates="albums")

################################################
#
# Event Models
#
################################################

class PaymentIntentRequest(SQLModel):
    amount: int