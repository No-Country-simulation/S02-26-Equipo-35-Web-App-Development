import logging
import tempfile

from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Video
from .serializers import VideoUploadSerializer, VideoResponseSerializer
from .services import process_video_task

logger = logging.getLogger(__name__)


class VideoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejo de videos y procesamiento asíncrono con Celery.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    # ==============================
    # Queryset
    # ==============================

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Video.objects.none()

        return Video.objects.filter(user=self.request.user).order_by("-created_at")

    # ==============================
    # Serializers
    # ==============================

    def get_serializer_class(self):
        return (
            VideoUploadSerializer
            if self.action == "create"
            else VideoResponseSerializer
        )

    # ==============================
    # CREATE (Upload + Trigger Task)
    # ==============================

    @swagger_auto_schema(
        request_body=VideoUploadSerializer,
        responses={
            202: openapi.Response(
                description="Video recibido. Procesamiento iniciado.",
                schema=VideoResponseSerializer(),
            )
        },
        operation_description="Sube un video y dispara procesamiento asíncrono",
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        video = self._create_video_instance(
            user=request.user, validated_data=serializer.validated_data
        )

        temp_path = self._save_temp_file(serializer.validated_data["video_file"])

        process_video_task.delay(video.id, temp_path, video.file_name)

        return Response(
            self._build_create_response(video),
            status=status.HTTP_202_ACCEPTED,
        )

    # ==============================
    # Custom Actions
    # ==============================

    @swagger_auto_schema(
        operation_description="Consulta estado y progreso de un video",
        responses={200: VideoResponseSerializer()},
    )
    @action(detail=True, methods=["get"])
    def status(self, request, pk=None):
        video = self.get_object()
        job = video.processing_jobs.last()

        return Response(
            {
                "id": video.id,
                "status": video.status,
                "progress": job.progress if job else 0,
                "error": (
                    job.error_message if job and job.status == "failed" else None
                ),
            }
        )

    @swagger_auto_schema(
        operation_description="Obtiene los shorts generados para un video",
        responses={200: VideoResponseSerializer()},
    )
    @action(detail=True, methods=["get"])
    def shorts(self, request, pk=None):
        video = self.get_object()

        if video.status != "ready":
            return Response(
                {"detail": f"Shorts no disponibles. Estado actual: {video.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(VideoResponseSerializer(video).data)

    @swagger_auto_schema(
        operation_description="Obtiene la URL del video original",
        responses={200: openapi.Response(description="URL del video")},
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        video = self.get_object()

        if not video.file_url:
            return Response(
                {"detail": "Video no disponible"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "file_url": video.file_url,
                "file_name": video.file_name,
            }
        )

    # ==============================
    # Private Helpers
    # ==============================

    def _create_video_instance(self, user, validated_data):
        """
        Crea el registro del video en estado 'uploaded'
        """
        video_file = validated_data["video_file"]
        file_name = validated_data.get("file_name", video_file.name)

        return Video.objects.create(
            user=user,
            file_name=file_name,
            status="uploaded",
        )

    def _save_temp_file(self, video_file):
        """
        Guarda archivo temporal en disco y devuelve la ruta.
        """
        with tempfile.NamedTemporaryFile(
            suffix=f"_{video_file.name}",
            delete=False,
        ) as tmp_file:
            for chunk in video_file.chunks():
                tmp_file.write(chunk)

        logger.info(f"Archivo temporal creado: {tmp_file.name}")
        return tmp_file.name

    def _build_create_response(self, video):
        """
        Estructura estándar de respuesta para create()
        """
        return {
            "id": video.id,
            "file_name": video.file_name,
            "status": video.status,
            "message": "Video recibido. Procesamiento iniciado.",
        }
