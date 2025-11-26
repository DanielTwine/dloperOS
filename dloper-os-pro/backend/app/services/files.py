from __future__ import annotations

import datetime as dt
import mimetypes
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiofiles
from fastapi import HTTPException, UploadFile, status

from ..core import config
from ..core.config import CONFIG_DIR, save_yaml
from ..core.paths import FILES_DIR
from ..models.file import SharedFileCreate
from ..utils.security import hash_password, verify_password

FILES_PATH = CONFIG_DIR / "files.yaml"


def load_records() -> List[Dict]:
    data = config.get_files_config()
    return data.get("files", [])


def save_records(files: List[Dict]) -> None:
    save_yaml(FILES_PATH, {"files": files})


def list_files() -> List[Dict]:
    return load_records()


async def _persist_upload(upload: UploadFile, target_dir: Path) -> Path:
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / upload.filename
    async with aiofiles.open(target_path, "wb") as outfile:
        while chunk := await upload.read(1024 * 1024):
            await outfile.write(chunk)
    await upload.close()
    return target_path


async def create_shared_file(upload: UploadFile, payload: SharedFileCreate, owner: str, base_url: str) -> Dict:
    file_id = uuid.uuid4().hex[:12]
    target_dir = FILES_DIR / file_id
    target_path = await _persist_upload(upload, target_dir)
    files = load_records()
    entry = {
        "id": file_id,
        "filename": upload.filename,
        "path": str(target_path),
        "password_hash": hash_password(payload.password) if payload.password else None,
        "password_protected": bool(payload.password),
        "max_downloads": payload.max_downloads,
        "expires_at": payload.expires_at.isoformat() if payload.expires_at else None,
        "download_count": 0,
        "owner": owner,
        "share_url": f"{base_url.rstrip('/')}/share/{file_id}",
        "created_at": dt.datetime.utcnow().isoformat(),
        "active": payload.active,
    }
    files.append(entry)
    save_records(files)
    return entry


def get_file(file_id: str) -> Optional[Dict]:
    for file in load_records():
        if file.get("id") == file_id:
            return file
    return None


def increment_download(file_id: str) -> Optional[Dict]:
    files = load_records()
    updated: Optional[Dict] = None
    for idx, file in enumerate(files):
        if file.get("id") == file_id:
            if not file.get("active", True):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sharing disabled")
            # expiry check
            if file.get("expires_at") and dt.datetime.fromisoformat(file["expires_at"]) < dt.datetime.utcnow():
                raise HTTPException(status_code=status.HTTP_410_GONE, detail="File expired")
            if file.get("max_downloads") and file.get("download_count", 0) >= file["max_downloads"]:
                raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Download limit reached")
            file["download_count"] = file.get("download_count", 0) + 1
            files[idx] = file
            updated = file
            break
    if updated:
        save_records(files)
    return updated


def validate_file_password(file_id: str, password: Optional[str]) -> Dict:
    file = get_file(file_id)
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    if not file.get("active", True):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sharing disabled")
    if file.get("password_protected"):
        if not password:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password required")
        if not verify_password(password, file.get("password_hash", "")):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")
    return file


def update_file_record(file_id: str, updates: Dict[str, Any]) -> Optional[Dict]:
    files = load_records()
    updated: Optional[Dict] = None
    for idx, file in enumerate(files):
        if file.get("id") == file_id:
            file.update(updates)
            files[idx] = file
            updated = file
            break
    if updated:
        save_records(files)
    return updated


def delete_file(file_id: str) -> bool:
    files = load_records()
    remaining = [f for f in files if f.get("id") != file_id]
    if len(remaining) == len(files):
        return False
    save_records(remaining)
    target_dir = FILES_DIR / file_id
    if target_dir.exists():
        for item in target_dir.iterdir():
            item.unlink()
        target_dir.rmdir()
    return True


def resolve_download(file_id: str, password: Optional[str]) -> Path:
    record = validate_file_password(file_id, password)
    expires_at = record.get("expires_at")
    if expires_at and dt.datetime.fromisoformat(expires_at) < dt.datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="File expired")
    if record.get("max_downloads") and record.get("download_count", 0) >= record["max_downloads"]:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Download limit reached")
    path = Path(record["path"])
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File missing on disk")
    increment_download(file_id)
    return path


def file_metadata(file_id: str, password: Optional[str]) -> Dict:
    record = validate_file_password(file_id, password)
    path = Path(record["path"])
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File missing on disk")
    stats = path.stat()
    mime, _ = mimetypes.guess_type(path.name)
    return {
        "id": record.get("id"),
        "filename": record.get("filename"),
        "filesize": stats.st_size,
        "content_type": mime or "application/octet-stream",
        "expires_at": record.get("expires_at"),
        "max_downloads": record.get("max_downloads"),
        "download_count": record.get("download_count", 0),
        "password_protected": record.get("password_protected", False),
        "active": record.get("active", True),
    }
