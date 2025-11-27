from fastapi import APIRouter, Depends

from ..models.settings import ResetRequest, SettingsUpdate
from ..services import settings
from ..utils import deps

router = APIRouter()


@router.get("/")
def read_settings(current_user=Depends(deps.get_current_user)):
    return settings.fetch_settings()


@router.put("/")
def update_settings(payload: SettingsUpdate, current_user=Depends(deps.require_role("owner", "admin"))):
    return settings.update_settings(payload)


@router.post("/reset")
def reset_system(payload: ResetRequest, current_user=Depends(deps.require_role("owner"))):
    return settings.reset_system(payload, current_user["username"])
