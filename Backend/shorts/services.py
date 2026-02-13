import logging
from django.utils import timezone
from .models import Short
from videos.models import Video

logger = logging.getLogger(__name__)


class ShortService:
    """
    Servicio centralizado para operaciones con Shorts.
    Solo incluye funcionalidades fundamentales:
    - Listar shorts de un usuario
    - Marcar short como fallido
    """

    @classmethod
    def get_user_shorts(cls, user, video_id=None):
        """
        Obtiene todos los shorts de un usuario, opcionalmente filtrando por video.
        Optimizado con select_related para el video.
        """
        queryset = Short.objects.filter(video__user=user)

        if video_id:
            queryset = queryset.filter(video_id=video_id)

        # select_related para acceder al video sin otra query
        return queryset.select_related("video").order_by("-created_at")

    @classmethod
    def mark_as_failed(cls, short_id, error_message=None):
        """
        Marca un short como fallido y registra en logs.
        """
        try:
            updated_count = Short.objects.filter(id=short_id).update(
                status="failed",
            )
            if updated_count:
                logger.error(
                    f"Short {short_id} marcado como FAILED. {error_message or ''}"
                )
            else:
                logger.warning(
                    f"Short {short_id} no encontrado para marcar como FAILED"
                )
        except Exception as e:
            logger.exception(f"Error marcando short {short_id} como FAILED: {str(e)}")
