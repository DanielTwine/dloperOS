from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from ..models.auth import LoginRequest, RegisterRequest, Token
from ..models.user import User
from ..services import users
from ..utils import deps
from ..utils.security import create_access_token

router = APIRouter()


@router.post("/register", response_model=User)
def register(payload: RegisterRequest, current_user=Depends(deps.get_optional_user)):
    # Only owners/admins can create users; if only seed user exists, allow self-registration
    existing = users.list_users()
    if len(existing) > 0 and (not current_user or current_user.get("role") not in {"owner", "admin"}):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    try:
        new_user = users.create_user(payload.username, payload.email, payload.role, payload.password)
        return users._sanitize(new_user)  # type: ignore[attr-defined]
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=User)
def me(current_user=Depends(deps.get_current_user)):
    return current_user
