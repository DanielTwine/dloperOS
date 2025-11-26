from typing import Dict, List, Optional

from pydantic import BaseModel


class ContainerSummary(BaseModel):
    id: str
    name: str
    image: str
    status: str
    cpu_percent: Optional[float] = None
    memory_percent: Optional[float] = None


class ContainerAction(BaseModel):
    action: str


class TemplateCreate(BaseModel):
    template: str
    name: Optional[str] = None
    image: Optional[str] = None
    ports: Optional[List[str]] = None
    env: Optional[Dict[str, str]] = None
