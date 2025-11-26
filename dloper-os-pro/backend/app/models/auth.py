from pydantic import BaseModel, EmailStr

from .user import User


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "viewer"


class AuthUser(User):
    pass
