from django.shortcuts import render
from MelodyUnmixApp.audios.models import ProcesamientoAudio, PistaSeparada
from MelodyUnmixApp.utils.mongo import get_collection
import os
from django.conf import settings

def dashboard_view(request):
    # ---------------------
    # Datos desde Postgres
    # ---------------------
    audios = ProcesamientoAudio.objects.all().order_by("-fecha_procesamiento")
    pistas = PistaSeparada.objects.all().order_by("-fecha_creacion")

    # ---------------------
    # Datos desde MongoDB
    # ---------------------

    # Pistas de MongoDB
    mongo_pistas = []
    try:
        cursor = get_collection("Pistas_Separadas").find().sort("fecha_creacion", -1)
        for doc in cursor:
            pista_safe = dict(doc)
            pista_safe["id"] = str(pista_safe.pop("_id"))
            mongo_pistas.append(pista_safe)
    except Exception as e:
        print("Error al obtener Pistas_Separadas:", e)

    # Usuarios de MongoDB
    mongo_usuarios = []
    try:
        cursor = get_collection("Usuarios").find()
        for doc in cursor:
            usuario_safe = dict(doc)
            usuario_safe["id"] = str(usuario_safe.pop("_id"))
            mongo_usuarios.append(usuario_safe)
    except Exception as e:
        print("Error al obtener Usuarios:", e)

    # Logs de MongoDB
    mongo_logs = []
    try:
        cursor = get_collection("logs").find().sort("timestamp", -1).limit(50)
        for doc in cursor:
            log_safe = dict(doc)
            log_safe["id"] = str(log_safe.pop("_id"))
            mongo_logs.append(log_safe)
    except Exception as e:
        print("Error al obtener logs:", e)

    # ---------------------
    # Logs del archivo spleeter.log
    # ---------------------
    log_path = os.path.join(settings.BASE_DIR, "spleeter.log")
    file_logs = []
    if os.path.exists(log_path):
        with open(log_path, "r") as f:
            file_logs = f.readlines()[-50:]

    # ---------------------
    # Contexto para el template
    # ---------------------
    context = {
        "audios": audios,
        "pistas": pistas,
        "mongo_pistas": mongo_pistas,
        "mongo_usuarios": mongo_usuarios,
        "mongo_logs": mongo_logs,
        "file_logs": file_logs,
    }

    return render(request, "dashboard/dashboard.html", context)
