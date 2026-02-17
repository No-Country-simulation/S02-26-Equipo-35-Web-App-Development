from rest_framework import serializers
from .models import Video


# ==============================
# Serializer para subir video
# ==============================
class VideoUploadSerializer(serializers.ModelSerializer):
    """
    Serializer para recibir archivo de video.
    Valida tamaño y formato.
    """

    video_file = serializers.FileField(write_only=True)

    # Metadata generada por backend (solo lectura)
    file_url = serializers.URLField(read_only=True)
    cloudinary_public_id = serializers.CharField(read_only=True)
    duration_seconds = serializers.FloatField(read_only=True)
    width = serializers.IntegerField(read_only=True)
    height = serializers.IntegerField(read_only=True)
    aspect_ratio = serializers.CharField(read_only=True)
    file_size = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)

    MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
    ALLOWED_EXTENSIONS = {"mp4", "mov", "avi", "mkv", "webm"}

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
        read_only_fields = [
            "id",
            "created_at",
            "file_url",
            "cloudinary_public_id",
            "duration_seconds",
            "width",
            "height",
            "aspect_ratio",
            "file_size",
            "status",
        ]

    # ------------------------------
    # Validaciones
    # ------------------------------
    def validate_video_file(self, value):
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"El archivo no puede exceder {self.MAX_FILE_SIZE // (1024*1024)} MB"
            )

        extension = value.name.split(".")[-1].lower()
        if extension not in self.ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f"Formato no soportado. Permitidos: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )

        if not value.content_type.startswith("video/"):
            raise serializers.ValidationError("El archivo debe ser un video válido")

        return value

    def validate(self, attrs):
        # Si no se proporciona file_name, usar nombre del archivo subido
        if not attrs.get("file_name") and attrs.get("video_file"):
            attrs["file_name"] = attrs["video_file"].name
        return attrs


# ==============================
# Serializer para leer video
# ==============================
class VideoResponseSerializer(serializers.ModelSerializer):
    """
    Serializer de lectura para videos.
    Muestra metadata completa del video.
    """

    class Meta:
        model = Video
        fields = [
            "id",
            "file_name",
            "file_url",
            "duration_seconds",
            "width",
            "height",
            "aspect_ratio",
            "file_size",
            "status",
            "created_at",
        ]
        read_only_fields = fields


# ==============================
# Serializer para actualizar video
# ==============================


class VideoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ["file_name"]
