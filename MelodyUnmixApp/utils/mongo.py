from django.conf import settings
from pymongo import MongoClient

def get_collection(collection_name: str):
    client = MongoClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB]
    return db[collection_name]
