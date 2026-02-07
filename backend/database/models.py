from sqlmodel import SQLModel, Field, Relationship, Column, TIMESTAMP, JSON
from typing import Optional, List
import json
from datetime import datetime
from dotenv import load_dotenv
import os


class UserBase(SQLModel):
    id: int = Field(default=None, primary_key=True)
    username: str
    email: str


class User(UserBase, table=True):
    hashed_password: str = Field()


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class Trip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    user_id: int = Field(foreign_key="user.id")


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    sender_user_id: int = Field(foreign_key="user.id")
    reciever_user_id: int = Field(foreign_key="user.id")
    timestamp: Optional[datetime] = Field(sa_column=Column(TIMESTAMP(timezone=True), default=datetime.now()))


class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_ids: List[int] = Field()
    messages: List[Message] = Relationship(back_populates="conversation")
    trip: Trip = Relationship(back_populates="conversation")


class Location(SQLModel):
    latitude: Optional[float]
    longitude: Optional[float]
    name: str
    address: Optional[str] = None


class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    trip_id: int = Field(foreign_key="trip.id")
    date: datetime = Field(sa_column=Column(TIMESTAMP(timezone=True)))
    location: Location = Field(sa_column=Column(JSON))


class Album(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    trip_id: int = Field(foreign_key="trip.id")
    link: Optional[str] = None
