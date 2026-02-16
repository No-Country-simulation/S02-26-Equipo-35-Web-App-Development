from rest_framework import serializers
from .models import Short


# =========================================================
# Serializer principal de Short
# =========================================================
class ShortSerializer(serializers.ModelSerializer):
    """
    Serializer de lectura para Shorts.

    Muestra información completa del short:
    - URLs del video y cover
    - Segmento del video original (start, end)
    - Duración calculada
    - Estado
    - Información del video original (video_title)
    - Fecha de creación
    """

    video_title = serializers.CharField(source="video.file_name", read_only=True)
    duration_seconds = serializers.FloatField(read_only=True)

    class Meta:
        model = Short
        fields = [
            "id",
            "file_url",
            "cover_url",
            "start_second",
            "end_second",
            "duration_seconds",
            "status",
            "video",
            "video_title",
            "created_at",
        ]
        read_only_fields = fields


# =========================================================
# Serializer para descarga de Short
# =========================================================
class ShortDownloadSerializer(serializers.Serializer):
    """
    Serializer para el endpoint de descarga del short.

    Devuelve:
    - URL del video
    - URL del cover
    - Duración en segundos
    """

    file_url = serializers.URLField()
    cover_url = serializers.URLField(allow_null=True)
    duration_seconds = serializers.FloatField()


# =========================================================
# Serializer de respuesta para listar shorts de un video
# =========================================================
class ShortByVideoResponseSerializer(serializers.Serializer):
    """
    Serializer de respuesta para listar shorts de un video específico.

    Incluye:
    - ID y título del video
    - Cantidad de shorts
    - Lista de shorts con información completa
    """

    video_id = serializers.IntegerField()
    video_title = serializers.CharField()
    count = serializers.IntegerField()
    shorts = ShortSerializer(many=True)


# =========================================================
# Serializer de mensajes genéricos
# =========================================================
class MessageSerializer(serializers.Serializer):
    """
    Serializer genérico para mensajes de respuesta.
    """

    detail = serializers.CharField()
