from django.contrib import admin

from .models import Video
from .models import Processing_Job

# Register your models here.
admin.site.register(Video)
admin.site.register(Processing_Job)
