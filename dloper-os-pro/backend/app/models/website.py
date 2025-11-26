from typing import Optional

from pydantic import BaseModel


class Website(BaseModel):
    name: str
    root_path: str
    domains: list[str] = []
    ssl_enabled: bool = False
    upstream: Optional[str] = None
    analytics: Optional[dict] = None


class WebsiteCreate(BaseModel):
    name: str
    domains: list[str] = []
    ssl_enabled: bool = False
    upstream: Optional[str] = None


class WebsiteUpdate(BaseModel):
    domains: Optional[list[str]] = None
    ssl_enabled: Optional[bool] = None
    upstream: Optional[str] = None
