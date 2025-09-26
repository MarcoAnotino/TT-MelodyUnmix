from django.conf import settings

def get_collection(collection_name: str):
    """
    Devuelve una colección de MongoDB lista para consultas.
    """
    db = settings.MONGO_DB  # Base de datos definida en settings
    return db[collection_name]
