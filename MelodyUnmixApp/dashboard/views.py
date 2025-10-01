from django.shortcuts import render
from audios.models import ProcesamientoAudio, PistaSeparada, LogProcesamiento
from users.models import Usuario
from utils.mongo import get_collection
import os
from django.conf import settings

def dashboard_view(request):
    # ---------------------
    # Datos desde Postgres
    # ---------------------
    postgres_audios = ProcesamientoAudio.objects.all().order_by("-fecha_procesamiento")
    postgres_pistas = PistaSeparada.objects.all().order_by("-fecha_creacion")
    postgres_usuarios = Usuario.objects.all().order_by("-fecha_registro")
    postgres_logs = LogProcesamiento.objects.all().order_by("-fecha")[:50]

    # ---------------------
    # Datos desde MongoDB
    # ---------------------
    mongo_pistas = []
    try:
        cursor = get_collection("audios_subidos").find().sort("fecha", -1)
        for doc in cursor:
            for pista in doc.get("pistas_separadas", []):
                pista["_id"] = str(doc["_id"])
                mongo_pistas.append(pista)
    except Exception as e:
        print("Error al obtener Pistas en Mongo:", e)

    mongo_logs = []
    try:
        col = get_collection("logs")
        for doc in col.find().sort("timestamp", -1).limit(50):
            doc["_id"] = str(doc["_id"])
            mongo_logs.append(doc)
    except Exception as e:
        print("Error al obtener logs en Mongo:", e)

    # ---------------------
    # Logs del archivo spleeter.log
    # ---------------------
    log_path = os.path.join(settings.BASE_DIR, "spleeter.log")
    file_logs = []
    if os.path.exists(log_path):
        with open(log_path, "r") as f:
            file_logs = f.readlines()[-50:]

    # ---------------------
    # Contexto separado por pestañas
    # ---------------------
    context = {
        # Postgres
        "postgres": {
            "audios": postgres_audios,
            "pistas": postgres_pistas,
            "usuarios": postgres_usuarios,
            "logs": postgres_logs,
        },
        # MongoDB
        "mongo": {
            "pistas": mongo_pistas,
            "logs": mongo_logs,
        },
        # Logs archivo
        "file_logs": file_logs,
    }

    return render(request, "dashboard/dashboard.html", context)
