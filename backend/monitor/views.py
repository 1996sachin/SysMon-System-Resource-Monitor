from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .collector import collect_all
from .models import SystemSnapshot, GPUSnapshot, ProcessSnapshot


@api_view(['GET'])
def live_stats(request):
    """Return a fresh live snapshot (not saved to DB)."""
    return Response(collect_all())


@api_view(['GET'])
def snapshot_and_save(request):
    """Collect metrics, persist to DB, return data."""
    data = collect_all()

    cpu  = data['cpu']
    ram  = data['ram']
    net  = data['network']
    disks = data['disks']
    primary = disks[0] if disks else {}

    snap = SystemSnapshot.objects.create(
        cpu_percent        = cpu['percent'],
        cpu_count_physical = cpu['count_physical'],
        cpu_count_logical  = cpu['count_logical'],
        cpu_freq_current   = cpu.get('freq_current'),
        cpu_freq_max       = cpu.get('freq_max'),
        ram_total     = ram['_total'],
        ram_used      = ram['_used'],
        ram_available = ram['_available'],
        ram_percent   = ram['percent'],
        disk_total    = primary.get('_total', 0),
        disk_used     = primary.get('_used', 0),
        disk_free     = primary.get('_free', 0),
        disk_percent  = primary.get('percent', 0),
        net_bytes_sent= net['_bytes_sent'],
        net_bytes_recv= net['_bytes_recv'],
    )

    for g in data.get('gpus', []):
        GPUSnapshot.objects.create(
            snapshot=snap,
            gpu_id=g['id'],
            name=g['name'],
            load=g['load_percent'],
            memory_used=g['memory_used_mb'],
            memory_total=g['memory_total_mb'],
            temperature=g.get('temperature'),
        )

    for p in data.get('processes', [])[:10]:
        ProcessSnapshot.objects.create(
            snapshot=snap,
            pid=p['pid'],
            name=p['name'],
            cpu_percent=p['cpu_percent'],
            memory_mb=p['memory_mb'],
            status=p['status'],
            username=p.get('username', ''),
        )

    data['snapshot_id'] = snap.id
    return Response(data)


@api_view(['GET'])
def history(request):
    """Return the last N snapshots from the DB."""
    limit = int(request.query_params.get('limit', 60))
    snaps = SystemSnapshot.objects.order_by('-timestamp')[:limit]
    rows = [
        {
            "id":           s.id,
            "timestamp":    s.timestamp.isoformat(),
            "cpu_percent":  s.cpu_percent,
            "ram_percent":  s.ram_percent,
            "disk_percent": s.disk_percent,
            "ram_used_gb":  round(s.ram_used / 1024**3, 2),
            "ram_total_gb": round(s.ram_total / 1024**3, 2),
        }
        for s in snaps
    ]
    return Response({"history": list(reversed(rows))})


@api_view(['GET'])
def stack_stats(request):
    """Return stack-level aggregation from live data."""
    data = collect_all()
    return Response({"stacks": data['stacks'], "timestamp": data['timestamp']})


@api_view(['GET'])
def process_list(request):
    """Return live top processes."""
    data = collect_all()
    return Response({"processes": data['processes'], "timestamp": data['timestamp']})
