import logging
from cloudinary.uploader import destroy

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Short
from .services import delete_short
from videos.models import Video
from .serializers import (
    ShortSerializer,
    ShortDownloadSerializer,
    ShortByVideoResponseSerializer,
    MessageSerializer,
)

logger = logging.getLogger(__name__)


class ShortViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar Shorts:
    - Listar todos los shorts del usuario
    - Obtener detalle
    - Borrar short (video + cover en Cloudinary)
    - Filtrar por Video
    - Descargar short (solo READY)
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ShortSerializer
    http_method_names = ["get", "delete"]

    # -----------------------------
    # Queryset base
    # -----------------------------
    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Short.objects.none()

        return Short.objects.filter(video__user=self.request.user).select_related(
            "video"
        )

    # -----------------------------
    # LIST
    # -----------------------------
    @swagger_auto_schema(
        operation_summary="Listar todos los shorts del usuario",
        operation_description="Devuelve todos los shorts asociados a los videos del usuario autenticado.",
        responses={200: ShortSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    # -----------------------------
    # RETRIEVE
    # -----------------------------
    @swagger_auto_schema(
        operation_summary="Obtener detalle de un short",
        operation_description="Devuelve información completa de un short específico del usuario.",
        responses={200: ShortSerializer},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    # -----------------------------
    # DELETE seguro
    # -----------------------------
    @swagger_auto_schema(
        operation_summary="Eliminar short",
        operation_description="Elimina el short y sus recursos asociados en Cloudinary (video y cover).",
        responses={204: openapi.Response(description="Short eliminado correctamente")},
    )
    def destroy(self, request, *args, **kwargs):
        short = self.get_object()
        try:
            delete_short(short)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                MessageSerializer({"detail": "Error eliminando short"}).data,
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # -----------------------------
    # LISTAR SHORTS POR VIDEO
    # -----------------------------
    @swagger_auto_schema(
        operation_summary="Listar shorts de un video específico",
        operation_description="Devuelve todos los shorts asociados a un video del usuario.",
        manual_parameters=[
            openapi.Parameter(
                "video_id",
                openapi.IN_QUERY,
                description="ID del video",
                type=openapi.TYPE_INTEGER,
                required=True,
            )
        ],
        responses={200: ShortByVideoResponseSerializer},
    )
    @action(detail=False, methods=["get"])
    def by_video(self, request):
        video_id = request.query_params.get("video_id")
        if not video_id:
            return Response(
                MessageSerializer({"detail": "Se requiere video_id"}).data,
                status=status.HTTP_400_BAD_REQUEST,
            )

        video = get_object_or_404(Video, id=video_id, user=request.user)
        shorts = self.get_queryset().filter(video=video)

        serializer = ShortSerializer(shorts, many=True)
        response_data = {
            "video_id": video.id,
            "video_title": video.file_name,
            "count": shorts.count(),
            "shorts": serializer.data,
        }

        return Response(response_data)

    # -----------------------------
    # DESCARGA DE SHORT
    # -----------------------------
    @swagger_auto_schema(
        operation_summary="Obtener URL de descarga del short",
        operation_description="Devuelve la URL del short, portada y duración si está READY.",
        responses={200: ShortDownloadSerializer},
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        short = self.get_object()
        if short.status != Short.Status.READY:
            return Response(
                MessageSerializer(
                    {"detail": f"Short no disponible. Estado: {short.status}"}
                ).data,
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ShortDownloadSerializer(short)
        return Response(serializer.data)
