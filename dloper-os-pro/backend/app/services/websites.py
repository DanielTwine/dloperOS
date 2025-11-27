from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Optional

import aiofiles
from fastapi import UploadFile

from ..core import config
from ..core.config import CONFIG_DIR, save_yaml
from ..core.paths import SITES_DIR
from ..models.website import WebsiteCreate, WebsiteUpdate

WEBSITES_PATH = CONFIG_DIR / "websites.yaml"


def load_sites() -> List[Dict]:
    data = config.get_websites_config()
    return data.get("websites", [])


def save_sites(sites: List[Dict]) -> None:
    save_yaml(WEBSITES_PATH, {"websites": sites})


def list_sites() -> List[Dict]:
    return load_sites()


def add_site(payload: WebsiteCreate) -> Dict:
    sites = load_sites()
    if any(site.get("name") == payload.name for site in sites):
        raise ValueError("Site already exists")
    root_path = str(SITES_DIR / payload.name)
    Path(root_path).mkdir(parents=True, exist_ok=True)
    entry = {
        "name": payload.name,
        "root_path": root_path,
        "domains": payload.domains,
        "ssl_enabled": payload.ssl_enabled,
        "upstream": payload.upstream,
        "analytics": {"requests": 0, "errors": 0, "bandwidth_mb": 0.0},
    }
    sites.append(entry)
    save_sites(sites)
    return entry


def update_site(name: str, payload: WebsiteUpdate) -> Optional[Dict]:
    sites = load_sites()
    updated_site: Optional[Dict] = None
    for idx, site in enumerate(sites):
        if site.get("name") == name:
            if payload.domains is not None:
                site["domains"] = payload.domains
            if payload.ssl_enabled is not None:
                site["ssl_enabled"] = payload.ssl_enabled
            if payload.upstream is not None:
                site["upstream"] = payload.upstream
            sites[idx] = site
            updated_site = site
            break
    if updated_site:
        save_sites(sites)
    return updated_site


def delete_site(name: str) -> bool:
    sites = load_sites()
    remaining = [s for s in sites if s.get("name") != name]
    if len(remaining) == len(sites):
        return False
    save_sites(remaining)
    return True


def record_analytics(name: str, bandwidth_mb: float = 0.0, error: bool = False) -> None:
    sites = load_sites()
    changed = False
    for idx, site in enumerate(sites):
        if site.get("name") == name:
            analytics = site.setdefault("analytics", {"requests": 0, "errors": 0, "bandwidth_mb": 0.0})
            analytics["requests"] = analytics.get("requests", 0) + 1
            analytics["bandwidth_mb"] = analytics.get("bandwidth_mb", 0.0) + bandwidth_mb
            if error:
                analytics["errors"] = analytics.get("errors", 0) + 1
            site["analytics"] = analytics
            sites[idx] = site
            changed = True
            break
    if changed:
        save_sites(sites)


def list_site_files(name: str) -> Optional[List[Dict]]:
    site = next((s for s in load_sites() if s.get("name") == name), None)
    if not site:
        return None
    root = Path(site["root_path"])
    if not root.exists():
        root.mkdir(parents=True, exist_ok=True)
    files: List[Dict] = []
    for path in root.rglob("*"):
        if path.is_file():
            rel = path.relative_to(root).as_posix()
            files.append({"path": rel, "size": path.stat().st_size})
    return files


async def upload_site_file(name: str, relative_path: str, upload: UploadFile) -> Dict:
    site = next((s for s in load_sites() if s.get("name") == name), None)
    if not site:
        raise FileNotFoundError("site")
    root = Path(site["root_path"])
    target = (root / relative_path).parent
    target.mkdir(parents=True, exist_ok=True)
    dest = root / relative_path
    async with aiofiles.open(dest, "wb") as outfile:
        while chunk := await upload.read(1024 * 1024):
            await outfile.write(chunk)
    await upload.close()
    return {"path": relative_path, "size": dest.stat().st_size}


def save_site_file(name: str, relative_path: str, content: str) -> Dict:
    site = next((s for s in load_sites() if s.get("name") == name), None)
    if not site:
        raise FileNotFoundError("site")
    root = Path(site["root_path"])
    target = root / relative_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content)
    return {"path": relative_path, "size": target.stat().st_size}
