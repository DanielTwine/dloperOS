from typing import Optional

from pydantic import BaseModel, EmailStr


class User(BaseModel):
    username: str
    email: EmailStr
    role: str
    created_at: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    role: str = "viewer"
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None
