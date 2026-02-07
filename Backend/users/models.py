from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    # first_name = models.CharField(max_length=20)
    # last_name = models.CharField(max_length=50)
    profile_image =  models.URLField(blank=True,null=True)
    # password_hash = models.CharField()
    # email = models.EmailField()
    # create_at = models.DateTimeField(auto_now_add=True)
    # update_at = models.DateTimeField(auto_now_add=True)
    