import os
import logging
import json
import tempfile
import subprocess
import requests
from google import genai

logger = logging.getLogger(__name__)


class AudioProcessor:
    """
    Pipeline nuevo:
    1️⃣ Extrae audio WAV mono 16k
    2️⃣ Envía audio a SpeechFlow API
    3️⃣ Recibe texto con timestamps
    4️⃣ Analiza con Gemini
    """

    def __init__(self):
        self.gemini_api_key = os.getenv("API_KEY_GEMINI")
        self.speechflow_api_key = os.getenv("SPEECHFLOW_API_KEY")

        if not self.gemini_api_key:
            raise ValueError("API_KEY_GEMINI no configurada")

        if not self.speechflow_api_key:
            raise ValueError("SPEECHFLOW_API_KEY no configurada")

        self.client = genai.Client(api_key=self.gemini_api_key)

        logger.info("AudioProcessor configurado con SpeechFlow")

    # =========================================================
    # EXTRAER AUDIO
    # =========================================================
    def extract_audio(self, video_path):
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

            subprocess.run(command, check=True, capture_output=True)
            return temp_audio.name

    # =========================================================
    # TRANSCRIPCIÓN CON SPEECHFLOW
    # =========================================================
    def transcribe_with_speechflow(self, audio_path):

        url = "https://api.speechflow.io/asr/file/v1"

        headers = {
            "Authorization": f"Bearer {self.speechflow_api_key}",
        }

        data = {
            "lang": "es",
        }

        with open(audio_path, "rb") as f:
            response = requests.post(
                url,
                headers=headers,
                files={"file": f},
                data=data,
                timeout=120,
            )

        if response.status_code != 200:
            logger.error(f"SpeechFlow error: {response.text}")
            raise Exception("Error en SpeechFlow API")

        result = response.json()

        segments = []

        raw_segments = result.get("segments") or result.get("result", {}).get(
            "segments", []
        )

        for item in raw_segments:
            segments.append(
                {
                    "start": round(item["start"], 2),
                    "end": round(item["end"], 2),
                    "text": item["text"].strip(),
                }
            )

        if not segments:
            raise ValueError("SpeechFlow no devolvió segmentos")

        return segments

    # =========================================================
    # ANALISIS GEMINI
    # =========================================================
    def analyze_segments_with_gemini(self, segments):

        segments_text = "\n".join(
            f"[{s['start']} - {s['end']}] {s['text']}" for s in segments
        )

        prompt = f"""
Analiza los siguientes segmentos de un video con marcas de tiempo.
Selecciona los 3 fragmentos más interesantes para crear clips virales.
Devuelve SOLO JSON válido:

[
  {{
    "start": 12.5,
    "end": 35.2
  }}
]

Segmentos:
{segments_text}
"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        text = response.text.strip()

        text = text.replace("```json", "").replace("```", "").strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            logger.error("Gemini devolvió JSON inválido")
            return None

    # =========================================================
    # PROCESO COMPLETO
    # =========================================================
    def process_video(self, video_path):

        try:
            audio_path = self.extract_audio(video_path)

            try:
                segments = self.transcribe_with_speechflow(audio_path)
            finally:
                if os.path.exists(audio_path):
                    os.unlink(audio_path)

            if len(segments) < 5:
                logger.warning("Muy pocos segmentos detectados")
                return None

            return self.analyze_segments_with_gemini(segments)

        except Exception as e:
            logger.error(f"Error procesando video: {str(e)}")
            return None
