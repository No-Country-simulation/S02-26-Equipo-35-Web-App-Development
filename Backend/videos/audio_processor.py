import whisper
from google import genai
import os
import logging
import json
import tempfile
import subprocess

logger = logging.getLogger(__name__)


whisper_model = whisper.load_model("base")


class AudioProcessor:
    """
    Pipeline profesional de análisis de video:
    1. Transcribe directamente desde el video con Whisper
    2. Usa timestamps reales de segmentos
    3. Analiza con Gemini para detectar clips relevantes
    """

    def __init__(self):

        self.api_key = os.getenv("API_KEY_GEMINI")

        if not self.api_key:
            raise ValueError("API_KEY_GEMINI no configurada")

        self.client = genai.Client(api_key=self.api_key)

        self.whisper_model = whisper_model

        logger.info("AudioProcessor configurado correctamente")

    def extract_audio(self, video_path):
        """
        Extrae audio en formato WAV mono 16k para acelerar Whisper
        """
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            command = [
                "ffmpeg",
                "-i",
                video_path,
                "-vn",
                "-acodec",
                "pcm_s16le",
                "-ar",
                "16000",
                "-ac",
                "1",
                "-y",
                temp_audio.name,
            ]

            subprocess.run(command, check=True)

            return temp_audio.name

    def transcribe_video(self, video_path):
        """
        Transcribe directamente el video y devuelve segmentos con timestamps
        """

        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video no encontrado: {video_path}")

        logger.info("Transcribiendo video con Whisper")
        logger.info(f"✅ Paso 1")

        # Whisper ya no decodifica video. Solo procesa WAV mono 16k.
        audio_path = self.extract_audio(video_path)

        try:
            result = self.whisper_model.transcribe(
                audio_path, task="transcribe", verbose=False, fp16=False
            )
        finally:
            if os.path.exists(audio_path):
                os.unlink(audio_path)

        segments = result.get("segments", [])

        if not segments:
            raise ValueError("No se detectó audio o texto en el video")
        logger.info(f"✅ Paso 2")
        formatted_segments = [
            {
                "start": round(seg["start"], 2),
                "end": round(seg["end"], 2),
                "text": seg["text"].strip(),
            }
            for seg in segments
            if seg["text"].strip()
        ]

        logger.info(f"Transcripción completada con {len(formatted_segments)} segmentos")
        logger.info(f"✅ Paso 3")
        return formatted_segments

    def analyze_segments_with_gemini(self, segments):
        """
        Usa Gemini para identificar clips interesantes usando timestamps reales
        """

        logger.info("Analizando segmentos con Gemini")

        segments_text = "\n".join(
            f"[{s['start']} - {s['end']}] {s['text']}" for s in segments
        )

        prompt = f"""
Analiza los siguientes segmentos de un video con marcas de tiempo.
Selecciona los fragmentos más interesantes para crear clips cortos virales.
Devuelve SOLO 3 JSON válido en este formato:

[
  {{
    "start": 12.5,
    "end": 35.2,
    "reason": "explicación breve"
  }}
]

Si no hay clips relevantes, devuelve:

{{ "error": "No se encontraron clips relevantes" }}

Segmentos:

{segments_text}

Y solo debes devolver lo que te pido nada mas, ningun punto extra ni un entendido.
"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        response_text = response.text.strip()

        try:
            response_text = (
                response_text.strip()
                .removeprefix("```json")
                .removesuffix("```")
                .strip()
            )
            # print("=====================================================")
            # print(response_text)
            # print("=====================================================")
            clips = json.loads(response_text)
            return clips
        except json.JSONDecodeError:
            logger.error("Gemini devolvió JSON inválido")
            return {"error": "Respuesta inválida de Gemini", "raw": response_text}

    def process_video(self, video_path):
        """
        Devuelve segmentos listos.
        Si no hay suficientes segmentos, devuelve None
        y el fallback lo maneja services.py
        """

        try:
            segments = self.transcribe_video(video_path)

            if len(segments) < 5:
                logger.warning("⚠️ Muy pocos segmentos detectados")
                return None

            return self.analyze_segments_with_gemini(segments)

        except Exception as e:
            logger.error(f"Error procesando video: {str(e)}")
            return None
