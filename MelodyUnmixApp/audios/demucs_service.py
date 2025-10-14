import subprocess
import os
import sys
from logs.services import write_log  # 👈 para guardar logs en Mongo

def ejecutar_demucs(nombre_archivo, usuario=None):
    """
    Llama al contenedor Docker de Demucs y muestra progreso en tiempo real.
    También guarda el log completo en 'demucs_logs.txt' y en MongoDB.
    """
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    input_dir = os.path.join(base_path, "input_audio")
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

    # 🔹 Ejecuta el proceso de Docker
    proceso = subprocess.Popen(
        comando,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    log_path = os.path.join(base_path, "logs", "demucs_logs.txt")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)

    # Escribir encabezado del log
    write_log(event="Inicio de separación", user=usuario, extra={"archivo": nombre_archivo})
    with open(log_path, "a") as log:
        log.write(f"\n\n===== Procesando {nombre_archivo} =====\n")

        for linea in iter(proceso.stdout.readline, ''):
            sys.stdout.write(linea)
            sys.stdout.flush()

            log.write(linea)
            log.flush()

            # Cada línea se guarda también como entrada simple en Mongo
            write_log(event="Demucs progreso", user=usuario, extra={"line": linea.strip()})

    proceso.wait()

    if proceso.returncode != 0:
        write_log(event="Error en separación", user=usuario, extra={"archivo": nombre_archivo})
        raise Exception("❌ Error al ejecutar Demucs (ver logs arriba o en Mongo)")

    print("✅ Demucs completado.")
    write_log(event="Separación completada", user=usuario, extra={"archivo": nombre_archivo})
    return os.path.join(output_dir, "mdx_extra_q", os.path.splitext(nombre_archivo)[0])
