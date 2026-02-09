from django.contrib import admin
from .models import Short
from .models import Cover

# Register your models here.
admin.site.register(Short)
admin.site.register(Cover)