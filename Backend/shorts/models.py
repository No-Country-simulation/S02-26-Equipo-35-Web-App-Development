from django.db import models
from django.conf import settings


# Create your models here.
class Short(models.Model):
    STATUS_LIST = [
        ("generating", "generating"),
        ("ready", "ready"),
        ("failed", "failed"),
    ]

    file_url = models.URLField(max_length=500)
    cloudinary_public_id = models.CharField(max_length=255)
    start_second = models.PositiveIntegerField()
    end_second = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_LIST, default="generating")
    created_at = models.DateTimeField(auto_now_add=True)
    cover_url = models.URLField(max_length=500, null=True, blank=True)
    video = models.ForeignKey(
        "videos.Video", on_delete=models.CASCADE, related_name="shorts"
    )

    def __str__(self):
        return self.file_url
