import os
import logging
import json
import tempfile
import subprocess
import requests
import time
from google import genai

logger = logging.getLogger(__name__)


class AudioProcessor:
    """
    Pipeline:
    1️⃣ Extrae audio WAV mono 16k
    2️⃣ Envía audio a SpeechFlow API
    3️⃣ Espera resultado (polling)
    4️⃣ Recibe texto con timestamps
    5️⃣ Analiza con Gemini
    """

    SPEECHFLOW_CREATE_URL = "https://api.speechflow.io/asr/file/v1/create"
    SPEECHFLOW_QUERY_URL = "https://api.speechflow.io/asr/file/v1/query"

    def __init__(self):
        self.gemini_api_key = os.getenv("API_KEY_GEMINI")
        self.speechflow_key_id = os.getenv("SPEECHFLOW_KEY_ID")
        self.speechflow_key_secret = os.getenv("SPEECHFLOW_KEY_SECRET")

        if not self.gemini_api_key:
            raise ValueError("API_KEY_GEMINI no configurada")
        if not self.speechflow_key_id:
            raise ValueError("SPEECHFLOW_KEY_ID no configurada")
        if not self.speechflow_key_secret:
            raise ValueError("SPEECHFLOW_KEY_SECRET no configurada")

        self.client = genai.Client(api_key=self.gemini_api_key)

        logger.info("✅ AudioProcessor inicializado correctamente")

    # =========================================================
    # EXTRAER AUDIO
    # =========================================================
    def extract_audio(self, video_path):
        logger.info("🎧 Extrayendo audio del video...")

        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_audio:
            command = [
                "ffmpeg",
                "-i",
                video_path,
                "-vn",
                "-acodec",
                "libmp3lame",
                "-ar",
                "16000",
                "-ac",
                "1",
                "-b:a",
                "64k",
                "-y",
                temp_audio.name,
            ]

            result = subprocess.run(
                command,
                check=True,
                text=True,
                capture_output=True,
            )

            if result.stderr:
                logger.error(result.stderr)

        logger.info(f"✅ Audio extraído en {temp_audio.name}")
        return temp_audio.name

    # =========================================================
    # ESPERAR RESULTADO SPEECHFLOW
    # =========================================================
    def wait_for_result(self, task_id, headers, max_attempts=100, interval=3):
        logger.info(f"⏳ Esperando resultado SpeechFlow (task_id={task_id})")

        query_url = f"{self.SPEECHFLOW_QUERY_URL}?taskId={task_id}&resultType=1"

        for attempt in range(1, max_attempts + 1):
            logger.info(f"🔎 Consultando estado... intento {attempt}/{max_attempts}")

            response = requests.get(query_url, headers=headers, timeout=120)

            if response.status_code != 200:
                logger.warning(f"⚠️ Error consultando estado: {response.text}")
                time.sleep(interval)
                continue

            try:
                data = response.json()
                logger.info(f"📥 Code recibido: {data.get('code')}")
            except ValueError:
                logger.error("Respuesta no es JSON válido")
                return None

            code = int(data.get("code", 0))

            logger.info(f"📊 Code actual: {code}")

            # ✅ Transcripción lista
            if code == 11000:
                logger.info("✅ Transcripción lista")
                return data

            # ⏳ Aún procesando
            elif code == 11001:
                logger.info("⏳ SpeechFlow aún procesando...")
                time.sleep(interval)
                continue

            # ❌ Error real
            else:
                logger.error(f"❌ SpeechFlow error: {data}")
                raise Exception(data.get("msg", "Error desconocido"))

        raise TimeoutError("SpeechFlow tardó demasiado en procesar el audio")

    # =========================================================
    # TRANSCRIPCIÓN CON SPEECHFLOW
    # =========================================================
    def transcribe_with_speechflow(self, audio_path, lang="es"):
        logger.info("🚀 Enviando audio a SpeechFlow...")

        headers = {
            "keyId": self.speechflow_key_id,
            "keySecret": self.speechflow_key_secret,
        }
        create_url = f"{self.SPEECHFLOW_CREATE_URL}?lang={lang}"

        logger.info(f"📤 Subiendo archivo: {audio_path}")
        file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
        logger.info(f"📦 Tamaño archivo a subir: {file_size_mb:.2f} MB")

        with open(audio_path, "rb") as f:
            files = {"file": f}

            response = requests.post(
                create_url,
                headers=headers,
                files=files,
                timeout=300,  # 👈 timeout simple, no tuple
            )

        logger.info(f"📥 Status code create: {response.status_code}")
        logger.info(f"📥 Response create: {response.text}")

        if response.status_code != 200:
            logger.error(f" ❌ Error creando tarea en SpeechFlow: {response.text}")
            raise Exception(f"Error HTTP SpeechFlow: {response.status_code}")

        create_result = response.json()

        if create_result.get("code") != 10000:
            raise Exception(f"SpeechFlow error: {create_result.get('msg')}")

        task_id = create_result.get("taskId")

        if not task_id:
            raise ValueError("No se recibió taskId de SpeechFlow")

        logger.info(f"🆔 Task creada correctamente: {task_id}")

        # 🔥 Esperar resultado real
        result_data = self.wait_for_result(task_id, headers)
        if not result_data:
            raise ValueError("SpeechFlow no devolvió resultado válido")

        logger.info(f"📦 Resultado completo SpeechFlow: {result_data}")

        segments = []
        result_payload = result_data.get("data", {})
        if "segments" not in result_payload:
            raise ValueError(f"Estructura inesperada: {result_payload}")

        raw_segments = result_payload.get("segments", [])

        for item in raw_segments:
            try:
                segments.append(
                    {
                        "start": round(item.get("start", 0), 2),
                        "end": round(item.get("end", 0), 2),
                        "text": item.get("text", "").strip(),
                    }
                )
            except Exception as e:
                logger.error(f"Error parseando segmento: {e}")

        if not raw_segments:
            logger.error(f"⚠️ Respuesta sin segmentos: {result_data}")
            raise ValueError("SpeechFlow no devolvió segmentos")

        logger.info(f"✅ {len(segments)} segmentos obtenidos")

        return segments

    # =========================================================
    # ANALISIS GEMINI
    # =========================================================
    def analyze_segments_with_gemini(self, segments):
        logger.info("🤖 Analizando segmentos con Gemini...")

        segments_text = "\n".join(
            f"[{s['start']} - {s['end']}] {s['text']}" for s in segments
        )

        prompt = f"""
Analiza los siguientes segmentos de un video con marcas de tiempo.
Selecciona los 3 fragmentos más interesantes para crear clips virales.
Cada clip debe durar entre 15 y 60 segundos.
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

        text = getattr(response, "text", "") or ""
        text = text.replace("```json", "").replace("```", "").strip()

        try:
            clips = json.loads(text)
            logger.info("✅ Gemini devolvió clips válidos")
            return clips
        except json.JSONDecodeError:
            logger.error(f"❌ Gemini devolvió JSON inválido: {text}")
            return None

    # =========================================================
    # PROCESO COMPLETO
    # =========================================================
    def process_video(self, video_path):
        logger.info("🎬 Iniciando procesamiento completo del video")

        try:
            audio_path = self.extract_audio(video_path)

            try:
                file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
                MAX_AUDIO_SIZE_MB = 50  # límite recomendado para SpeechFlow

                logger.info(f"📦 Tamaño del audio extraído: {file_size_mb:.2f} MB")

                if file_size_mb > MAX_AUDIO_SIZE_MB:
                    logger.warning(
                        f"⚠️ Audio demasiado grande para SpeechFlow: "
                        f"{file_size_mb:.2f}MB > {MAX_AUDIO_SIZE_MB}MB"
                    )
                    return None

                segments = self.transcribe_with_speechflow(audio_path)

            finally:
                # 🔥 Limpieza SIEMPRE aquí, sin duplicar
                if audio_path and os.path.exists(audio_path):
                    os.unlink(audio_path)
                    logger.info("🗑️ Archivo de audio temporal eliminado")

            if not segments:
                logger.warning("⚠️ SpeechFlow no devolvió segmentos")
                return None

            if len(segments) < 5:
                logger.warning("⚠️ Muy pocos segmentos detectados")
                return None

            return self.analyze_segments_with_gemini(segments)

        except Exception as e:
            logger.error(f"❌ Error procesando video: {str(e)}")
            return None
