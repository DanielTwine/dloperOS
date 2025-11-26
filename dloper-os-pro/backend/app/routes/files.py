import datetime as dt
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse, JSONResponse

from ..models.file import SharedFile, SharedFileCreate, SharedFileUpdate
from ..core.config import get_system_settings
from ..services import files
from ..utils import deps
from ..utils.security import hash_password

router = APIRouter()


@router.get("/", response_model=List[SharedFile])
def list_shared_files(current_user=Depends(deps.get_current_user)):
    return files.list_files()


@router.post("/upload", response_model=SharedFile)
async def upload_file(
    upload: UploadFile = File(...),
    password: Optional[str] = Form(None),
    max_downloads: Optional[int] = Form(None),
    expires_at: Optional[str] = Form(None),
    current_user=Depends(deps.get_current_user),
):
    expires_dt = dt.datetime.fromisoformat(expires_at) if expires_at else None
    payload = SharedFileCreate(password=password, max_downloads=max_downloads, expires_at=expires_dt)
    settings = get_system_settings()
    base_url = settings.get("instance", {}).get("base_url", "")
    record = await files.create_shared_file(upload, payload, owner=current_user.get("username"), base_url=base_url)
    return record


@router.get("/{file_id}", response_model=SharedFile)
def get_file(file_id: str, current_user=Depends(deps.get_current_user)):
    record = files.get_file(file_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return record


@router.post("/{file_id}/download", response_model=SharedFile)
def download(file_id: str, password: Optional[str] = None):
    _ = files.validate_file_password(file_id, password)
    updated = files.increment_download(file_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return updated


@router.put("/{file_id}", response_model=SharedFile)
def update_file(file_id: str, payload: SharedFileUpdate, current_user=Depends(deps.require_role("owner", "admin"))):
    record = files.get_file(file_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    updates = payload.dict(exclude_none=True)
    if expires := updates.get("expires_at"):
        updates["expires_at"] = expires.isoformat()
    record.update(updates)
    if payload.password:
        record["password_hash"] = hash_password(payload.password)
        record["password_protected"] = True
    updated = files.update_file_record(file_id, record)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return updated


@router.delete("/{file_id}")
def delete_file(file_id: str, current_user=Depends(deps.require_role("owner", "admin"))):
    removed = files.delete_file(file_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return {"status": "deleted"}


# Public router (no auth) to serve shared files
public_router = APIRouter()


@public_router.get("/files/{file_id}")
def public_download(file_id: str, password: Optional[str] = None):
    path = files.resolve_download(file_id, password)
    return FileResponse(path, filename=path.name)


@public_router.get("/files/{file_id}/meta")
def public_metadata(file_id: str, password: Optional[str] = None):
    try:
        meta = files.file_metadata(file_id, password)
        return JSONResponse(meta)
    except HTTPException as exc:
        # surface auth errors cleanly for UI prompts
        raise exc
