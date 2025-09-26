import os
from datetime import datetime
from django.conf import settings
import django

# Configurar Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "MelodyUnmixApp.settings")
django.setup()

from MelodyUnmixApp.processing.services import process_audio
from MelodyUnmixApp.audios.models import ProcesamientoAudio

# -----------------------------
# 1. Crear un registro de prueba
# -----------------------------
# Cambia esta ruta a un mp3 de prueba que tengas
ruta_audio_prueba = os.path.join(settings.BASE_DIR, "media", "allohademo.mp3")

# Crear un audio de prueba en Postgres si no existe
audio_prueba, created = ProcesamientoAudio.objects.get_or_create(
    nombre_audio="allohademo.mp3",
    defaults={"ruta_almacenamiento_in": ruta_audio_prueba}
)

print(f"{'Creado' if created else 'Encontrado'} audio de prueba con ID {audio_prueba.id}")

# -----------------------------
# 2. Ejecutar Spleeter
# -----------------------------
try:
    pistas = process_audio(audio_prueba.id, stems=2)
    print(f"Se generaron {len(pistas)} pistas:")
    for p in pistas:
        print(f"- {p.nombre}: {p.archivo}")
except Exception as e:
    print("Error al procesar el audio:", e)

# -----------------------------
# 3. Verificar MongoDB
# -----------------------------
from MelodyUnmixApp.processing.services import get_mongo_collection
mongo_collection = get_mongo_collection()
for doc in mongo_collection.find({"audio_id": audio_prueba.id}):
    print("MongoDB:", doc)
