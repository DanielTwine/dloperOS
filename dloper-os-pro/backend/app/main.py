from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import init_config
from .services.users import ensure_seed_user
from .routes import auth, backups, docker, files, settings, system, users, websites

init_config()
ensure_seed_user()

app = FastAPI(title="DloperOS Pro API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(websites.router, prefix="/api/websites", tags=["websites"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(files.public_router, tags=["files-public"])
app.include_router(docker.router, prefix="/api/docker", tags=["docker"])
app.include_router(system.router, prefix="/api/system", tags=["system"])
app.include_router(backups.router, prefix="/api/backups", tags=["backups"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
