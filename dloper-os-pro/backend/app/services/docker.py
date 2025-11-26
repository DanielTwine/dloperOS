from __future__ import annotations

from typing import Dict, List

from fastapi import HTTPException, status

from ..models.docker import TemplateCreate

try:
    import docker  # type: ignore
except Exception:  # pragma: no cover - docker not installed
    docker = None  # type: ignore


def _client():
    if docker is None:
        return None
    try:
        return docker.from_env()
    except Exception:
        return None


def list_containers() -> List[Dict]:
    client = _client()
    if not client:
        return []
    containers: List[Dict] = []
    for container in client.containers.list(all=True):
        try:
            stats = container.stats(stream=False)
            cpu_percent = stats.get("cpu_stats", {}).get("cpu_usage", {}).get("total_usage")
            mem = stats.get("memory_stats", {})
            mem_usage = mem.get("usage")
            mem_limit = mem.get("limit") or 1
            containers.append(
                {
                    "id": container.short_id,
                    "name": container.name,
                    "image": container.image.tags[0] if container.image.tags else container.image.short_id,
                    "status": container.status,
                    "cpu_percent": float(cpu_percent or 0),
                    "memory_percent": round((mem_usage or 0) / mem_limit * 100, 2),
                }
            )
        except Exception:
            containers.append(
                {
                    "id": container.short_id,
                    "name": container.name,
                    "image": container.image.tags[0] if container.image.tags else container.image.short_id,
                    "status": container.status,
                    "cpu_percent": None,
                    "memory_percent": None,
                }
            )
    return containers


def operate_container(container_id: str, action: str) -> Dict:
    client = _client()
    if not client:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Docker not available")
    try:
        container = client.containers.get(container_id)
    except Exception as exc:  # pragma: no cover - runtime safety
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Container not found") from exc

    if action == "start":
        container.start()
    elif action == "stop":
        container.stop()
    elif action == "restart":
        container.restart()
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported action")

    container.reload()
    return {
        "id": container.short_id,
        "name": container.name,
        "status": container.status,
    }


def create_from_template(payload: TemplateCreate) -> Dict:
    client = _client()
    if not client:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Docker not available")

    templates = {
        "wordpress": {
            "image": "wordpress:latest",
            "ports": {"80/tcp": 8081},
        },
        "node": {
            "image": payload.image or "node:20",
            "command": "npm start",
        },
        "db": {
            "image": payload.image or "postgres:15",
            "env": {"POSTGRES_PASSWORD": "dloper"},
            "ports": {"5432/tcp": 5432},
        },
    }

    template = templates.get(payload.template)
    if not template:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown template")

    args = {
        "image": template.get("image"),
        "name": payload.name,
        "detach": True,
        "environment": payload.env or template.get("env"),
        "ports": template.get("ports"),
    }
    if payload.ports:
        args["ports"] = {p.split(":")[0] + "/tcp": int(p.split(":")[1]) for p in payload.ports if ":" in p}

    if cmd := template.get("command"):
        args["command"] = cmd

    container = client.containers.run(**args)
    return {
        "id": container.short_id,
        "name": container.name,
        "status": container.status,
    }
