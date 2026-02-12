from rest_framework import serializers
from .models import Video


class VideoUploadSerializer(serializers.ModelSerializer):
    """
    Serializer para recibir archivo de video desde el frontend.
    Se encarga de validar tamaño y formato, y asignar file_name si no viene.
    """

    # Campo de subida de archivo (solo escritura)
    video_file = serializers.FileField(write_only=True)

    # Campos de solo lectura (metadata generada por backend)
    file_url = serializers.URLField(read_only=True)
    cloudinary_public_id = serializers.CharField(read_only=True)
    duration_seconds = serializers.IntegerField(read_only=True)
    width = serializers.IntegerField(read_only=True)
    height = serializers.IntegerField(read_only=True)
    aspect_ratio = serializers.CharField(read_only=True)
    file_size = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Video
        fields = [
            "id",
            "file_name",
            "video_file",
            "file_url",
            "cloudinary_public_id",
            "duration_seconds",
            "width",
            "height",
            "aspect_ratio",
            "file_size",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_video_file(self, value):
        """
        Validar tamaño y extensión del archivo.
        Tamaño máximo 500MB y extensiones permitidas: mp4, mov, avi, mkv, webm.
        """
        max_size = 500 * 1024 * 1024  # 500MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"El archivo no puede exceder {max_size // (1024*1024)}MB"
            )

        allowed_extensions = {"mp4", "mov", "avi", "mkv", "webm"}
        ext = value.name.rsplit(".", 1)[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError("Formato de video no soportado")

        return value

    def validate(self, data):
        """
        Si no se proporciona file_name, asignar el nombre del archivo subido.
        """
        if not data.get("file_name") and "video_file" in data:
            data["file_name"] = data["video_file"].name
        return data


class VideoResponseSerializer(serializers.ModelSerializer):
    """
    Serializer para respuesta del video, incluyendo los shorts generados.
    """

    shorts = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Video
        fields = [
            "id",
            "file_name",
            "file_url",
            "duration_seconds",
            "status",
            "shorts",
            "created_at",
        ]
        read_only_fields = fields

    def get_shorts(self, obj):
        """
        Retorna los shorts generados para este video,
        ordenados por start_second.
        """
        return [
            {
                "id": short.id,
                "file_url": short.file_url,
                "cover_url": short.cover_url,
                "start_second": short.start_second,
                "end_second": short.end_second,
            }
            for short in obj.shorts.all().order_by("start_second")
        ]
