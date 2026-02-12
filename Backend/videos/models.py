from django.db import models
from django.conf import settings


# Create your models here.
class Video(models.Model):
    STATUS_LIST = [
        ("uploaded", "uploaded"),
        ("processing", "processing"),
        ("ready", "ready"),
        ("failed", "failed"),
    ]

    file_name = models.CharField(max_length=255)
    file_url = models.URLField(max_length=500)
    cloudinary_public_id = models.CharField(max_length=255)
    duration_seconds = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_LIST, default="uploaded")
    # Se va crear solo un numero fijo: 3
    # short_requested = models.PositiveIntegerField()
    # Para controlar cuantos shorts se van generando
    generated_shorts_count = models.PositiveIntegerField(default=0)
    width = models.IntegerField()
    height = models.IntegerField()
    aspect_ratio = models.CharField(max_length=10)
    file_size = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="videos"
    )

    def __str__(self):
        return self.file_name


class ProcessingJob(models.Model):
    JOB_LIST = [("shorts_generation", "shorts_generation")]
    # "cover_generation" ELIMINADO - Proxima Fase
    STATUS_LIST = [
        ("pending", "pending"),
        ("running", "running"),
        ("completed", "completed"),
        ("failed", "failed"),
    ]
    job_type = models.CharField(choices=JOB_LIST, default="shorts_generation")
    status = models.CharField(max_length=20, choices=STATUS_LIST, default="pending")
    progress = models.PositiveSmallIntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    # attempt_count = models.PositiveIntegerField()  ELIMINADO - Proxima Fase
    error_message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    video = models.ForeignKey(
        "videos.Video", on_delete=models.CASCADE, related_name="processing_jobs"
    )

    def __str__(self):
        return self.job_type
