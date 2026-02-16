import logging
import tempfile
import os
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Video
from .serializers import VideoUploadSerializer, VideoResponseSerializer
from .services import process_video_task, delete_video

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
    # Serializer
    # ==============================

    def get_serializer_class(self):
        if self.action == "create":
            return VideoUploadSerializer
        return VideoResponseSerializer

    # ==============================
    # CREATE VIDEO
    # ==============================

    @swagger_auto_schema(
        request_body=VideoUploadSerializer,
        responses={
            202: openapi.Response(
                description="Video recibido. Procesamiento iniciado.",
                schema=VideoResponseSerializer(),
            )
        },
        operation_summary="Subir video y comenzar procesamiento",
        operation_description="Sube un video y dispara procesamiento asíncrono",
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        video = self._create_video_instance(
            user=request.user,
            validated_data=serializer.validated_data,
        )

        temp_path = self._save_temp_file(serializer.validated_data["video_file"])

        process_video_task.delay(video.id, temp_path, video.file_name)

        return Response(
            self._build_create_response(video), status=status.HTTP_202_ACCEPTED
        )

    # ==============================
    # VIDEO STATUS
    # ==============================

    @swagger_auto_schema(
        operation_description="Consulta estado y progreso de un video",
        responses={200: VideoResponseSerializer()},
        operation_summary="Consultar estado y progreso del video",
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
                "error": job.error_message if job and job.status == "failed" else None,
            }
        )

    # ==============================
    # VIDEO DOWNLOAD
    # ==============================

    @swagger_auto_schema(
        operation_description="Obtiene la URL del video original",
        responses={
            200: openapi.Response(description="URL del video"),
            404: openapi.Response(description="Video no disponible"),
        },
        operation_summary="Obtener URL de descarga del video original",
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        video = self.get_object()
        if not video.file_url:
            return Response(
                {"detail": "Video no disponible"}, status=status.HTTP_404_NOT_FOUND
            )
        return Response({"file_url": video.file_url, "file_name": video.file_name})

    # ==============================
    # DELETE DOWNLOAD
    # ==============================

    @swagger_auto_schema(
        operation_summary="Borrar video y todo lo asociado",
        operation_description=(
            "Borra el video original, todos los shorts y sus covers "
            "tanto de la base de datos como de Cloudinary"
        ),
        responses={
            204: "Video eliminado correctamente",
            404: "Video no encontrado",
            500: "Error eliminando recursos",
        },
    )
    def destroy(self, request, *args, **kwargs):
        video = self.get_object()

        try:
            delete_video(video)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"detail": f"Error eliminando video: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # ==============================
    # HELPERS
    # ==============================

    def _create_video_instance(self, user, validated_data):
        file_name = validated_data.get("file_name") or validated_data["video_file"].name
        return Video.objects.create(
            user=user, file_name=file_name, status=Video.Status.UPLOADED
        )

    def _save_temp_file(self, video_file):
        temp_dir = os.path.join(settings.BASE_DIR, "temp")
        os.makedirs(temp_dir, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            suffix=f"_{video_file.name}", delete=False, dir=temp_dir
        ) as tmp_file:
            for chunk in video_file.chunks():
                tmp_file.write(chunk)
        logger.info(f"Archivo temporal creado: {tmp_file.name}")
        return tmp_file.name

    def _build_create_response(self, video):
        """
        Retorna info básica de video recién subido
        """
        return {
            "id": video.id,
            "file_name": video.file_name,
            "status": video.status,
            "message": "Video recibido. Procesamiento iniciado.",
        }
