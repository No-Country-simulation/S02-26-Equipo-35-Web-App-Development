from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    profile_image = models.URLField(blank=True, null=True)

    # Timestamps para auditoría básica
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
