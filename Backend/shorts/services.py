import logging
import cloudinary.uploader
from django.db import transaction

logger = logging.getLogger(__name__)


def delete_short(short):
    """
    Borra un Short y su cover en Cloudinary y luego la base de datos.
    NO toca el Video original.
    """
    try:
        with transaction.atomic():
            # 🔹 Borrar video del Short
            if short.cloudinary_public_id:
                try:
                    cloudinary.uploader.destroy(
                        short.cloudinary_public_id, resource_type="video"
                    )
                    logger.info(
                        f"Short video Cloudinary borrado: {short.cloudinary_public_id}"
                    )
                except Exception as e:
                    logger.error(f"Error borrando video short {short.id}: {str(e)}")

            # 🔹 Borrar cover del Short
            if short.cover_cloudinary_public_id:
                try:
                    cloudinary.uploader.destroy(
                        short.cover_cloudinary_public_id, resource_type="image"
                    )
                    logger.info(
                        f"Short cover Cloudinary borrado: {short.cover_cloudinary_public_id}"
                    )
                except Exception as e:
                    logger.error(f"Error borrando cover short {short.id}: {str(e)}")

            # 🔹 Borrar registro en la DB
            short.delete()
            logger.info(f"Short {short.id} eliminado de la base de datos")
    except Exception as e:
        logger.error(f"Error eliminando short {short.id}: {str(e)}")
        raise
