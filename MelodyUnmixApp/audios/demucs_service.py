# audios/demucs_service.py
import subprocess
import os
import sys
from logs.services import write_log 

def ejecutar_demucs(nombre_archivo, usuario=None, output_dir=None):
    """
    Llama al contenedor Docker de Demucs y muestra progreso en tiempo real.
    También guarda el log completo en 'demucs_logs.txt' y en MongoDB.

    - input_dir: compartido para todos (input_audio)
    - output_dir: puede ser único por usuario/audio para no pisar resultados.
    """
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    input_dir = os.path.join(base_path, "input_audio")

    # Si no se pasa output_dir, usamos el clásico /output_audio
    if output_dir is None:
        output_dir = os.path.join(base_path, "output_audio")

    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    comando = [
        "docker", "run", "--rm",
        "-v", f"{input_dir}:/input",
        "-v", f"{output_dir}:/output",
        "-v", "demucs_cache:/cache",
        "demucs:optimized",
        nombre_archivo
    ]

    print(f"🚀 Ejecutando Demucs para: {nombre_archivo}")

    # ⚠️ Aquí forzamos UTF-8 y evitamos que falle por caracteres raros
    proceso = subprocess.Popen(
        comando,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",   # Fuerza UTF-8
        errors="replace",   # Cualquier byte raro se reemplaza, no truena
        bufsize=1,          # Line-buffered (más fluido)
    )

    log_path = os.path.join(base_path, "logs", "demucs_logs.txt")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)

    write_log(event="Inicio de separación", user=usuario, extra={"archivo": nombre_archivo})

    # También el archivo de log en UTF-8
    with open(log_path, "a", encoding="utf-8", errors="replace") as log:
        log.write(f"\n\n===== Procesando {nombre_archivo} =====\n")

        # Leer línea por línea sin rompernos por Unicode
        for linea in iter(proceso.stdout.readline, ''):
            # Por si viene con \r\n
            linea = linea.replace("\r", "")
            sys.stdout.write(linea)
            sys.stdout.flush()

            log.write(linea)
            log.flush()

            write_log(event="Demucs progreso", user=usuario, extra={"line": linea.strip()})

    # Cerramos stdout explícitamente y esperamos a que termine
    if proceso.stdout is not None:
        proceso.stdout.close()
    proceso.wait()

    if proceso.returncode != 0:
        write_log(event="Error en separación", user=usuario, extra={"archivo": nombre_archivo})
        raise Exception("❌ Error al ejecutar Demucs (ver logs arriba o en Mongo)")

    print("✅ Demucs completado.")
    write_log(event="Separación completada", user=usuario, extra={"archivo": nombre_archivo})

    # Demucs crea /output/mdx_extra_q/<nombre_sin_ext>/
    return os.path.join(output_dir, "mdx_extra_q", os.path.splitext(nombre_archivo)[0])
