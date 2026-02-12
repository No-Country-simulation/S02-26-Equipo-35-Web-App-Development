from rest_framework import serializers
from .models import Short
from videos.models import Video


class ShortSerializer(serializers.ModelSerializer):
    """
    Serializer de solo lectura para Shorts.
    Incluye información relevante del video.
    """

    video_title = serializers.CharField(source="video.file_name", read_only=True)
    duration_seconds = serializers.SerializerMethodField()

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

    def get_duration_seconds(self, obj):
        """Calcula la duración del short en segundos"""
        return max(0, obj.end_second - obj.start_second)


class ShortCreateSerializer(serializers.Serializer):
    """
    Serializer para creación manual de Shorts (solo admin/futuro).
    Se valida existencia de video y consistencia de tiempo.
    """

    video_id = serializers.IntegerField()
    start_second = serializers.IntegerField(min_value=0)
    end_second = serializers.IntegerField(min_value=0)

    def validate(self, data):
        start = data.get("start_second")
        end = data.get("end_second")
        video_id = data.get("video_id")

        if end <= start:
            raise serializers.ValidationError(
                "end_second debe ser mayor a start_second"
            )

        # Verificar que el video exista
        try:
            video = Video.objects.get(id=video_id)
        except Video.DoesNotExist:
            raise serializers.ValidationError("Video no encontrado")

        # Validar que end_second no exceda duración del video
        if end > video.duration_seconds:
            raise serializers.ValidationError(
                f"end_second ({end}s) excede duración del video ({video.duration_seconds}s)"
            )

        data["video_instance"] = video  # opcional para usar en create
        return data


class ShortUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar campos editables de Shorts.
    Solo status y cover_url.
    """

    class Meta:
        model = Short
        fields = ["status", "cover_url"]
