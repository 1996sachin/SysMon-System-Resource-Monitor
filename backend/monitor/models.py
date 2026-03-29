from django.db import models


class SystemSnapshot(models.Model):
    """Periodic snapshot of all system resources."""
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    # CPU
    cpu_percent        = models.FloatField()
    cpu_count_physical = models.IntegerField()
    cpu_count_logical  = models.IntegerField()
    cpu_freq_current   = models.FloatField(null=True, blank=True)   # MHz
    cpu_freq_max       = models.FloatField(null=True, blank=True)

    # RAM
    ram_total     = models.BigIntegerField()   # bytes
    ram_used      = models.BigIntegerField()
    ram_available = models.BigIntegerField()
    ram_percent   = models.FloatField()

    # Disk / ROM (primary disk)
    disk_total   = models.BigIntegerField()
    disk_used    = models.BigIntegerField()
    disk_free    = models.BigIntegerField()
    disk_percent = models.FloatField()

    # Network
    net_bytes_sent = models.BigIntegerField()
    net_bytes_recv = models.BigIntegerField()

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Snapshot @ {self.timestamp}"


class GPUSnapshot(models.Model):
    """GPU snapshot linked to a SystemSnapshot."""
    snapshot    = models.ForeignKey(SystemSnapshot, related_name='gpus', on_delete=models.CASCADE)
    gpu_id      = models.IntegerField()
    name        = models.CharField(max_length=200)
    load        = models.FloatField()           # %
    memory_used = models.BigIntegerField()      # MB
    memory_total= models.BigIntegerField()      # MB
    temperature = models.FloatField(null=True, blank=True)  # °C

    def __str__(self):
        return f"{self.name} ({self.load}%)"


class ProcessSnapshot(models.Model):
    """Top processes at a given snapshot."""
    snapshot    = models.ForeignKey(SystemSnapshot, related_name='processes', on_delete=models.CASCADE)
    pid         = models.IntegerField()
    name        = models.CharField(max_length=256)
    cpu_percent = models.FloatField()
    memory_mb   = models.FloatField()
    status      = models.CharField(max_length=64)
    username    = models.CharField(max_length=128, blank=True)

    class Meta:
        ordering = ['-cpu_percent']

    def __str__(self):
        return f"{self.name} (PID {self.pid})"
