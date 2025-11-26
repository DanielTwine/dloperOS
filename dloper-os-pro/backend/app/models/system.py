from typing import Dict, Optional

from pydantic import BaseModel


class SystemMetrics(BaseModel):
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    temperature: Optional[float] = None
    network: Optional[Dict[str, float]] = None
