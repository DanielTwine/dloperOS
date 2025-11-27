from typing import Optional

from pydantic import BaseModel


class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    analytics_enabled: Optional[bool] = None
    token_expiry_minutes: Optional[int] = None


class ResetRequest(BaseModel):
    password: str
    confirmation: str
