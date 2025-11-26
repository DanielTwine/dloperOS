from fastapi import APIRouter, Depends

from ..models.backups import BackupRequest, RestoreRequest
from ..services import backups
from ..utils import deps

router = APIRouter()


@router.get("/")
def list_backups(current_user=Depends(deps.get_current_user)):
    return backups.list_backups()


@router.post("/")
def create_backup(payload: BackupRequest, current_user=Depends(deps.require_role("owner", "admin"))):
    return backups.create_backup(target=payload.target, name=payload.name)


@router.post("/restore")
def restore(payload: RestoreRequest, current_user=Depends(deps.require_role("owner"))):
    return backups.restore_backup(payload.name)
