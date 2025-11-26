from __future__ import annotations

import secrets
from pathlib import Path
from typing import Any, Dict

import yaml

from .paths import BACKUPS_DIR, CONFIG_DIR, DATA_DIR, FILES_DIR, SITES_DIR

DEFAULT_SYSTEM = {
    "instance": {
        "name": "DloperOS Pro",
        "base_url": "http://localhost:8000",
    },
    "security": {
        "secret_key": "",
        "token_expiry_minutes": 90,
    },
    "analytics": {"enabled": True},
}

DEFAULT_USERS = {"users": []}
DEFAULT_WEBSITES = {"websites": []}
DEFAULT_FILES = {"files": []}


def ensure_directories() -> None:
    for path in [CONFIG_DIR, DATA_DIR, SITES_DIR, FILES_DIR, BACKUPS_DIR]:
        path.mkdir(parents=True, exist_ok=True)


def _write_default(path: Path, payload: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as handle:
        yaml.safe_dump(payload, handle, sort_keys=False)


def load_yaml(path: Path, default: Dict[str, Any]) -> Dict[str, Any]:
    if not path.exists():
        _write_default(path, default)
    with path.open() as handle:
        content = yaml.safe_load(handle) or {}
    return content


def save_yaml(path: Path, payload: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as handle:
        yaml.safe_dump(payload, handle, sort_keys=False)


def init_config() -> Dict[str, Any]:
    ensure_directories()
    system = load_yaml(CONFIG_DIR / "system.yaml", DEFAULT_SYSTEM)
    if not system.get("security", {}).get("secret_key"):
        system.setdefault("security", {})["secret_key"] = secrets.token_hex(32)
        save_yaml(CONFIG_DIR / "system.yaml", system)

    # Initialize other config files if missing
    load_yaml(CONFIG_DIR / "users.yaml", DEFAULT_USERS)
    load_yaml(CONFIG_DIR / "websites.yaml", DEFAULT_WEBSITES)
    load_yaml(CONFIG_DIR / "files.yaml", DEFAULT_FILES)
    return system


def get_system_settings() -> Dict[str, Any]:
    return load_yaml(CONFIG_DIR / "system.yaml", DEFAULT_SYSTEM)


def get_users_config() -> Dict[str, Any]:
    return load_yaml(CONFIG_DIR / "users.yaml", DEFAULT_USERS)


def get_websites_config() -> Dict[str, Any]:
    return load_yaml(CONFIG_DIR / "websites.yaml", DEFAULT_WEBSITES)


def get_files_config() -> Dict[str, Any]:
    return load_yaml(CONFIG_DIR / "files.yaml", DEFAULT_FILES)
