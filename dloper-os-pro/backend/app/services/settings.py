from __future__ import annotations

from typing import Dict

import shutil
from pathlib import Path
from typing import Dict

from fastapi import HTTPException, status

from ..core import config
from ..core.config import CONFIG_DIR, get_system_settings, save_yaml
from ..core.paths import BACKUPS_DIR, FILES_DIR, SITES_DIR
from ..models.settings import ResetRequest, SettingsUpdate
from ..services import users

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


def _clean_directory(path: Path) -> None:
    if not path.exists():
        return
    for child in path.iterdir():
        if child.is_dir():
            shutil.rmtree(child, ignore_errors=True)
        else:
            child.unlink(missing_ok=True)  # type: ignore[arg-type]


def reset_system(request: ResetRequest, current_username: str) -> Dict:
    phrase = "I want to reset my system"
    if request.confirmation.strip() != phrase:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Confirmation phrase mismatch")

    if not users.authenticate_user(current_username, request.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password incorrect")

    # reset configs
    save_yaml(CONFIG_DIR / "system.yaml", config.DEFAULT_SYSTEM)
    save_yaml(CONFIG_DIR / "users.yaml", config.DEFAULT_USERS)
    save_yaml(CONFIG_DIR / "websites.yaml", config.DEFAULT_WEBSITES)
    save_yaml(CONFIG_DIR / "files.yaml", config.DEFAULT_FILES)

    # clean data directories
    for dir_path in [SITES_DIR, FILES_DIR, BACKUPS_DIR]:
        _clean_directory(dir_path)

    # re-init to regenerate secret and seed admin user
    config.init_config()
    users.ensure_seed_user()

    return {"status": "reset", "message": "System restored to defaults. Seed admin recreated (admin/admin123)."}
