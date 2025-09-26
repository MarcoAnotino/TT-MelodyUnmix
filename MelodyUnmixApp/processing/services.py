import os
import subprocess
import logging
from datetime import datetime
from django.conf import settings
from MelodyUnmixApp.audios.models import ProcesamientoAudio, PistaSeparada
from pymongo import MongoClient

# Configuración de logs
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.FileHandler(os.path.join(settings.BASE_DIR, "spleeter.log"))
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


# --- MongoDB ---
def get_mongo_collection():
    db = settings.MONGO_DB  # ya está definido en settings.py
    return db["Pistas_Separadas"]



# --- Ejecutar Spleeter ---
def run_spleeter_separation(input_path: str, output_dir: str, stems: int = 4):
    """
    Ejecuta Spleeter en un entorno conda separado.
    Requiere que exista un environment conda llamado 'spleeter'.
    """
    cmd = [
        "conda", "run", "-n", "spleeter",
        "spleeter", "separate",
        "-i", input_path,
        "-p", f"spleeter:{stems}stems",
        "-o", output_dir
    ]
    logger.info("Ejecutando Spleeter con comando: %s", " ".join(cmd))
    subprocess.run(cmd, check=True)


# --- Procesamiento completo ---
def process_audio(audio_id: int, stems: int = 4):
    try:
        audio = ProcesamientoAudio.objects.get(id=audio_id)
        input_path = audio.ruta_almacenamiento_in  # ruta de entrada
        output_dir = os.path.join(settings.MEDIA_ROOT, "separados", str(audio_id))
        os.makedirs(output_dir, exist_ok=True)

        # Ejecutar separación
        run_spleeter_separation(input_path, output_dir, stems)

        # Guardar resultados
        mongo_collection = get_mongo_collection()
        pistas_creadas = []

        stem_folder = os.path.join(output_dir, os.path.splitext(os.path.basename(input_path))[0])
        for stem_file in os.listdir(stem_folder):
            stem_path = os.path.join(stem_folder, stem_file)

            # Guardar en Postgres
            pista_pg = PistaSeparada.objects.create(
                audio=audio,
                nombre=stem_file,
                archivo=stem_path,  # solo ruta
                fecha_creacion=datetime.now()
            )
            pistas_creadas.append(pista_pg)

            # Guardar en MongoDB
            mongo_collection.insert_one({
                "audio_id": audio.id,
                "nombre": stem_file,
                "archivo": stem_path,
                "fecha_creacion": datetime.now()
            })

        logger.info("Procesamiento completado para audio %s", audio.nombre_audio)
        return pistas_creadas

    except Exception as e:
        logger.error("Error procesando audio %s: %s", audio_id, str(e))
        raise
