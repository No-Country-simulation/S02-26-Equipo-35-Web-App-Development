from audio_processor import AudioProcessor

print("Iniciando")

temp_video_path = "/home/ghost/Downloads/Esta IA Es Un PELIGRO.mp4"

audio = AudioProcessor()
clips_data = audio.process_video(temp_video_path)
print(clips_data)
print("finalizado")
