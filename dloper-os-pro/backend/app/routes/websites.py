from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from ..models.website import Website, WebsiteCreate, WebsiteUpdate
from ..services import websites
from ..utils import deps

router = APIRouter()


@router.get("/", response_model=List[Website])
def list_sites(current_user=Depends(deps.get_current_user)):
    return websites.list_sites()


@router.post("/", response_model=Website)
def create_site(payload: WebsiteCreate, current_user=Depends(deps.require_role("owner", "admin"))):
    try:
        return websites.add_site(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/{name}", response_model=Website)
def update_site(name: str, payload: WebsiteUpdate, current_user=Depends(deps.require_role("owner", "admin"))):
    updated = websites.update_site(name, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return updated


@router.delete("/{name}")
def delete_site(name: str, current_user=Depends(deps.require_role("owner"))):
    removed = websites.delete_site(name)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return {"status": "deleted"}


@router.post("/{name}/analytics")
def bump_analytics(name: str, error: bool = False, bandwidth_mb: float = 0.0):
    websites.record_analytics(name, bandwidth_mb=bandwidth_mb, error=error)
    return {"status": "ok"}


@router.get("/{name}/files")
def list_site_files(name: str, current_user=Depends(deps.get_current_user)):
    files = websites.list_site_files(name)
    if files is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return files


@router.post("/{name}/files/upload")
async def upload_site_file(name: str, path: str, upload: UploadFile, current_user=Depends(deps.require_role("owner", "admin"))):
    try:
        return await websites.upload_site_file(name, path, upload)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site or path not found")


@router.post("/{name}/files/save")
async def save_site_file(name: str, path: str, content: str, current_user=Depends(deps.require_role("owner", "admin"))):
    try:
        return websites.save_site_file(name, path, content)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site or path not found")
