import os
import tempfile
import logging
import subprocess
import json
from math import gcd
from django.utils import timezone
from celery import shared_task
import cloudinary.uploader
import cloudinary.api
from django.db import transaction

from .models import Video, ProcessingJob
from .audio_processor import AudioProcessor
from shorts.models import Short

logger = logging.getLogger(__name__)


# =========================================================
# CELERY TASK
# =========================================================
@shared_task
def process_video_task(video_id, temp_video_path, file_name):
    """
    Procesa el video completo:
    - Extrae metadata
    - Genera 3 shorts optimizados
    - Genera covers
    - Si TODO sale bien → sube todo a Cloudinary
    - Limpia archivo temporal SIEMPRE
    """
    video = None
    job = None
    audio_processor = None

    try:
        # 1 Obtener video
        video = Video.objects.get(id=video_id)
        video.status = "processing"
        video.save()

        job = ProcessingJob.objects.create(
            video=video,
            job_type="shorts_generation",
            status="running",
            started_at=timezone.now(),
            progress=10,
        )

        # 2 Metadata
        metadata = get_video_metadata(temp_video_path)
        video.width = metadata["width"]
        video.height = metadata["height"]
        video.aspect_ratio = metadata["aspect_ratio"]
        video.duration_seconds = metadata["duration"]
        video.file_size = os.path.getsize(temp_video_path)
        video.save()

        job.progress = 25
        job.save()
        # 2.5 Procesar audio para usar el modelo gemini
        audio_processor = AudioProcessor()
        clips_data = audio_processor.process_video_audio(temp_video_path)
        logger.info(f"📊 Clips encontrados: {clips_data}")
        
        job.progress = 50
        job.save()

        # 3 Generar shorts LOCALMENTE (sin subir nada aún)
        
        shorts_local_data = generate_shorts(temp_video_path, video)

        job.progress = 70
        job.save()
        

        # 4 Subir ORIGINAL
        original_upload = cloudinary.uploader.upload(
            temp_video_path,
            resource_type="video",
            folder="videos/original",
            public_id=f"video_{video.id}_{int(timezone.now().timestamp())}",
        )

        video.file_url = original_upload["secure_url"]
        video.cloudinary_public_id = original_upload["public_id"]
        video.save()

        # 5 Subir shorts y covers
        for i, short_info in enumerate(shorts_local_data, 1):

            short_upload = cloudinary.uploader.upload(
                short_info["short_path"],
                resource_type="video",
                folder="videos/shorts",
                public_id=f"{video.cloudinary_public_id}_short_{i}",
            )

            cover_upload = cloudinary.uploader.upload(
                short_info["cover_path"],
                resource_type="image",
                folder="videos/covers",
                public_id=f"{video.cloudinary_public_id}_cover_{i}",
            )

            # Obtener datos seguros de Cloudinary
            short_public_id = short_upload.get("public_id")
            short_url = short_upload.get("secure_url")
            cover_public_id = cover_upload.get("public_id")
            cover_url = cover_upload.get("secure_url")

            # Crear Short en la DB
            Short.objects.create(
                video=video,
                file_url=short_url if short_url else "",
                cloudinary_public_id=short_public_id if short_public_id else None,
                cover_url=cover_url if cover_url else "",
                cover_cloudinary_public_id=cover_public_id if cover_public_id else None,
                start_second=short_info["start"],
                end_second=short_info["end"],
                status="ready",
            )

            logger.warning(f"CREANDO SHORT {i} PARA VIDEO {video.id}")
            # =========================
            # Limpiar archivos temporales de short y cover
            # =========================
            if os.path.exists(short_info["short_path"]):
                os.unlink(short_info["short_path"])
            if os.path.exists(short_info["cover_path"]):
                os.unlink(short_info["cover_path"])

        logger.warning(f"TOTAL SHORTS EN DB: {video.shorts.count()}")

        # 6️⃣ Finalizar
        video.status = "ready"
        video.generated_shorts_count = 3
        video.save()

        job.status = "completed"
        job.progress = 100
        job.finished_at = timezone.now()
        job.save()

        logger.info(f"✅ Video {video_id} procesado correctamente")

    except Exception as e:
        logger.error(f"❌ Error procesando video {video_id}: {str(e)}")

        if video:
            video.status = "failed"
            video.save()

        if job:
            job.status = "failed"
            job.error_message = str(e)[:300]
            job.finished_at = timezone.now()
            job.save()

    finally:
        # 🔥 CRÍTICO — borrar archivo temporal original SIEMPRE
        if os.path.exists(temp_video_path):
            os.unlink(temp_video_path)


# =========================================================
# METADATA
# =========================================================
def get_video_metadata(video_path):
    cmd = [
        "ffprobe",
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        video_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)

    video_stream = next(s for s in data["streams"] if s["codec_type"] == "video")
    width = int(video_stream["width"])
    height = int(video_stream["height"])
    divisor = gcd(width, height)

    return {
        "width": width,
        "height": height,
        "aspect_ratio": f"{width // divisor}:{height // divisor}",
        "duration": float(data["format"].get("duration", 0)),
    }


# =========================================================
# GENERATE SHORTS (OPTIMIZADO)
# =========================================================
def generate_shorts(video_path, video):
    """
    🔥 1 SOLO FFMPEG POR SHORT
    🔥 720x1280
    🔥 libx264 + preset veryfast
    🔥 cover generado desde el short ya procesado
    """

    shorts_data = []
    total = video.duration_seconds

    segments = [
        (0, total * 0.3),
        (total * 0.35, total * 0.65),
        (total * 0.7, total - 1),
    ]

    for start, end in segments:
        start = round(start, 3)
        end = round(end, 3)

        with tempfile.NamedTemporaryFile(
            suffix=".mp4", delete=False
        ) as temp_short, tempfile.NamedTemporaryFile(
            suffix=".jpg", delete=False
        ) as temp_cover:

            try:
                # 🔥 UN SOLO COMANDO FFMPEG
                subprocess.run(
                    [
                        "ffmpeg",
                        "-ss",
                        str(start),
                        "-to",
                        str(end),
                        "-i",
                        video_path,
                        "-vf",
                        "crop=ih*9/16:ih,scale=720:1280",
                        "-c:v",
                        "libx264",
                        "-preset",
                        "veryfast",
                        "-crf",
                        "23",
                        "-c:a",
                        "aac",
                        "-b:a",
                        "128k",
                        "-y",
                        temp_short.name,
                    ],
                    check=True,
                    capture_output=True,
                )

                # 🔥 Cover desde el short ya generado
                subprocess.run(
                    [
                        "ffmpeg",
                        "-i",
                        temp_short.name,
                        "-ss",
                        "1",
                        "-vframes",
                        "1",
                        "-y",
                        temp_cover.name,
                    ],
                    check=True,
                    capture_output=True,
                )

                shorts_data.append(
                    {
                        "short_path": temp_short.name,
                        "cover_path": temp_cover.name,
                        "start": start,
                        "end": end,
                    }
                )

            except Exception:
                # limpiar si falla
                if os.path.exists(temp_short.name):
                    os.unlink(temp_short.name)
                if os.path.exists(temp_cover.name):
                    os.unlink(temp_cover.name)
                raise

    return shorts_data


# =========================================================
# DELETE
# =========================================================
def delete_video(video):
    """
    Borra un Video y todos sus Shorts asociados, tanto de la base de datos
    como de Cloudinary.
    """

    try:
        with transaction.atomic():
            # 1️⃣ Borrar shorts + covers
            shorts = video.shorts.all()
            for short in shorts:
                try:
                    # Borrar video del short
                    if short.cloudinary_public_id:
                        cloudinary.uploader.destroy(
                            short.cloudinary_public_id, resource_type="video"
                        )
                        logger.info(
                            f"Short video Cloudinary borrado: {short.cloudinary_public_id}"
                        )

                    # Borrar cover del short
                    if short.cover_cloudinary_public_id:
                        cloudinary.uploader.destroy(
                            short.cover_cloudinary_public_id, resource_type="image"
                        )
                        logger.info(
                            f"Short cover Cloudinary borrado: {short.cover_cloudinary_public_id}"
                        )

                except Exception as e:
                    logger.error(
                        f"Error borrando short o cover {short.id} en Cloudinary: {str(e)}"
                    )
                finally:
                    short.delete()

            # 2️⃣ Borrar video original
            try:
                if video.cloudinary_public_id:
                    cloudinary.uploader.destroy(
                        video.cloudinary_public_id, resource_type="video"
                    )
                    logger.info(
                        f"Video Cloudinary borrado: {video.cloudinary_public_id}"
                    )
            except Exception as e:
                logger.error(f"Error borrando video {video.id} en Cloudinary: {str(e)}")

            # 3️⃣ Borrar instancia Video en DB
            video.delete()

    except Exception as e:
        logger.error(f"Error eliminando video {video.id}: {str(e)}")
        raise
