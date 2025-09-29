from pymongo import MongoClient
from django.conf import settings
from datetime import datetime
from bson import ObjectId


# Configuración Mongo
MONGO_URI = getattr(settings, "MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB = getattr(settings, "MONGO_DB", "melody_unmix")
MONGO_COLLECTION = "audios_subidos"

def get_collection():
    """Devuelve la colección de audios_subidos"""
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    return db[MONGO_COLLECTION]

def guardar_audio(usuario_id, nombre_archivo, url_archivo, duracion, modelo_ia, pistas=[]):
    """
    Inserta un documento de audio con sus pistas embebidas
    """
    doc = {
        "usuario_id": str(usuario_id),
        "nombre_archivo": nombre_archivo,
        "url_archivo": url_archivo,
        "fecha": datetime.utcnow(),
        "duracion": duracion,
        "estado_proc": "procesando",
        "modelo_ia": modelo_ia,
        "pistas_separadas": pistas  # lista de dicts
    }
    collection = get_collection()
    result = collection.insert_one(doc)
    return str(result.inserted_id)

def agregar_pista(audio_id, instrumento, url_archivo, formato, tamano_mb):
    """
    Agrega una pista embebida a un audio existente
    """
    pista = {
        "instrumento": instrumento,
        "url_archivo": url_archivo,
        "fecha": datetime.utcnow(),
        "formato": formato,
        "tamano_mb": tamano_mb
    }
    collection = get_collection()
    result = collection.update_one(
        {"_id": audio_id},
        {"$push": {"pistas_separadas": pista}}
    )
    return result.modified_count

def obtener_audio(audio_id):
    """
    Devuelve un audio con sus pistas embebidas
    """
    collection = get_collection()
    doc = collection.find_one({"_id": ObjectId(audio_id)})
    if doc:
        # Convertimos _id a string para que sea JSON serializable
        doc["_id"] = str(doc["_id"])
        return doc
    return None
