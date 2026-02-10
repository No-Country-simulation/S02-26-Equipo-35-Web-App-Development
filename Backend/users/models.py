from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # Usamos email como identificador único para un login más moderno
    # y evitar duplicar username + email.
    username = None
    email = models.EmailField(unique=True)
    profile_image = models.URLField(blank=True, null=True)

    # Timestamps para auditoría y trazabilidad de usuarios
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
