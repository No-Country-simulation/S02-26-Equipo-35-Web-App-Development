import whisper
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
model = whisper.load_model("base")
genai.configure(api_key=os.getenv('API_KEY_GEMINI'))
print("API Key de Gemini configurada correctamente." , os.getenv('API_KEY_GEMINI'))
# result = model.transcribe("/home/ghost/Videos/audio.wav")
result = model.transcribe("/home/ghost/Downloads/audio.wav")

print(result["text"])

segments_text = " ".join([segment["text"] for segment in result["segments"]])

prompt = f"""Te paso un texto de los datos extraidos del audio de un video, lo que debes hacer ahora es devolver en un json, los datos de segundo de inicio y segundo donde podria finalizar un corte de un clip, si no se encuentra ningun clip que sea relevante, enviar un formato de respuesta con mensaje de error no valido en json, solo envia el json, no respondas nada mas:

Texto: {segments_text}"""

# model_gemini = genai.GenerativeModel("gemini-pro")
# model_gemini = genai.GenerativeModel("gemini-1.5-flash")
# model_gemini = genai.GenerativeModel("gemini-2.0-flash")
model_gemini = genai.GenerativeModel("gemini-2.5-flash")
response = model_gemini.generate_content(prompt)

print(response.text)
