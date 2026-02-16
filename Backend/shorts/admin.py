from django.contrib import admin
from .models import Short


@admin.register(Short)
class ShortAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "video",
        "status",
        "start_second",
        "end_second",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "file_url",
        "video__file_name",
    )
    # Permite encontrar el short desde la URL o el nombre del video.

    readonly_fields = ("created_at",)
    # Fecha automática.

    ordering = ("-created_at",)

    list_select_related = ("video",)
    # Evita consultas extra al traer el video relacionado.
