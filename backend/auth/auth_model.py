from pydantic import BaseModel

class TokenData(BaseModel):
    email: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: str | None = None
    username: str | None = None
    name: str | None = None
