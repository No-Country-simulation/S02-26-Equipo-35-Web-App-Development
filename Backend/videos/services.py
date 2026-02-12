import os
import tempfile
import logging
import subprocess
import json
from math import gcd
from django.utils import timezone
from celery import shared_task
import cloudinary.uploader

from .models import Video, ProcessingJob
from shorts.models import Short

logger = logging.getLogger(__name__)


@shared_task
def process_video_task(video_id, temp_video_path, file_name):
    """
    Tarea de Celery para procesar video de forma asíncrona.
    Ahora recibe la ruta del video en lugar de bytes grandes.
    """
    try:
        # 1. Obtener video
        video = Video.objects.get(id=video_id)
        video.status = "processing"
        video.save()

        # 2. Crear job
        job = ProcessingJob.objects.create(
            video=video,
            job_type="shorts_generation",
            status="running",
            started_at=timezone.now(),
            progress=10,
        )

        # 3. Obtener metadata
        metadata = get_video_metadata(temp_video_path)
        video.width = metadata["width"]
        video.height = metadata["height"]
        video.aspect_ratio = metadata["aspect_ratio"]
        video.duration_seconds = metadata["duration"]
        video.file_size = os.path.getsize(temp_video_path)
        video.save()

        job.progress = 30
        job.save()

        # 4. Subir original a Cloudinary
        cloudinary_data = upload_to_cloudinary(temp_video_path, file_name)
        video.file_url = cloudinary_data["secure_url"]
        video.cloudinary_public_id = cloudinary_data["public_id"]
        video.save()

        job.progress = 50
        job.save()

        # 5. Generar 3 shorts
        shorts_data = generate_shorts(temp_video_path, video)

        job.progress = 80
        job.save()

        # 6. Guardar shorts en DB
        for short_info in shorts_data:
            Short.objects.create(
                video=video,
                file_url=short_info["file_url"],
                cloudinary_public_id=short_info["public_id"],
                cover_url=short_info["cover_url"],
                start_second=short_info["start"],
                end_second=short_info["end"],
                status="ready",
            )

        # 7. Completar
        video.status = "ready"
        video.generated_shorts_count = len(shorts_data)
        video.save()

        job.status = "completed"
        job.progress = 100
        job.finished_at = timezone.now()
        job.save()

        logger.info(f"✅ Video {video_id} procesado exitosamente")

    except Exception as e:
        logger.error(f"❌ Error procesando video {video_id}: {str(e)}")
        if "video" in locals():
            video.status = "failed"
            video.save()
        if "job" in locals():
            job.status = "failed"
            job.error_message = str(e)[:200]
            job.finished_at = timezone.now()
            job.save()


def get_video_metadata(video_path):
    """Extrae metadata con FFprobe"""
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
        "duration": int(float(data["format"].get("duration", 0))),
    }


def upload_to_cloudinary(file_path, file_name, folder="videos/original"):
    """Sube archivo a Cloudinary"""
    result = cloudinary.uploader.upload(
        file_path,
        resource_type="video",
        folder=folder,
        public_id=f"video_{timezone.now().timestamp()}",
        eager_async=False,
    )
    return {
        "secure_url": result["secure_url"],
        "public_id": result["public_id"],
    }


def generate_shorts(video_path, video):
    """Genera exactamente 3 shorts en formato vertical"""
    shorts_data = []
    total = video.duration_seconds

    # 3 segmentos fijos: inicio, medio, final
    segments = [
        (0, int(total * 0.3)),
        (int(total * 0.35), int(total * 0.65)),
        (int(total * 0.7), total - 1),
    ]

    for i, (start, end) in enumerate(segments, 1):
        with tempfile.NamedTemporaryFile(
            suffix=".mp4", delete=False
        ) as temp_short, tempfile.NamedTemporaryFile(
            suffix=".mp4", delete=False
        ) as temp_vertical, tempfile.NamedTemporaryFile(
            suffix=".jpg", delete=False
        ) as temp_cover:

            try:
                # Recortar segmento
                subprocess.run(
                    [
                        "ffmpeg",
                        "-i",
                        video_path,
                        "-ss",
                        str(start),
                        "-to",
                        str(end),
                        "-c",
                        "copy",
                        "-avoid_negative_ts",
                        "1",  # CORREGIDO
                        "-y",
                        temp_short.name,
                    ],
                    check=True,
                    capture_output=True,
                )

                # Convertir a vertical 1080x1920
                subprocess.run(
                    [
                        "ffmpeg",
                        "-i",
                        temp_short.name,
                        "-vf",
                        "crop=ih*9/16:ih,scale=1080:1920",
                        "-c:a",
                        "copy",
                        "-y",
                        temp_vertical.name,
                    ],
                    check=True,
                    capture_output=True,
                )

                # Generar thumbnail
                mid_frame = (start + end) // 2
                subprocess.run(
                    [
                        "ffmpeg",
                        "-i",
                        video_path,
                        "-ss",
                        str(mid_frame),
                        "-vframes",
                        "1",
                        "-vf",
                        "scale=1080:1920",
                        "-y",
                        temp_cover.name,
                    ],
                    check=True,
                    capture_output=True,
                )

                # Subir short
                short_result = cloudinary.uploader.upload(
                    temp_vertical.name,
                    resource_type="video",
                    folder="videos/shorts",
                    public_id=f"{video.cloudinary_public_id}_short_{i}",
                )

                # Subir cover
                cover_result = cloudinary.uploader.upload(
                    temp_cover.name,
                    folder="videos/covers",
                    public_id=f"{video.cloudinary_public_id}_cover_{i}",
                )

                shorts_data.append(
                    {
                        "file_url": short_result["secure_url"],
                        "public_id": short_result["public_id"],
                        "cover_url": cover_result["secure_url"],
                        "start": start,
                        "end": end,
                    }
                )

            finally:
                for f in [temp_short.name, temp_vertical.name, temp_cover.name]:
                    if os.path.exists(f):
                        os.unlink(f)

    return shorts_data
