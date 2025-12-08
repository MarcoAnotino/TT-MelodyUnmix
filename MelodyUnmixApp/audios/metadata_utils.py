"""
Utilidades para extraer metadatos de archivos de audio.
"""
import os
from mutagen import File


def extraer_metadatos(ruta_archivo):
    """
    Extrae metadatos de un archivo de audio (MP3, WAV, etc.)
    
    Args:
        ruta_archivo (str): Ruta completa al archivo de audio
        
    Returns:
        dict: Diccionario con keys: 'title', 'artist', 'album'
              Usa fallbacks seguros si no existen metadatos
    """
    resultado = {
        "title": None,
        "artist": None,
        "album": None,
    }
    
    if not ruta_archivo or not os.path.exists(ruta_archivo):
        return resultado
    
    try:
        # Mutagen auto-detecta el formato
        audio = File(ruta_archivo, easy=True)
        
        if audio is None:
            # Archivo no soportado o corrupto
            return resultado
        
        # Extraer campos comunes
        # Mutagen devuelve listas, tomamos el primer elemento
        resultado["title"] = _get_first(audio.get("title"))
        resultado["artist"] = _get_first(audio.get("artist"))
        resultado["album"] = _get_first(audio.get("album"))
        
        # Fallback: si no hay title, usar el nombre del archivo sin extensión
        if not resultado["title"]:
            nombre_base = os.path.basename(ruta_archivo)
            resultado["title"] = os.path.splitext(nombre_base)[0]
        
    except Exception as e:
        # Log del error pero no romper el flujo
        print(f"⚠️ Error extrayendo metadatos de {ruta_archivo}: {e}")
        # Fallback: usar nombre de archivo
        nombre_base = os.path.basename(ruta_archivo)
        resultado["title"] = os.path.splitext(nombre_base)[0]
    
    return resultado


def _get_first(value):
    """Helper para obtener el primer elemento de una lista o None"""
    if isinstance(value, list) and len(value) > 0:
        return str(value[0]).strip()
    elif value:
        return str(value).strip()
    return None
