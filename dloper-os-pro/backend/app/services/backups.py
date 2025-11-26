from __future__ import annotations

import datetime as dt
import shutil
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import HTTPException, status

from ..core.paths import BACKUPS_DIR, FILES_DIR, SITES_DIR


def list_backups() -> List[Dict]:
    BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    backups = []
    for item in BACKUPS_DIR.glob("*.zip"):
        backups.append(
            {
                "name": item.name,
                "path": str(item),
                "size": item.stat().st_size,
                "created_at": dt.datetime.fromtimestamp(item.stat().st_mtime).isoformat(),
            }
        )
    return sorted(backups, key=lambda b: b["created_at"], reverse=True)


def _resolve_target(target: str) -> Path:
    if target == "sites":
        return SITES_DIR
    if target == "files":
        return FILES_DIR
    if target.startswith("site:"):
        return SITES_DIR / target.split(":", 1)[1]
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown backup target")


def create_backup(target: str, name: Optional[str] = None) -> Dict:
    src = _resolve_target(target)
    if not src.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    stamp = dt.datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    backup_name = name or f"{target}-{stamp}"
    BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    archive_base = BACKUPS_DIR / backup_name
    archive_path = shutil.make_archive(str(archive_base), "zip", root_dir=src)
    path_obj = Path(archive_path)
    return {
        "name": path_obj.name,
        "path": str(path_obj),
        "size": path_obj.stat().st_size,
    }


def restore_backup(name: str, destination: Optional[Path] = None) -> Dict:
    backup_file = BACKUPS_DIR / name
    if not backup_file.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup not found")
    dest = destination or BACKUPS_DIR / "restored" / backup_file.stem
    dest.mkdir(parents=True, exist_ok=True)
    shutil.unpack_archive(str(backup_file), str(dest))
    return {"restored_to": str(dest)}
