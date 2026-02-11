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
    start_second = models.PositiveIntegerField()
    end_second = models.PositiveIntegerField()
    # se va trabajar con una sola medida de salida: 1080x1920
    # height = models.IntegerField()
    # width = models.IntegerField()
    status = models.CharField(choices=STATUS_LIST, default="generating")
    created_at = models.DateTimeField(auto_now_add=True)
    cover_url = models.URLField(max_length=500, null=True, blank=True)
    video = models.ForeignKey(
        "videos.Video", on_delete=models.CASCADE, related_name="shorts"
    )

    def __str__(self):
        return self.file_url


# Se va generar una sola portada automaticamente
# class Cover(models.Model):
#     image_url = models.URLField()
#     frame_second = models.PositiveIntegerField()
#     is_selected = models.BooleanField()
#     short = models.ForeignKey(
#         "shorts.Short", on_delete=models.CASCADE, related_name="covers"
#     )

#     def __str__(self):
#         return self.image_url
