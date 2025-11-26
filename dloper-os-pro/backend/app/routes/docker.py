from fastapi import APIRouter, Depends

from ..models.docker import ContainerAction, TemplateCreate
from ..services import docker
from ..utils import deps

router = APIRouter()


@router.get("/containers")
def list_containers(current_user=Depends(deps.get_current_user)):
    return docker.list_containers()


@router.post("/containers/{container_id}")
def operate_container(container_id: str, payload: ContainerAction, current_user=Depends(deps.require_role("owner", "admin"))):
    return docker.operate_container(container_id, payload.action)


@router.post("/templates")
def create_template(payload: TemplateCreate, current_user=Depends(deps.require_role("owner", "admin"))):
    return docker.create_from_template(payload)
