from __future__ import annotations

from typing import Dict

from fastapi import HTTPException, status

from ..core.config import CONFIG_DIR, get_system_settings, save_yaml
from ..models.settings import SettingsUpdate

SYSTEM_PATH = CONFIG_DIR / "system.yaml"


def fetch_settings() -> Dict:
    return get_system_settings()


def update_settings(payload: SettingsUpdate) -> Dict:
    current = get_system_settings()
    if payload.name is not None:
        current.setdefault("instance", {})["name"] = payload.name
    if payload.base_url is not None:
        current.setdefault("instance", {})["base_url"] = payload.base_url
    if payload.analytics_enabled is not None:
        current.setdefault("analytics", {})["enabled"] = payload.analytics_enabled
    if payload.token_expiry_minutes is not None:
        current.setdefault("security", {})["token_expiry_minutes"] = payload.token_expiry_minutes

    save_yaml(SYSTEM_PATH, current)
    return current
