from __future__ import annotations

from typing import Callable, Dict, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from ..services import users
from ..utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_optional_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[Dict]:
    if not token:
        return None
    payload = decode_access_token(token)
    username = payload.get("sub")
    if not username:
        return None
    user = users.get_user_by_username(username)
    return users._sanitize(user) if user else None  # type: ignore[attr-defined]


def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Dict:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = users.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return users._sanitize(user)  # type: ignore[attr-defined]


def require_role(*roles: str) -> Callable[[Dict], Dict]:
    def checker(current_user: Dict = Depends(get_current_user)) -> Dict:
        if current_user.get("role") not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return checker
