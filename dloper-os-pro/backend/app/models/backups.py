from typing import Optional

from pydantic import BaseModel


class BackupRequest(BaseModel):
    target: str
    name: Optional[str] = None


class RestoreRequest(BaseModel):
    name: str
