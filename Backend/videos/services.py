import os
import tempfile
import logging
import subprocess
import json
from math import gcd
from django.utils import timezone
from celery import shared_task
import cloudinary.uploader
from django.db import transaction

from .models import Video, ProcessingJob
from shorts.models import Short

logger = logging.getLogger(__name__)


# =========================================================
# FFMPEG WRAPPER
# =========================================================
def run_ffmpeg(command):
    try:
        subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        logger.error("FFmpeg failed:\n%s", e.stderr)
        raise


# =========================================================
# GENERATE COVER (REUTILIZABLE)
# =========================================================
def generate_cover_from_video(video_path, second=1):
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_cover:
        try:
            run_ffmpeg(
                [
                    "ffmpeg",
                    "-ss",
                    str(second),
                    "-i",
                    video_path,
                    "-vframes",
                    "1",
                    "-q:v",
                    "2",
                    "-y",
                    temp_cover.name,
                ]
            )
            return temp_cover.name
        except Exception:
            # limpiar si falla
            if os.path.exists(temp_cover.name):
                os.unlink(temp_cover.name)
            raise


# =========================================================
# GENERATE SHORTS
# =========================================================
def generate_shorts(video_path, video, clips_data):
    """
    🔥 1 SOLO FFMPEG POR SHORT
    🔥 720x1280
    🔥 libx264 + preset veryfast
    🔥 cover generado desde el short ya procesado
    """
    shorts_data = []
    total = video.duration_seconds

    # segments = [
    #     (0, total * 0.3),
    #     (total * 0.35, total * 0.65),
    #     (total * 0.7, total - 1),
    # ]
    segments = [(clip["start"], clip["end"]) for clip in clips_data]

    for start, end in segments:
        start = round(start, 3)
        end = round(end, 3)

        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_short:
            try:
                # Generar short
                run_ffmpeg(
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
                    ]
                )

                # Generar cover reutilizando función
                cover_path = generate_cover_from_video(temp_short.name, 1)

                shorts_data.append(
                    {
                        "short_path": temp_short.name,
                        "cover_path": cover_path,
                        "start": start,
                        "end": end,
                    }
                )

            except Exception:
                # limpiar si falla
                if os.path.exists(temp_short.name):
                    os.unlink(temp_short.name)
                raise

    return shorts_data


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
# CELERY TASK
# =========================================================
@shared_task
def process_video_task(video_id, temp_video_path, file_name):
    video = None
    job = None
    cover_original_path = None
    shorts_local_data = []

    try:
        # -----------------------
        # INIT
        # -----------------------
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

        # -----------------------
        # METADATA
        # -----------------------
        metadata = get_video_metadata(temp_video_path)
        video.width = metadata["width"]
        video.height = metadata["height"]
        video.aspect_ratio = metadata["aspect_ratio"]
        video.duration_seconds = metadata["duration"]
        video.file_size = os.path.getsize(temp_video_path)
        video.save()

        job.progress = 25
        job.save()
        
        # -----------------------
        # 2.5 Procesar audio para usar el modelo gemini
        # -----------------------
        
        audio_processor = AudioProcessor()
        clips_data = audio_processor.process_video(temp_video_path) # Aqui se obtiene el json con los shorts
        logger.info(f"📊 Clips encontrados: {clips_data}")
        
        job.progress = 30
        job.save()

        # -----------------------
        # GENERAR COVER ORIGINAL
        # -----------------------
        cover_original_path = generate_cover_from_video(temp_video_path, 1)

        job.progress = 35
        job.save()

        # -----------------------
        # GENERAR SHORTS LOCAL
        # -----------------------
        shorts_local_data = generate_shorts(temp_video_path, video,clips_data)

        job.progress = 70
        job.save()

        # ============================
        # 🔥 SUBIDA A CLOUDINARY (SOLO SI TODO OK)
        # ============================

        # Subir original
        original_upload = cloudinary.uploader.upload(
            temp_video_path,
            resource_type="video",
            folder="videos/original",
            public_id=f"video_{video.id}_{int(timezone.now().timestamp())}",
        )

        video.file_url = original_upload["secure_url"]
        video.cloudinary_public_id = original_upload["public_id"]

        # Subir cover original
        cover_original_upload = cloudinary.uploader.upload(
            cover_original_path,
            resource_type="image",
            folder="videos/covers/original",
            public_id=f"{video.cloudinary_public_id}_cover_original",
        )

        video.cover_original_url = cover_original_upload["secure_url"]
        video.cover_original_cloudinary_public_id = cover_original_upload["public_id"]
        video.save()

        # Subir shorts
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

            Short.objects.create(
                video=video,
                file_url=short_upload["secure_url"],
                cloudinary_public_id=short_upload["public_id"],
                cover_url=cover_upload["secure_url"],
                cover_cloudinary_public_id=cover_upload["public_id"],
                start_second=short_info["start"],
                end_second=short_info["end"],
                status="ready",
            )

        # -----------------------
        # CLEAN TEMP FILES
        # -----------------------
        logger.info(f"||||||||||||||||||Borrando-Video|||||||||||")
        
        if cover_original_path and os.path.exists(cover_original_path):
            os.unlink(cover_original_path)

        for short in shorts_local_data:
            if os.path.exists(short["short_path"]):
                os.unlink(short["short_path"])
            if os.path.exists(short["cover_path"]):
                os.unlink(short["cover_path"])

        logger.warning(f"TOTAL SHORTS EN DB: {video.shorts.count()}")
        # -----------------------
        # FINALIZAR
        # -----------------------
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
        if os.path.exists(temp_video_path):
            os.unlink(temp_video_path)


# =========================================================
# DELETE
# =========================================================
def delete_video(video):
    """
    Borra un Video y todos sus Shorts asociados,
    tanto de la base de datos como de Cloudinary.
    """
    try:
        with transaction.atomic():

            # 1️⃣ Borrar shorts + covers
            for short in video.shorts.all():

                # Borrar video del short en Cloudinary
                if short.cloudinary_public_id:
                    try:
                        cloudinary.uploader.destroy(
                            short.cloudinary_public_id, resource_type="video"
                        )
                        logger.info(
                            f"Short video Cloudinary borrado: {short.cloudinary_public_id}"
                        )
                    except Exception as e:
                        logger.error(f"Error borrando short video {short.id}: {str(e)}")

                # Borrar cover del short en Cloudinary
                if short.cover_cloudinary_public_id:
                    try:
                        cloudinary.uploader.destroy(
                            short.cover_cloudinary_public_id, resource_type="image"
                        )
                        logger.info(
                            f"Short cover Cloudinary borrado: {short.cover_cloudinary_public_id}"
                        )
                    except Exception as e:
                        logger.error(f"Error borrando short cover {short.id}: {str(e)}")

                # Borrar short en DB
                short.delete()

            # 2️⃣ Borrar cover original del video
            if video.cover_original_cloudinary_public_id:
                try:
                    cloudinary.uploader.destroy(
                        video.cover_original_cloudinary_public_id,
                        resource_type="image",
                    )
                    logger.info(
                        f"Cover original borrado: {video.cover_original_cloudinary_public_id}"
                    )
                except Exception as e:
                    logger.error(f"Error borrando cover original {video.id}: {str(e)}")

            # 3️⃣ Borrar video original en Cloudinary
            if video.cloudinary_public_id:
                try:
                    cloudinary.uploader.destroy(
                        video.cloudinary_public_id,
                        resource_type="video",
                    )
                    logger.info(f"Video original borrado: {video.cloudinary_public_id}")
                except Exception as e:
                    logger.error(f"Error borrando video original {video.id}: {str(e)}")

            # 4️⃣ Borrar instancia Video en DB
            video.delete()

    except Exception as e:
        logger.error(f"Error eliminando video {video.id}: {str(e)}")
        raise
