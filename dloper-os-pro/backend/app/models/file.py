from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SharedFile(BaseModel):
    id: str
    filename: str
    path: str
    password_protected: bool = False
    expires_at: Optional[datetime] = None
    max_downloads: Optional[int] = None
    download_count: int = 0
    share_url: Optional[str] = None
    owner: Optional[str] = None
    active: bool = True


class SharedFileCreate(BaseModel):
    password: Optional[str] = None
    max_downloads: Optional[int] = None
    expires_at: Optional[datetime] = None
    active: bool = True


class SharedFileUpdate(BaseModel):
    password: Optional[str] = None
    max_downloads: Optional[int] = None
    expires_at: Optional[datetime] = None
    active: Optional[bool] = None
