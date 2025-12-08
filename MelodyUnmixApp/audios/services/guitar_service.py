"""
🎸 Guitar Separation Service - Singleton para inferencia de guitarra
Proyecto: Melody Unmix
"""
import os
import sys
from pathlib import Path
from django.conf import settings

# Agregar la carpeta 'models' al path para importar guitarnet_inference
MODELS_DIR = Path(settings.BASE_DIR) / "models"
if str(MODELS_DIR) not in sys.path:
    sys.path.insert(0, str(MODELS_DIR))

from guitarnet_inference import GuitarSeparator

# =====================================================
# Singleton global para el modelo
# =====================================================
_guitar_separator = None


def get_guitar_separator():
    """
    Devuelve una instancia única de GuitarSeparator.
    El modelo se carga una sola vez al primer llamado.
    
    Returns:
        GuitarSeparator: Instancia del separador de guitarra
    """
    global _guitar_separator
    if _guitar_separator is None:
        model_path = MODELS_DIR / "guitarnet_model.pth"
        if not model_path.exists():
            raise FileNotFoundError(f"Modelo no encontrado: {model_path}")
        
        print(f"Cargando modelo GuitarNet desde: {model_path}")
        _guitar_separator = GuitarSeparator(str(model_path))
        print("GuitarNet cargado exitosamente")
    
    return _guitar_separator


def separate_guitar(input_others_path: str, output_dir: str) -> tuple:
    """
    Separa guitarra del stem 'others'.
    
    Args:
        input_others_path: Ruta al archivo others.wav de Demucs
        output_dir: Directorio donde guardar guitar.wav y others.wav
    
    Returns:
        Tuple con rutas (guitar_path, others_clean_path)
    
    Raises:
        FileNotFoundError: Si el archivo de entrada no existe
        Exception: Si hay error en la inferencia
    """
    if not os.path.exists(input_others_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_others_path}")
    
    separator = get_guitar_separator()
    guitar_path, others_path = separator.separate(input_others_path, output_dir)
    
    return str(guitar_path), str(others_path)
