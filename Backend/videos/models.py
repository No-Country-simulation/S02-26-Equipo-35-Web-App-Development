from django.db import models
from django.conf import settings


# ==========================================
# Video Model
# ==========================================


class Video(models.Model):

    class Status(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    file_name = models.CharField(max_length=255)

    # URL final en Cloudinary
    file_url = models.URLField(max_length=500, null=True, blank=True)
    cloudinary_public_id = models.CharField(max_length=255, null=True, blank=True)

    duration_seconds = models.FloatField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED,
        db_index=True,  # optimiza filtros por estado
    )

    generated_shorts_count = models.PositiveIntegerField(default=0)

    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    aspect_ratio = models.CharField(max_length=10, null=True, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="videos",
        db_index=True,  # mejora queries por usuario
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        return f"{self.file_name} ({self.status})"


# ==========================================
# Processing Job Model
# ==========================================


class ProcessingJob(models.Model):

    class JobType(models.TextChoices):
        SHORTS_GENERATION = "shorts_generation", "Shorts Generation"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    job_type = models.CharField(
        max_length=50,
        choices=JobType.choices,
        default=JobType.SHORTS_GENERATION,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    progress = models.PositiveSmallIntegerField(default=0)

    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    error_message = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    video = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="processing_jobs",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.job_type} - {self.status}"
