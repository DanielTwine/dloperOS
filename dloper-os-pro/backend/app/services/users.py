from __future__ import annotations

import datetime as dt
from typing import Dict, List, Optional

from ..core import config
from ..core.config import CONFIG_DIR, save_yaml
from ..utils.security import hash_password, verify_password

USERS_PATH = CONFIG_DIR / "users.yaml"

UserRecord = Dict[str, str]


def _sanitize(user: UserRecord) -> UserRecord:
    clean = user.copy()
    clean.pop("password_hash", None)
    return clean


def load_users() -> List[UserRecord]:
    data = config.get_users_config()
    return data.get("users", [])


def save_users(users: List[UserRecord]) -> None:
    save_yaml(USERS_PATH, {"users": users})


def ensure_seed_user() -> UserRecord:
    users = load_users()
    if users:
        return users[0]
    admin_user: UserRecord = {
        "username": "admin",
        "email": "admin@example.com",
        "role": "owner",
        "password_hash": hash_password("admin123"),
        "created_at": dt.datetime.utcnow().isoformat(),
    }
    save_users([admin_user])
    return admin_user


def get_user_by_username(username: str) -> Optional[UserRecord]:
    for user in load_users():
        if user.get("username") == username:
            return user
    return None


def authenticate_user(username: str, password: str) -> Optional[UserRecord]:
    user = get_user_by_username(username)
    if not user:
        return None
    if not verify_password(password, user.get("password_hash", "")):
        return None
    return user


def create_user(username: str, email: str, role: str, password: str) -> UserRecord:
    users = load_users()
    if any(u.get("username") == username for u in users):
        raise ValueError("User already exists")
    record: UserRecord = {
        "username": username,
        "email": email,
        "role": role,
        "password_hash": hash_password(password),
        "created_at": dt.datetime.utcnow().isoformat(),
    }
    users.append(record)
    save_users(users)
    return record


def list_users(safe: bool = True) -> List[UserRecord]:
    users = load_users()
    if safe:
        return [_sanitize(u) for u in users]
    return users


def update_user(username: str, payload: Dict[str, str]) -> Optional[UserRecord]:
    users = load_users()
    updated: Optional[UserRecord] = None
    for idx, user in enumerate(users):
        if user.get("username") == username:
            user.update({k: v for k, v in payload.items() if k in {"email", "role"}})
            if password := payload.get("password"):
                user["password_hash"] = hash_password(password)
            updated = user
            users[idx] = user
            break
    if updated:
        save_users(users)
    return updated


def delete_user(username: str) -> bool:
    users = load_users()
    remaining = [u for u in users if u.get("username") != username]
    if len(remaining) == len(users):
        return False
    save_users(remaining)
    return True
