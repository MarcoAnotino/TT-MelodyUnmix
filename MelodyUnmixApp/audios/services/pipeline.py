"""
🎵 Audio Processing Pipeline - Orquesta Demucs + GuitarNet
Proyecto: Melody Unmix
"""
import os
import shutil
from pathlib import Path
from .demucs_service import ejecutar_demucs
from .guitar_service import separate_guitar
from logs.services import write_log


def procesar_cancion(
    nombre_archivo: str,
    output_dir: str,
    usuario: str = None,
    check_cancelled=None
) -> dict:
    """
    Pipeline completo de separación de audio.
    
    1. Ejecuta Demucs (Docker) → vocals, drums, bass, others
    2. Ejecuta GuitarNet sobre others → guitar, others_clean
    
    Args:
        nombre_archivo: Nombre del archivo en input_audio/
        output_dir: Directorio base de salida
        usuario: Username para logging
        check_cancelled: Función que retorna True si hay que cancelar
    
    Returns:
        Dict con rutas de todos los stems:
        {
            "vocals": "/path/to/vocals.wav",
            "drums": "/path/to/drums.wav", 
            "bass": "/path/to/bass.wav",
            "guitar": "/path/to/guitar.wav",
            "others": "/path/to/others.wav",  # others sin guitarra
        }
    
    Raises:
        Exception: Si Demucs falla o el proceso es cancelado
    """
    write_log(event="Pipeline iniciado", user=usuario, extra={"archivo": nombre_archivo})
    
    # =====================================================
    # 1) Ejecutar Demucs (Docker)
    # =====================================================
    ruta_demucs = ejecutar_demucs(
        nombre_archivo=nombre_archivo,
        usuario=usuario,
        output_dir=output_dir,
        check_cancelled=check_cancelled
    )
    
    # Definir rutas de stems de Demucs
    stems_paths = {
        "vocals": os.path.join(ruta_demucs, "vocals.wav"),
        "drums": os.path.join(ruta_demucs, "drums.wav"),
        "bass": os.path.join(ruta_demucs, "bass.wav"),
    }
    
    # =====================================================
    # 2) Ejecutar GuitarNet sobre others
    # =====================================================
    others_original = os.path.join(ruta_demucs, "other.wav")
    
    if not os.path.exists(others_original):
        write_log(
            event="GuitarNet omitido - other.wav no existe", 
            user=usuario, 
            extra={"archivo": nombre_archivo}
        )
        # Si no hay other.wav, devolver lo que tenemos
        stems_paths["others"] = others_original
        stems_paths["guitar"] = None
        return stems_paths
    
    # Crear directorio temporal para la separación de guitarra
    guitar_output_dir = os.path.join(output_dir, "_guitar_temp")
    os.makedirs(guitar_output_dir, exist_ok=True)
    
    try:
        write_log(
            event="GuitarNet iniciado", 
            user=usuario, 
            extra={"input": others_original}
        )
        
        # Ejecutar separación de guitarra
        guitar_path, others_clean_path = separate_guitar(
            input_others_path=others_original,
            output_dir=guitar_output_dir
        )
        
        # Mover archivos finales al directorio de Demucs
        final_guitar = os.path.join(ruta_demucs, "guitar.wav")
        final_others = os.path.join(ruta_demucs, "other.wav")  # Reemplaza el original
        
        # Copiar resultados (guitar.wav nuevo, others.wav sin guitarra)
        shutil.copy2(guitar_path, final_guitar)
        shutil.copy2(others_clean_path, final_others)
        
        stems_paths["guitar"] = final_guitar
        stems_paths["others"] = final_others
        
        write_log(
            event="GuitarNet completado", 
            user=usuario, 
            extra={"guitar": final_guitar, "others": final_others}
        )
        
    except Exception as e:
        # Si falla GuitarNet, mantener el others original
        write_log(
            event="GuitarNet error - usando others original", 
            user=usuario, 
            extra={"error": str(e)}
        )
        stems_paths["others"] = others_original
        stems_paths["guitar"] = None
        print(f"GuitarNet falló, usando others original: {e}")
    
    finally:
        # Limpiar directorio temporal
        if os.path.exists(guitar_output_dir):
            shutil.rmtree(guitar_output_dir, ignore_errors=True)
    
    write_log(
        event="Pipeline completado", 
        user=usuario, 
        extra={"archivo": nombre_archivo, "stems": list(stems_paths.keys())}
    )
    
    return stems_paths
