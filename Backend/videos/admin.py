from django.contrib import admin
from .models import Video, ProcessingJob


# Permite ver los jobs asociados directamente dentro del Video
class ProcessingJobInline(admin.TabularInline):
    model = ProcessingJob
    extra = 0
    readonly_fields = (
        "job_type",
        "status",
        "progress",
        "started_at",
        "finished_at",
        "created_at",
        "error_message",
    )


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "file_name",
        "user",
        "status",
        "duration_seconds",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "file_name",
        "user__username",
        "user__email",
    )

    readonly_fields = (
        "created_at",
        "generated_shorts_count",
    )
    # Valores automáticos para evitar cambios manuales.

    ordering = ("-created_at",)

    list_select_related = ("user",)
    # Reduce consultas a la DB cuando muestra el usuario.

    inlines = [ProcessingJobInline]


@admin.register(ProcessingJob)
class ProcessingJobAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "video",
        "job_type",
        "status",
        "progress",
        "created_at",
    )

    list_filter = (
        "status",
        "job_type",
        "created_at",
    )

    search_fields = ("video__file_name",)

    readonly_fields = (
        "created_at",
        "started_at",
        "finished_at",
    )
    # Fechas generadas automáticamente.

    ordering = ("-created_at",)

    list_select_related = ("video",)
    # Evita queries extra al traer el video relacionado.
