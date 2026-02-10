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

    # Ordenamos por email porque es el identificador principal
    # (no usamos username).
    ordering = ("email",)

    search_fields = ("email", "first_name", "last_name")

    # Extendemos los fieldsets de Django en lugar de reemplazarlos
    # para no romper la estructura del sistema de permisos.
    fieldsets = UserAdmin.fieldsets + (
        (
            "Información adicional",
            {
                "fields": ("profile_image", "created_at", "updated_at"),
            },
        ),
    )

    # Personalizamos el formulario de creación porque eliminamos
    # username y el login se basa en email.
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            None,
            {
                "fields": ("email", "profile_image"),
            },
        ),
    )

    # Evitamos que estos campos se editen manualmente,
    readonly_fields = ("created_at", "updated_at")
