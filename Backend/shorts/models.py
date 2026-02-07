from django.db import models
from django.conf import settings

# Create your models here.
class Short(models.Model):
    STATUS_LIST = [
        ('generating', 'generating'),
        ('ready', 'ready'),
        ('failed', 'failed'),
    ]
    
    file_url = models.URLField(max_length=200)
    start_second = models.PositiveIntegerField()
    end_second = models.PositiveIntegerField()
    height = models.IntegerField()
    width = models.IntegerField()
    status = models.CharField(choices=STATUS_LIST, default='generating')
    created_at = models.DateTimeField(auto_now_add=True)
    
    video = models.ForeignKey(
        'videos.Video',
        on_delete=models.CASCADE,
        related_name='short'
    )
    
    def __str__(self):
        return self.file_name
