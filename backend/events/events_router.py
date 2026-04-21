from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database.models import User, Event, EventCreate
from database.session import get_session
from auth.auth_handler import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(tags=["events"])

@router.post("/create")
def create_event(event: EventCreate,
                 db: Session = Depends(get_session), 
                 current_user: User = Depends(get_current_user)):
    db_event = Event.model_validate(event, update={"user_id": current_user.id})
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.get("/by-date/{date}", response_model=List[Event])
def get_events_by_date(date: str,
            db: Session = Depends(get_session), 
            current_user: User = Depends(get_current_user)):
    # Parse the date string (expecting ISO format: YYYY-MM-DD)
    try:
        target_date = datetime.fromisoformat(date.replace("Z", "+00:00")).date()
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD or ISO 8601)")
    
    # Get all events for the user and filter by date
    all_events = db.exec(select(Event).where(Event.user_id == current_user.id)).all()
    filtered_events = [e for e in all_events if e.start.date() == target_date]
    return filtered_events

@router.get("/by-id/{event_id}", response_model=Event)
def get_event_by_id(event_id: int,
            db: Session = Depends(get_session), 
            current_user: User = Depends(get_current_user)):
    event = db.exec(select(Event).where(Event.id == event_id, Event.user_id == current_user.id)).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/by-trip/{trip_id}", response_model=List[Event])
def get_events_by_trip(trip_id: int,
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
            event: EventCreate,
            db: Session = Depends(get_session), 
            current_user: User = Depends(get_current_user)):
    db_event = db.exec(select(Event).where(Event.id == event_id, Event.user_id == current_user.id)).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db_event.title = event.title
    db_event.description = event.description
    db_event.trip_id = event.trip_id
    db_event.start = event.start
    db_event.end = event.end
    db_event.location = event.location
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event