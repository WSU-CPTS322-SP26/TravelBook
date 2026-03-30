from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database.models import User
from database.session import get_session
from auth.auth_handler import get_current_user
from typing import List

router = APIRouter(tags=["friends"])

@router.get("/getFriends", response_model=List[User])
def get_friends(db: Session = Depends(get_session), 
                current_user: User = Depends(get_current_user)):
    friends = db.exec(select(User).where(User.id.in_(current_user.friends))).all()
    return friends

@router.get("/getUsername/{user_id}", response_model=str)
def get_username(user_id: int, db: Session = Depends(get_session)):
    user = db.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.username

@router.get("/getSuggestedFriends")
def get_suggested_friends(limit: int = None, 
                         db: Session = Depends(get_session), 
                         current_user: User = Depends(get_current_user)):
    # Get all users who are not already friends with current user
    query = select(User).where(~User.id.in_(current_user.friends + [current_user.id]))
    
    if limit:
        query = query.limit(limit)
    
    suggested = db.exec(query).all()
    
    # Return as list of dicts with id and name (actual name field)
    return [{"id": user.id, "name": user.name, "mutual": 0} for user in suggested]



@router.post("/addFriend/{user_id}")
def add_friend(user_id: int,
               db: Session = Depends(get_session), 
               current_user: User = Depends(get_current_user)):
    friend = db.exec(select(User).where(User.id == user_id)).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_id in current_user.friends:
        raise HTTPException(status_code=400, detail="Already friends")
    
    current_user.friends.append(user_id)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"message": "Friend added successfully"}

@router.delete("/removeFriend/{user_id}")
def remove_friend(user_id: int,
                  db: Session = Depends(get_session), 
                  current_user: User = Depends(get_current_user)):
    if user_id not in current_user.friends:
        raise HTTPException(status_code=400, detail="Not friends")
    
    current_user.friends.remove(user_id)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"message": "Friend removed successfully"}