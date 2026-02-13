from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    model = User

    list_display = (
        "id",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
        "created_at",
    )

    # Ordenamos por username para mantener
    # el comportamiento nativo de Django.
    ordering = ("username",)

    search_fields = ("username", "email", "first_name", "last_name")

    # Extendemos los fieldsets de Django en lugar de reemplazarlos
    # para no romper la estructura del sistema de permisos.
    fieldsets = list(UserAdmin.fieldsets) + [
        (
            "Información adicional",
            {
                "fields": ("profile_image", "created_at", "updated_at"),
            },
        ),
    ]

    # Evitamos que estos campos se editen manualmente,
    readonly_fields = ("created_at", "updated_at")
