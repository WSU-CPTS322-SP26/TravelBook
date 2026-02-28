from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database.models import User, Event
from database.session import get_session
from auth.auth_handler import get_current_user
from typing import List

router = APIRouter(tags=["events"])

@router.post("/create")
def create_event(event: Event,
                 db: Session = Depends(get_session), 
                 current_user: User = Depends(get_current_user)):
    db_event = Event.model_validate(event, update={"user_id": current_user.id})
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.get("/{date}", response_model=List[Event])
def get_events_by_date(date: str,
            db: Session = Depends(get_session), 
            current_user: User = Depends(get_current_user)):
    events = db.exec(select(Event).where(Event.user_id == current_user.id, Event.date == date)).all()
    return events

@router.get("/{event_id}", response_model=Event)
def get_event_by_id(event_id: int,
            db: Session = Depends(get_session), 
            current_user: User = Depends(get_current_user)):
    event = db.exec(select(Event).where(Event.id == event_id, Event.user_id == current_user.id)).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/{trip_id}", response_model=List[Event])
def get_events_by_date(trip_id: int,
            db: Session = Depends(get_session), 
            current_user: User = Depends(get_current_user)):
    events = db.exec(select(Event).where(Event.user_id == current_user.id, Event.trip_id == trip_id)).all()
    return events

@router.delete("/{event_id}")
def delete_event(event_id: int,
            db: Session = Depends(get_session), 
            current_user: User = Depends(get_current_user)):
    event = db.exec(select(Event).where(Event.id == event_id, Event.user_id == current_user.id)).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"detail": "Event deleted successfully"}

@router.put("/{event_id}", response_model=Event)
def update_event(event_id: int,
            event: Event,
            db: Session = Depends(get_session), 
            current_user: User = Depends(get_current_user)):
    db_event = db.exec(select(Event).where(Event.id == event_id, Event.user_id == current_user.id)).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    updated_event = Event.model_validate(event, update={"id": event_id, "user_id": current_user.id})
    db.add(updated_event)
    db.commit()
    db.refresh(updated_event)
    return updated_event