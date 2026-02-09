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
    short_requested = models.PositiveIntegerField()
    width = models.IntegerField()
    height = models.IntegerField()
    aspect_ratio = models.CharField(max_length=32)
    file_size = models.PositiveIntegerField()
    create_at = models.DateTimeField(auto_now_add=True)
    

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='videos'
    )
    
    def __str__(self):
        return self.file_name

class Processing_Job(models.Model):
    JOB_LIST = [
        ('shorts_generation', 'shorts_generation'),
        ('cover_generation', 'cover_generation'),
    ]
    STATUS_LIST = [
        ('pending', 'pending'),
        ('running', 'running'),
        ('completed', 'completed'),
        ('failed', 'failed'),
    ]
    job_type = models.CharField(choices=JOB_LIST, default='shorts_generation')
    status = models.CharField(choices=STATUS_LIST,default='pending')
    progress = models.FloatField()
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField()
    attempt_count = models.PositiveIntegerField()
    error_message = models.CharField(max_length=200)
    create_at = models.DateTimeField()
    
    video = models.ForeignKey(
        'videos.Video',
        on_delete=models.CASCADE,
        related_name='Video'
    )
    
    def __str__(self):
        return self.job_type
    
    