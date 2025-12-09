"""
🧪 Prueba Individual - GuitarNet con stem "Other"

Este script realiza una prueba individual de guitarnet_inference.py
tomando el stem "other.wav" del procesamiento previo de Demucs.

Uso:
    python test_guitarnet_other.py
"""

import os
import sys
from pathlib import Path

# Agregar el directorio actual al path
sys.path.insert(0, str(Path(__file__).parent))

from models.guitarnet_inference import GuitarSeparator

def test_guitarnet_with_other():
    """
    Prueba individual de GuitarNet usando el stem "other"
    """
    # Rutas
    other_wav = Path("output_audio/user_1/audio_1/mdx_extra_q/That's What You Get/other.wav")
    model_path = Path("models/guitarnet_model.pth")
    output_dir = Path("test_guitarnet_output")
    
    print("=" * 70)
    print("🧪 PRUEBA INDIVIDUAL - GuitarNet Inference")
    print("=" * 70)
    
    # Verificar archivos
    if not other_wav.exists():
        print(f"❌ Error: No se encontró el archivo other.wav en:")
        print(f"   {other_wav.absolute()}")
        return False
    
    if not model_path.exists():
        print(f"❌ Error: No se encontró el modelo en:")
        print(f"   {model_path.absolute()}")
        return False
    
    print(f"✅ Archivo de entrada: {other_wav}")
    print(f"✅ Modelo: {model_path}")
    print(f"📁 Directorio de salida: {output_dir}")
    print()
    
    try:
        # Inicializar el separador
        print("🔧 Inicializando GuitarSeparator...")
        separator = GuitarSeparator(str(model_path))
        
        # Ejecutar separación
        print("\n🎸 Ejecutando separación de guitarra...")
        guitar_path, others_path = separator.separate(
            str(other_wav),
            str(output_dir),
            chunk_duration=30
        )
        
        # Verificar resultados
        print("\n" + "=" * 70)
        print("📊 RESULTADOS DE LA PRUEBA")
        print("=" * 70)
        
        if guitar_path.exists():
            guitar_size = os.path.getsize(guitar_path) / (1024 * 1024)  # MB
            print(f"✅ guitar.wav creado exitosamente ({guitar_size:.2f} MB)")
        else:
            print("❌ guitar.wav NO fue creado")
            return False
        
        if others_path.exists():
            others_size = os.path.getsize(others_path) / (1024 * 1024)  # MB
            print(f"✅ others.wav creado exitosamente ({others_size:.2f} MB)")
        else:
            print("❌ others.wav NO fue creado")
            return False
        
        print()
        print("🎉 ¡PRUEBA EXITOSA!")
        print(f"   Los archivos están en: {output_dir.absolute()}")
        print()
        print("📝 Próximos pasos:")
        print("   1. Escucha guitar.wav - debe contener las guitarras del 'other' stem")
        print("   2. Escucha others.wav - debe contener el resto (synths, FX, etc)")
        print("   3. Verifica que no hay artefactos audibles")
        print("   4. Verifica la preservación estéreo")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR DURANTE LA PRUEBA: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_guitarnet_with_other()
    sys.exit(0 if success else 1)
