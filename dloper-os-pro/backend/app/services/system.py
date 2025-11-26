from __future__ import annotations

import time
from typing import Dict

import psutil


def system_metrics() -> Dict:
    cpu = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    temps = psutil.sensors_temperatures().get("cpu-thermal") if hasattr(psutil, "sensors_temperatures") else None
    temp_val = temps[0].current if temps else None

    net1 = psutil.net_io_counters()
    time.sleep(0.05)
    net2 = psutil.net_io_counters()
    network = {
        "bytes_sent_per_sec": max(net2.bytes_sent - net1.bytes_sent, 0),
        "bytes_recv_per_sec": max(net2.bytes_recv - net1.bytes_recv, 0),
    }

    return {
        "cpu_percent": cpu,
        "memory_percent": round(memory.percent, 2),
        "memory_used": memory.used,
        "memory_total": memory.total,
        "disk_percent": round(disk.percent, 2),
        "disk_used": disk.used,
        "disk_total": disk.total,
        "temperature": temp_val,
        "network": network,
    }
