# audios/demucs_service.py
import subprocess
import os
import sys
from logs.services import write_log 

def ejecutar_demucs(nombre_archivo, usuario=None, output_dir=None, check_cancelled=None):
    """
    Llama al contenedor Docker de Demucs y muestra progreso en tiempo real.
    También guarda el log completo en 'demucs_logs.txt' y en MongoDB.

    - input_dir: compartido para todos (input_audio)
    - output_dir: puede ser único por usuario/audio para no pisar resultados.
    - check_cancelled: función que devuelve True si el proceso debe abortarse.
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

    print(f"Ejecutando Demucs para: {nombre_archivo}")

    proceso = subprocess.Popen(
        comando,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    log_path = os.path.join(base_path, "logs", "demucs_logs.txt")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)

    write_log(event="Inicio de separación", user=usuario, extra={"archivo": nombre_archivo})
    try:
        with open(log_path, "a") as log:
            log.write(f"\n\n===== Procesando {nombre_archivo} =====\n")

            for linea in iter(proceso.stdout.readline, ''):
                # 🛑 CHEQUEO DE CANCELACIÓN
                if check_cancelled and check_cancelled():
                    print(f"🛑 Cancelando proceso demucs para {nombre_archivo}...")
                    proceso.terminate()
                    # Esperar un poco a que muera gracefullmente o kill
                    try:
                        proceso.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        proceso.kill()
                    
                    write_log(event="Separación cancelada", user=usuario, extra={"archivo": nombre_archivo})
                    raise Exception("CANCELLED_BY_USER")

                sys.stdout.write(linea)
                sys.stdout.flush()

                log.write(linea)
                log.flush()

                write_log(event="Demucs progreso", user=usuario, extra={"line": linea.strip()})
        
        proceso.wait()
    except Exception as e:
        # Asegurar que si explota algo (o cancelamos), el proceso muera
        if proceso.poll() is None:
            proceso.terminate()
        raise e

    if proceso.returncode != 0:
        write_log(event="Error en separación", user=usuario, extra={"archivo": nombre_archivo})
        raise Exception("Error al ejecutar Demucs (ver logs arriba o en Mongo)")

    print("Demucs completado.")
    write_log(event="Separación completada", user=usuario, extra={"archivo": nombre_archivo})

    # Demucs crea /output/mdx_extra_q/<nombre_sin_ext>/
    return os.path.join(output_dir, "mdx_extra_q", os.path.splitext(nombre_archivo)[0])
