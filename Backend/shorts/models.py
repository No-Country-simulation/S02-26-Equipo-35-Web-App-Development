from django.db import models


class Short(models.Model):

    class Status(models.TextChoices):
        GENERATING = "generating", "Generating"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    # -----------------------------
    # Cloudinary - Video del short
    # -----------------------------
    file_url = models.URLField(max_length=500)
    cloudinary_public_id = models.CharField(max_length=255)

    # -----------------------------
    # Cloudinary - Cover del short
    # -----------------------------
    cover_url = models.URLField(max_length=500, null=True, blank=True)
    cover_cloudinary_public_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    # -----------------------------
    # Segmento del video original
    # -----------------------------
    start_second = models.PositiveIntegerField()
    end_second = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.GENERATING,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    # Si se borra el Video → se borran los Shorts
    video = models.ForeignKey(
        "videos.Video",
        on_delete=models.CASCADE,
        related_name="shorts",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["video", "created_at"]),
            models.Index(fields=["status"]),
        ]

    @property
    def duration_seconds(self):
        return max(0, self.end_second - self.start_second)

    def __str__(self):
        return f"Short {self.id} ({self.status})"
