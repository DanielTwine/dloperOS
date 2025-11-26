from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt
from fastapi import HTTPException, status

from ..core.config import get_system_settings

ALGORITHM = "HS256"
ITERATIONS = 390_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return "pbkdf2${iter}${salt}${digest}".format(
        iter=ITERATIONS,
        salt=base64.b64encode(salt).decode(),
        digest=base64.b64encode(dk).decode(),
    )


def verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, iter_str, salt_b64, digest_b64 = encoded.split("$")
        if scheme != "pbkdf2":
            return False
        iterations = int(iter_str)
        salt = base64.b64decode(salt_b64.encode())
        expected = base64.b64decode(digest_b64.encode())
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
        return hmac.compare_digest(candidate, expected)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_minutes: Optional[int] = None) -> str:
    settings = get_system_settings()
    expiry = expires_minutes or settings.get("security", {}).get("token_expiry_minutes", 60)
    to_encode = data.copy()
    expire_at = datetime.utcnow() + timedelta(minutes=expiry)
    to_encode.update({"exp": expire_at})
    secret = settings.get("security", {}).get("secret_key")
    return jwt.encode(to_encode, secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    settings = get_system_settings()
    secret = settings.get("security", {}).get("secret_key")
    try:
        return jwt.decode(token, secret, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") from exc
    except jwt.PyJWTError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
