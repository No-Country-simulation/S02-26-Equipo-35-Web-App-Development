from django.db import models
from django.conf import settings

# Create your models here.
class Video(models.Model):
    STATUS_LIST = [
        ('uploaded', 'uploaded'),
        ('processing', 'processing'),
        ('ready', 'ready'),
        ('failed', 'failed'),
    ]

    file_name = models.CharField(max_length=60)
    file_url = models.URLField(max_length=200)
    duration_seconds = models.PositiveIntegerField()
    status = models.CharField(choices=STATUS_LIST, default='uploaded')
    #fix:no se que tipo de dato sea short_requested
    short_requested = models.CharField(max_length=50)
    width = models.IntegerField()
    height = models.IntegerField()
    #fix: que tipo de dato usar para aspect radio
    aspect_ratio = models.IntegerField()
    file_size = models.PositiveIntegerField()
    create_at = models.DateTimeField(auto_now_add=True)
    

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='videos'
    )
    
    def __str__(self):
        return self.file_name

    