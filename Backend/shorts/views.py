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
from videos.models import Video
from .serializers import ShortSerializer

logger = logging.getLogger(__name__)


class ShortViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]
    serializer_class = ShortSerializer
    http_method_names = ["get", "delete"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Short.objects.none()

        return Short.objects.filter(video__user=self.request.user).select_related(
            "video"
        )

    # -----------------------------
    # DELETE seguro
    # -----------------------------

    def perform_destroy(self, instance):
        """
        Elimina el short en Cloudinary y luego en DB.
        """

        # Borrar video
        if instance.cloudinary_public_id:
            try:
                destroy(
                    instance.cloudinary_public_id,
                    resource_type="video",
                )
            except Exception as e:
                logger.error(f"Error eliminando video short {instance.id}: {str(e)}")

        # Borrar cover
        if instance.cover_cloudinary_public_id:
            try:
                destroy(
                    instance.cover_cloudinary_public_id,
                    resource_type="image",
                )
            except Exception as e:
                logger.error(f"Error eliminando cover short {instance.id}: {str(e)}")

        instance.delete()

    # -----------------------------
    # Filtrar por video
    # -----------------------------

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

        video_id = request.query_params.get("video_id")

        if not video_id:
            return Response(
                {"detail": "Se requiere video_id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        video = get_object_or_404(
            Video,
            id=video_id,
            user=request.user,
        )

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

    # -----------------------------
    # Download
    # -----------------------------

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):

        short = self.get_object()

        if short.status != Short.Status.READY:
            return Response(
                {"detail": f"Short no disponible. Estado: {short.status}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "file_url": short.file_url,
                "cover_url": short.cover_url,
                "duration_seconds": short.duration_seconds,
            }
        )
