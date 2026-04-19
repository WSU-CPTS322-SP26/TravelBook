from typing_extensions import Annotated
from fastapi import HTTPException, Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from database.models import User, UserCreate, UserUpdate
from database.session import get_session
from auth.auth_handler import *
from auth.auth_model import *


router = APIRouter(tags=["auth"])

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_session)):
    # Check if user with email or username already exists
    existing_user = get_user(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    from sqlmodel import select
    username_exists = db.exec(select(User).where(User.username == user.username)).first()
    if username_exists:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
      db: Session = Depends(get_session)
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
              headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=float(ACCESS_TOKEN_EXPIRE_MINUTES))
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user
