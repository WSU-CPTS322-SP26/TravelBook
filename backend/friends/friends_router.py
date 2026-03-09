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

@router.post("/addFriend/{friend_id}")
def add_friend(friend_id: int,
               db: Session = Depends(get_session), 
               current_user: User = Depends(get_current_user)):
    friend = db.exec(select(User).where(User.id == friend_id)).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
    
    if friend_id in current_user.friends:
        raise HTTPException(status_code=400, detail="Already friends")
    
    current_user.friends.append(friend_id)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"message": "Friend added successfully"}

@router.delete("/removeFriend/{friend_id}")
def remove_friend(friend_id: int,
                  db: Session = Depends(get_session), 
                  current_user: User = Depends(get_current_user)):
    if friend_id not in current_user.friends:
        raise HTTPException(status_code=400, detail="Not friends")
    
    current_user.friends.remove(friend_id)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"message": "Friend removed successfully"}