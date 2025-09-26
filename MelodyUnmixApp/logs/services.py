# logs/services.py
from pymongo import MongoClient
from django.conf import settings
from datetime import datetime

# Configuración: usa settings o variables de entorno
MONGO_URI = getattr(settings, "MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB = getattr(settings, "MONGO_DB", "melody_unmix")
MONGO_COLLECTION = getattr(settings, "MONGO_LOG_COLLECTION", "logs")

def get_collection():
    """Devuelve la colección de logs en MongoDB"""
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    return db[MONGO_COLLECTION]

def write_log(event: str, user: str = None, extra: dict = None):
    """
    Inserta un log en MongoDB.
    event: descripción del evento (ej. 'Audio subido', 'Separación completada')
    user: username o id del usuario (opcional)
    extra: diccionario con datos adicionales (opcional)
    """
    doc = {
        "event": event,
        "user": user,
        "extra": extra or {},
        "timestamp": datetime.utcnow()
    }
    collection = get_collection()
    result = collection.insert_one(doc)
    return str(result.inserted_id)
