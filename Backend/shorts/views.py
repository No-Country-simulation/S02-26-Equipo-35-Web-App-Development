import logging
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Short
from videos.models import Video
from .serializers import ShortSerializer, ShortCreateSerializer, ShortUpdateSerializer

logger = logging.getLogger(__name__)


class ShortViewSet(viewsets.ModelViewSet):
    """
    ViewSet para consultar shorts generados.
    - Usuarios normales: solo lectura.
    - Admin: creación y edición manual (no implementado todavía).
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ShortSerializer

    def get_queryset(self):
        """Cada usuario solo ve shorts de sus propios videos"""
        if getattr(self, "swagger_fake_view", False):
            return Short.objects.none()
        return (
            Short.objects.filter(video__user=self.request.user)
            .select_related("video")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        """Selecciona serializer según acción y permisos"""
        if self.action == "create":
            return ShortCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return ShortUpdateSerializer
        return ShortSerializer

    @swagger_auto_schema(
        request_body=ShortCreateSerializer,
        operation_description="Creación manual de short (solo admin, placeholder)",
        responses={
            501: openapi.Response(
                description="Creación manual no implementada. Los shorts se generan automáticamente."
            ),
            403: "No autorizado",
        },
    )
    def create(self, request, *args, **kwargs):
        """
        POST /api/shorts/
        Solo admin - creación manual de shorts.
        """
        if not request.user.is_staff:
            return Response(
                {"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            {
                "detail": "Creación manual no implementada. Los shorts se generan automáticamente."
            },
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    @swagger_auto_schema(
        operation_description="Lista todos los shorts de un video específico del usuario",
        manual_parameters=[
            openapi.Parameter(
                "video_id",
                openapi.IN_QUERY,
                description="ID del video",
                type=openapi.TYPE_INTEGER,
                required=True,
            )
        ],
        responses={200: ShortSerializer(many=True)},
    )
    @action(detail=False, methods=["get"])
    def by_video(self, request):
        """GET /api/shorts/by_video/?video_id=123"""
        video_id = request.query_params.get("video_id")
        if not video_id:
            return Response(
                {"detail": "Se requiere video_id"}, status=status.HTTP_400_BAD_REQUEST
            )

        video = get_object_or_404(Video, id=video_id, user=request.user)
        shorts = self.get_queryset().filter(video=video)
        serializer = self.get_serializer(shorts, many=True)

        return Response(
            {
                "video_id": video.id,
                "video_title": video.file_name,
                "count": shorts.count(),
                "shorts": serializer.data,
            }
        )

    @swagger_auto_schema(
        operation_description="Obtiene URL y duración del short si está listo",
        responses={200: ShortSerializer()},
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """GET /api/shorts/{id}/download/"""
        short = self.get_object()

        if short.status != "ready":
            return Response(
                {"detail": f"Short no disponible. Estado: {short.status}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "file_url": short.file_url,
                "cover_url": short.cover_url,
                "duration_seconds": short.end_second - short.start_second,
            }
        )

    @swagger_auto_schema(
        operation_description="Regenera la portada del short (solo admin, placeholder)",
        responses={501: "Regeneración de cover no implementada", 403: "No autorizado"},
    )
    @action(detail=True, methods=["post"])
    def regenerate_cover(self, request, pk=None):
        """POST /api/shorts/{id}/regenerate_cover/"""
        if not request.user.is_staff:
            return Response(
                {"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN
            )

        short = self.get_object()

        return Response(
            {"detail": "Regeneración de cover no implementada"},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )
