from fastapi import APIRouter, Depends

from ..services import system
from ..utils import deps

router = APIRouter()


@router.get("/metrics")
def metrics(current_user=Depends(deps.get_current_user)):
    return system.system_metrics()
