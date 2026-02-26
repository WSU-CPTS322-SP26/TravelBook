from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database.models import Trip, TripCreate, User
from database.session import get_session
from auth.auth_handler import get_current_user
from typing import List

router = APIRouter(tags=["trips"])

@router.post("/create")
def create_trip(trip: TripCreate,
                db: Session = Depends(get_session), 
                current_user: User = Depends(get_current_user)):
    db_trip = Trip.model_validate(trip, update={"user_id": current_user.id})
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.get("/getTrips", response_model=List[Trip])
def get_trips(db: Session = Depends(get_session), 
              current_user: User = Depends(get_current_user)):
    trips = db.exec(select(Trip).where(Trip.user_id == current_user.id)).all()
    return trips

@router.get("/{trip_id}", response_model=Trip)
def get_trip_by_id(trip_id: int,
                   db: Session = Depends(get_session), 
                   current_user: User = Depends(get_current_user)):
    trip = db.exec(select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.delete("/{trip_id}")
def delete_trip(trip_id: int,
                db: Session = Depends(get_session), 
                current_user: User = Depends(get_current_user)):
    trip = db.exec(select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"detail": "Trip deleted successfully"}