from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from ..models.user import User, UserCreate, UserUpdate
from ..services import users
from ..utils import deps

router = APIRouter()


@router.get("/", response_model=List[User])
def list_users(current_user=Depends(deps.require_role("owner", "admin"))):
    return users.list_users()


@router.post("/", response_model=User)
def create_user(payload: UserCreate, current_user=Depends(deps.require_role("owner", "admin"))):
    try:
        created = users.create_user(payload.username, payload.email, payload.role, payload.password)
        return users._sanitize(created)  # type: ignore[attr-defined]
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/{username}", response_model=User)
def update_user(username: str, payload: UserUpdate, current_user=Depends(deps.require_role("owner", "admin"))):
    updated = users.update_user(username, payload.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return users._sanitize(updated)  # type: ignore[attr-defined]


@router.delete("/{username}")
def delete_user(username: str, current_user=Depends(deps.require_role("owner"))):
    if username == current_user.get("username"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")
    removed = users.delete_user(username)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"status": "deleted"}
