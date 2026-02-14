from rest_framework import serializers
from .models import Short


class ShortSerializer(serializers.ModelSerializer):
    """
    Serializer de solo lectura para Shorts.
    Incluye información relevante del video.
    """

    video_title = serializers.CharField(source="video.file_name", read_only=True)
    duration_seconds = serializers.IntegerField(read_only=True)

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
