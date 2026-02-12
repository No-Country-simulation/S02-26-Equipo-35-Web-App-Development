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

    def get_queryset(self):
        """Solo los videos del usuario logueado, ordenados por fecha descendente"""
        return Video.objects.filter(user=self.request.user).order_by("-created_at")

    def get_serializer_class(self):
        """Elegir serializer según acción"""
        if self.action == "create":
            return VideoUploadSerializer
        return VideoResponseSerializer

    @swagger_auto_schema(
        request_body=VideoUploadSerializer,
        responses={
            202: openapi.Response(
                description="Video recibido. Procesamiento iniciado.",
                schema=VideoResponseSerializer(),
            )
        },
        operation_description="Sube un video, crea registro y dispara el procesamiento asíncrono",
    )
    def create(self, request, *args, **kwargs):
        """
        POST /api/videos/
        Recibe un video, crea registro en DB y dispara la tarea de procesamiento asíncrona.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        video_file = serializer.validated_data["video_file"]
        file_name = serializer.validated_data.get("file_name", video_file.name)
        user = request.user

        # 1. Crear registro de video en estado 'uploaded'
        video = Video.objects.create(user=user, file_name=file_name, status="uploaded")

        # 2. Guardar archivo temporal en disco
        with tempfile.NamedTemporaryFile(
            suffix=f"_{file_name}", delete=False
        ) as tmp_file:
            tmp_file.write(video_file.read())
            temp_video_path = tmp_file.name

        logger.info(f"Archivo temporal creado: {temp_video_path}")

        # 3. Disparar tarea Celery con ruta temporal
        process_video_task.delay(video.id, temp_video_path, file_name)

        # 4. Responder inmediatamente
        return Response(
            {
                "id": video.id,
                "file_name": video.file_name,
                "status": video.status,
                "message": "Video recibido. Procesamiento iniciado.",
            },
            status=status.HTTP_202_ACCEPTED,
        )

    @swagger_auto_schema(
        operation_description="Consulta estado y progreso de un video",
        responses={200: VideoResponseSerializer()},
    )
    @action(detail=True, methods=["get"])
    def status(self, request, pk=None):
        """Consultar estado y progreso del video"""
        video = self.get_object()
        job = video.processing_jobs.last()

        return Response(
            {
                "id": video.id,
                "status": video.status,
                "progress": job.progress if job else 0,
                "error": job.error_message if job and job.status == "failed" else None,
            }
        )

    @swagger_auto_schema(
        operation_description="Obtiene la lista de shorts generados para un video",
        responses={200: VideoResponseSerializer()},
    )
    @action(detail=True, methods=["get"])
    def shorts(self, request, pk=None):
        """Obtener lista de shorts generados para este video"""
        video = self.get_object()

        if video.status != "ready":
            return Response(
                {"detail": f"Shorts no disponibles. Estado: {video.status}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = VideoResponseSerializer(video)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Obtiene la URL del video original",
        responses={200: openapi.Response(description="URL del video")},
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """Obtener URL del video original"""
        video = self.get_object()

        if not video.file_url:
            return Response(
                {"error": "Video no disponible"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"file_url": video.file_url, "file_name": video.file_name})
