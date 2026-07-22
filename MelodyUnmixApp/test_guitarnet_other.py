"""
🧪 Prueba Individual - GuitarNet con stem "Other" + Validador Gate

Este script prueba el flujo completo:
1) Validador decide si aplicar GuitarNet sobre other.wav
2) Si NO aplica: copia other.wav -> guitar.wav y crea others.wav en silencio
3) Si SÍ aplica: corre GuitarNet normal para separar guitarra/resto

Uso:
    python test_guitarnet_other.py
"""

import os
import sys
import shutil
from pathlib import Path
import torch
import torchaudio

# Agregar el directorio actual al path
sys.path.insert(0, str(Path(__file__).parent))

from models.guitarnet_inference import GuitarSeparator
from models.validator_gate import should_apply_model


def test_guitarnet_with_other():
    # ========= RUTAS (AJUSTA AQUÍ) =========
    other_wav = Path("/Users/marcoanotino/Desktop/Prueba nueva/other.wav")

    model_path = Path("models/guitarnet_model.pth")

    # Validador entrenado (npz)
    validator_npz = Path("models/validator_guitar.npz")  # <-- pon aquí tu .npz real

    output_dir = Path("test_guitarnet_output")

    # Gate params
    validator_max_seconds = 30.0   # analiza 30s de other.wav
    force_apply = False           # True para forzar GuitarNet sí o sí

    chunk_duration = 30  # chunks para GuitarNet (si aplica)
    sr = 44100

    print("=" * 70)
    print("🧪 PRUEBA INDIVIDUAL - GuitarNet + Validador")
    print("=" * 70)

    # Verificar archivos
    if not other_wav.exists():
        print(f"❌ No se encontró: {other_wav.absolute()}")
        return False

    if not model_path.exists():
        print(f"❌ No se encontró el modelo: {model_path.absolute()}")
        return False

    if not validator_npz.exists():
        print(f"❌ No se encontró el validador: {validator_npz.absolute()}")
        return False

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"✅ Entrada (Demucs other): {other_wav}")
    print(f"✅ Modelo GuitarNet: {model_path}")
    print(f"✅ Validador: {validator_npz}")
    print(f"📁 Salida: {output_dir.absolute()}")
    print()

    try:
        # -------------------------------------------------
        # 1) VALIDADOR: decidir si aplicar GuitarNet
        # -------------------------------------------------
        apply_model, score, thr, feats = should_apply_model(
            others_audio_path=str(other_wav),
            validator_npz=str(validator_npz),
            sr=sr,
            max_seconds=validator_max_seconds
        )

        print(f"[VALIDADOR] score={score:.3f} thr={thr:.3f} => apply_model={apply_model}")

        if force_apply:
            print("[VALIDADOR] force_apply=True: se aplicará GuitarNet sí o sí.")
            apply_model = True

        guitar_path = output_dir / "guitar.wav"
        others_path = output_dir / "others.wav"

        if not apply_model:
            # -------------------------------------------------
            # 2) SKIP GuitarNet: other.wav ya es “guitarra suficiente”
            # -------------------------------------------------
            print("[VALIDADOR] Skip GuitarNet: copiando other.wav -> guitar.wav")
            shutil.copyfile(str(other_wav), str(guitar_path))

            # residual vacío
            wav, file_sr = torchaudio.load(str(other_wav))
            zeros = torch.zeros_like(wav)
            torchaudio.save(str(others_path), zeros, file_sr)

            print(f"✅ Listo: {guitar_path.name} (copiado) | {others_path.name} (silencio)")
            return True

        # -------------------------------------------------
        # 3) APLICAR GuitarNet normal
        # -------------------------------------------------
        print("\n🔧 Inicializando GuitarSeparator...")
        separator = GuitarSeparator(str(model_path))

        print("\n🎸 Ejecutando separación de guitarra (GuitarNet)...")
        g_path, o_path = separator.separate(
            str(other_wav),
            str(output_dir),
            chunk_duration=chunk_duration
        )

        # Verificar resultados
        print("\n" + "=" * 70)
        print("📊 RESULTADOS")
        print("=" * 70)

        if Path(g_path).exists():
            guitar_size = os.path.getsize(g_path) / (1024 * 1024)
            print(f"✅ guitar.wav creado ({guitar_size:.2f} MB)")
        else:
            print("❌ guitar.wav NO fue creado")
            return False

        if Path(o_path).exists():
            others_size = os.path.getsize(o_path) / (1024 * 1024)
            print(f"✅ others.wav creado ({others_size:.2f} MB)")
        else:
            print("❌ others.wav NO fue creado")
            return False

        print("\n🎉 ¡PRUEBA EXITOSA!")
        print(f"   Archivos en: {output_dir.absolute()}")
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    ok = test_guitarnet_with_other()
    sys.exit(0 if ok else 1)
