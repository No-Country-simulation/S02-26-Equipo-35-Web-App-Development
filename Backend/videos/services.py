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
from .audio_processor import AudioProcessor

logger = logging.getLogger(__name__)


# =========================================================
# FALL
# =========================================================
def generate_fallback_clips(video_duration):
    """
    Genera clips automáticos para cuando no hay Gemini.
    Reglas:
    - Cada clip mínimo 8s, máximo 60s
    - No puede superar la duración del video
    - Divide el video en hasta 3 clips proporcionales según duración
    """
    MIN_DURATION = 8
    MAX_DURATION = 60
    clips = []

    if video_duration < MIN_DURATION:
        return []  # no se crea ningún clip
    elif video_duration <= MAX_DURATION:
        # Video muy corto: 1 clip que ocupe todo
        clips.append({"start": 0, "end": video_duration})
        return clips

    # Determinar cantidad de clips según duración del video
    if video_duration <= 40:
        num_clips = 2
        points = [0, 0.5, 1.0]
    else:
        num_clips = 3
        points = [0, 0.3, 0.6, 1.0]

    for i in range(num_clips):
        start = video_duration * points[i]
        end = video_duration * points[i + 1]

        # Limitar duración máximo 60s
        if end - start > MAX_DURATION:
            end = start + MAX_DURATION

        # Limitar duración mínimo 8s, si no se cumple, no creamos clip
        if end - start >= MIN_DURATION:
            clips.append({"start": round(start, 3), "end": round(end, 3)})

    return clips


# =========================================================
# FFMPEG WRAPPER
# =========================================================
def run_ffmpeg(command):
    try:
        subprocess.run(
            command,
            check=True,
            text=True,
            capture_output=True,
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
def generate_shorts(video_path, clips_data):
    """
    🔥 1 SOLO FFMPEG POR SHORT
    🔥 720x1280
    🔥 libx264 + preset veryfast
    🔥 cover generado desde el short ya procesado
    """
    shorts_data = []
    segments = []

    for clip in clips_data:
        try:
            start = float(clip.get("start", 0))
            end = float(clip.get("end", 0))
        except (TypeError, ValueError):
            continue

        if end > start:  # solo aseguramos start < end
            segments.append((start, end))

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
                        "-i",
                        video_path,
                        "-t",
                        str(end - start),
                        "-vf",
                        "crop=trunc(ih*9/16/2)*2:ih:(iw-trunc(ih*9/16/2)*2)/2:0,scale=720:1280",
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
                clip_duration = end - start
                second_for_cover = min(1, clip_duration / 2)
                cover_path = generate_cover_from_video(
                    temp_short.name, second_for_cover
                )

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
    if result.stderr:
        logger.warning(f"ffprobe stderr: {result.stderr}")

    data = json.loads(result.stdout)

    video_stream = next(
        (s for s in data["streams"] if s["codec_type"] == "video"),
        None,
    )
    if not video_stream:
        raise ValueError("No video stream found")

    audio_stream = next(
        (s for s in data["streams"] if s["codec_type"] == "audio"),
        None,
    )
    if not audio_stream:
        logger.warning("⚠️ No se detectó stream de audio en el video")

    width = int(video_stream["width"])
    height = int(video_stream["height"])
    divisor = gcd(width, height)

    return {
        "width": width,
        "height": height,
        "aspect_ratio": f"{width // divisor}:{height // divisor}",
        "duration": float(data["format"].get("duration", 0)),
        "has_audio": audio_stream is not None,
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
        with transaction.atomic():
            video = Video.objects.select_for_update().get(id=video_id)

            if video.status == Video.Status.PROCESSING:
                logger.warning(
                    f"Video {video.id} ya está en processing. Abortando task duplicada."
                )
                return

            video.status = Video.Status.PROCESSING
            video.save()

        job = ProcessingJob.objects.create(
            video=video,
            job_type=ProcessingJob.JobType.SHORTS_GENERATION,
            status=ProcessingJob.Status.RUNNING,
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
        video.has_audio = metadata["has_audio"]
        video.file_size = os.path.getsize(temp_video_path)

        if video.height > video.width:
            raise ValueError("Solo se permiten videos horizontales (landscape)")

        video.save()

        job.progress = 25
        job.save()

        # -----------------------
        # 2.5 Procesar audio para usar el modelo gemini
        # -----------------------

        duration = metadata["duration"]
        if duration <= 0:
            raise ValueError("Video duration inválida o 0")

        if metadata["has_audio"]:
            try:
                audio_processor = AudioProcessor()
                clips_data = audio_processor.process_video(temp_video_path)
            except Exception as e:
                logger.warning(f"AudioProcessor no disponible: {str(e)}")
                clips_data = None

            if (
                not clips_data
                or not isinstance(clips_data, list)
                or len(clips_data) == 0
            ):
                logger.warning("⚠️ Gemini inválido o vacío. Usando fallback.")
                clips_data = generate_fallback_clips(duration)

        else:
            logger.warning("⚠️ El video no tiene audio. Generando shorts automáticos.")
            clips_data = generate_fallback_clips(duration)

        # -----------------------
        # VALIDAR CLIPS CONTRA DURACIÓN REAL
        # -----------------------

        validated_clips = []
        for clip in clips_data:
            start = max(0, float(clip.get("start", 0)))
            end = min(duration, float(clip.get("end", 0)))
            if end > start:
                validated_clips.append({"start": round(start, 3), "end": round(end, 3)})
        clips_data = validated_clips

        # Si no quedaron clips válidos, usar fallback
        if len(clips_data) == 0:
            logger.warning("⚠️ No quedaron clips válidos. Usando fallback.")
            clips_data = generate_fallback_clips(duration)

        logger.info(f"📊 Clips encontrados: {clips_data}")

        job.progress = 30
        job.save()

        # -----------------------
        # NORMALIZAR Y DETECTAR SUPERPOSICIÓN
        # -----------------------

        # Ordenar por start
        clips_data = sorted(clips_data, key=lambda x: x["start"])

        # Detectar superposición
        for i in range(1, len(clips_data)):
            if clips_data[i]["start"] < clips_data[i - 1]["end"]:
                logger.warning(
                    f"Clips superpuestos detectados entre "
                    f"{clips_data[i - 1]} y {clips_data[i]}"
                )

        # -----------------------
        # GENERAR COVER ORIGINAL
        # -----------------------
        cover_original_path = generate_cover_from_video(temp_video_path, 1)

        job.progress = 35
        job.save()

        # -----------------------
        # GENERAR SHORTS LOCAL
        # -----------------------
        shorts_local_data = generate_shorts(temp_video_path, clips_data)

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

        # -----------------------
        # Subir shorts (IDEMPOTENTE)
        # ----------------------

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
                status=Short.Status.READY,
            )

        logger.info(f"TOTAL SHORTS EN DB: {video.shorts.count()}")
        # -----------------------
        # FINALIZAR
        # -----------------------
        video.status = Video.Status.READY
        video.generated_shorts_count = video.shorts.count()
        video.save()

        job.status = ProcessingJob.Status.COMPLETED
        job.progress = 100
        job.finished_at = timezone.now()
        job.save()

        logger.info(f"✅ Video {video_id} procesado correctamente")

    except Exception as e:
        logger.error(f"❌ Error procesando video {video_id}: {str(e)}")

        if video:
            video.status = Video.Status.FAILED
            video.save()

        if job:
            job.status = ProcessingJob.Status.FAILED
            job.error_message = str(e)[:300]
            job.finished_at = timezone.now()
            job.save()

    finally:

        logger.info(f"||||||||||||||||||Borrando-Video|||||||||||")

        if os.path.exists(temp_video_path):
            os.unlink(temp_video_path)

        if cover_original_path and os.path.exists(cover_original_path):
            os.unlink(cover_original_path)

        for short in shorts_local_data:
            if os.path.exists(short.get("short_path", "")):
                os.unlink(short["short_path"])
            if os.path.exists(short.get("cover_path", "")):
                os.unlink(short["cover_path"])


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
            old_shorts = list(video.shorts.all())

            for short in old_shorts:

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
