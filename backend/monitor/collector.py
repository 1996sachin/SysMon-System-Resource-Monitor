"""
collector.py – gather live system metrics via psutil (+ GPUtil if available).
"""
import psutil
import platform
from datetime import datetime

try:
    import GPUtil
    GPU_AVAILABLE = True
except ImportError:
    GPU_AVAILABLE = False


def bytes_to_gb(b: int) -> float:
    return round(b / (1024 ** 3), 2)

def bytes_to_mb(b: int) -> float:
    return round(b / (1024 ** 2), 2)


def get_cpu_info() -> dict:
    freq = psutil.cpu_freq()
    per_core = psutil.cpu_percent(percpu=True)
    return {
        "percent":         psutil.cpu_percent(interval=0.1),
        "per_core":        per_core,
        "count_physical":  psutil.cpu_count(logical=False) or 1,
        "count_logical":   psutil.cpu_count(logical=True),
        "freq_current":    round(freq.current, 1) if freq else None,
        "freq_max":        round(freq.max, 1) if freq else None,
        "architecture":    platform.machine(),
        "processor":       platform.processor() or platform.machine(),
    }


def get_ram_info() -> dict:
    vm   = psutil.virtual_memory()
    swap = psutil.swap_memory()
    return {
        "total_gb":     bytes_to_gb(vm.total),
        "used_gb":      bytes_to_gb(vm.used),
        "available_gb": bytes_to_gb(vm.available),
        "percent":      vm.percent,
        "swap_total_gb":bytes_to_gb(swap.total),
        "swap_used_gb": bytes_to_gb(swap.used),
        "swap_percent": swap.percent,
        # raw bytes for DB
        "_total":     vm.total,
        "_used":      vm.used,
        "_available": vm.available,
    }


def get_disk_info() -> list:
    partitions = psutil.disk_partitions()
    disks = []
    for p in partitions:
        try:
            usage = psutil.disk_usage(p.mountpoint)
            disks.append({
                "device":     p.device,
                "mountpoint": p.mountpoint,
                "fstype":     p.fstype,
                "total_gb":   bytes_to_gb(usage.total),
                "used_gb":    bytes_to_gb(usage.used),
                "free_gb":    bytes_to_gb(usage.free),
                "percent":    usage.percent,
                "_total":     usage.total,
                "_used":      usage.used,
                "_free":      usage.free,
            })
        except (PermissionError, OSError):
            pass
    return disks


def get_network_info() -> dict:
    net = psutil.net_io_counters()
    interfaces = {}
    per_nic = psutil.net_io_counters(pernic=True)
    for name, stats in per_nic.items():
        interfaces[name] = {
            "bytes_sent_mb": bytes_to_mb(stats.bytes_sent),
            "bytes_recv_mb": bytes_to_mb(stats.bytes_recv),
            "packets_sent":  stats.packets_sent,
            "packets_recv":  stats.packets_recv,
        }
    return {
        "bytes_sent_mb":  bytes_to_mb(net.bytes_sent),
        "bytes_recv_mb":  bytes_to_mb(net.bytes_recv),
        "packets_sent":   net.packets_sent,
        "packets_recv":   net.packets_recv,
        "_bytes_sent":    net.bytes_sent,
        "_bytes_recv":    net.bytes_recv,
        "interfaces":     interfaces,
    }


def get_gpu_info() -> list:
    if not GPU_AVAILABLE:
        return []
    try:
        gpus = GPUtil.getGPUs()
        return [
            {
                "id":           g.id,
                "name":         g.name,
                "load_percent": round(g.load * 100, 1),
                "memory_used_mb":  round(g.memoryUsed, 1),
                "memory_total_mb": round(g.memoryTotal, 1),
                "memory_percent":  round(g.memoryUtil * 100, 1),
                "temperature":     g.temperature,
                "driver":          g.driver,
                "uuid":            g.uuid,
            }
            for g in gpus
        ]
    except Exception:
        return []


def get_top_processes(n: int = 20) -> list:
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info', 'status', 'username']):
        try:
            info = p.info
            mem  = info.get('memory_info')
            procs.append({
                "pid":         info['pid'],
                "name":        info['name'] or "unknown",
                "cpu_percent": info['cpu_percent'] or 0.0,
                "memory_mb":   bytes_to_mb(mem.rss) if mem else 0.0,
                "status":      info['status'] or "",
                "username":    info.get('username') or "",
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return sorted(procs, key=lambda x: x['cpu_percent'], reverse=True)[:n]


def get_stack_usage() -> dict:
    """Aggregate CPU/memory by process family / tech stack."""
    stacks = {
        "Python":    {"cpu": 0.0, "mem": 0.0, "procs": []},
        "Node.js":   {"cpu": 0.0, "mem": 0.0, "procs": []},
        "Java":      {"cpu": 0.0, "mem": 0.0, "procs": []},
        "Rust":      {"cpu": 0.0, "mem": 0.0, "procs": []},
        "Go":        {"cpu": 0.0, "mem": 0.0, "procs": []},
        "Browser":   {"cpu": 0.0, "mem": 0.0, "procs": []},
        "Database":  {"cpu": 0.0, "mem": 0.0, "procs": []},
        "System":    {"cpu": 0.0, "mem": 0.0, "procs": []},
        "Other":     {"cpu": 0.0, "mem": 0.0, "procs": []},
    }

    MAPPING = {
        "Python":   ["python", "python3", "uvicorn", "gunicorn", "django", "flask", "celery"],
        "Node.js":  ["node", "nodejs", "npm", "yarn", "next", "vite", "webpack"],
        "Java":     ["java", "javac", "gradle", "mvn", "kotlin"],
        "Rust":     ["cargo", "rustc", "rust-analyzer"],
        "Go":       ["go", "gopls"],
        "Browser":  ["chrome", "firefox", "safari", "brave", "edge", "opera", "chromium"],
        "Database": ["postgres", "psql", "mysql", "mysqld", "redis", "mongo", "sqlite"],
        "System":   ["systemd", "launchd", "kernel", "kworker", "sshd", "init", "cron"],
    }

    for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            name = (p.info['name'] or "").lower()
            mem  = p.info.get('memory_info')
            cpu  = p.info['cpu_percent'] or 0.0
            mb   = bytes_to_mb(mem.rss) if mem else 0.0

            matched = False
            for stack, keywords in MAPPING.items():
                if any(kw in name for kw in keywords):
                    stacks[stack]["cpu"] += cpu
                    stacks[stack]["mem"] += mb
                    stacks[stack]["procs"].append(p.info['pid'])
                    matched = True
                    break
            if not matched:
                stacks["Other"]["cpu"] += cpu
                stacks["Other"]["mem"] += mb
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    # Round and add count
    for s in stacks.values():
        s["cpu"]   = round(s["cpu"], 2)
        s["mem"]   = round(s["mem"], 2)
        s["count"] = len(s["procs"])
        del s["procs"]

    return stacks


def collect_all() -> dict:
    """Return a complete snapshot of all metrics."""
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "cpu":       get_cpu_info(),
        "ram":       get_ram_info(),
        "disks":     get_disk_info(),
        "network":   get_network_info(),
        "gpus":      get_gpu_info(),
        "processes": get_top_processes(20),
        "stacks":    get_stack_usage(),
        "platform": {
            "system":   platform.system(),
            "release":  platform.release(),
            "version":  platform.version(),
            "node":     platform.node(),
        }
    }
