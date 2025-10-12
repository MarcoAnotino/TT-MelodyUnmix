Requisitos previos
---
    1.-Tener Docker Desktop instalado y ejecutándose.
    2.-Tener el proyecto clonado localmente.
    3.-Estar ubicado en la carpeta raíz del proyecto Melody_Unmix.
---
Construcción de la imagen de Docker
---
    Ejecutar el siguiente comando:
    docker build -t demucs:optimized -f docker_demucs/Dockerfile .

    Este comando crea una imagen optimizada con:
        1.-Python 3.11
        2.-PyTorch y Demucs
        3.-Dependencias compiladas (diffq, audioread, soundfile)
        4.-Caché persistente para evitar descargas repetidas

💡 Solo necesitas construir la imagen una vez.
---
Estructura de carpetas
---
💡 Asegurarse de contar con las carpetas de input_audio y output_audio para una mejor estructura

Melody_Unmix/
 ├── docker_demucs/
 │    ├── Dockerfile
 │    └── entrypoint.sh
 ├── input_audio/       ← Coloca aquí los archivos .mp3 a separar
 ├── output_audio/      ← Aquí se generarán las pistas separadas
 └── ...
---
Ejecución
---
    Ejecutar el siguiente comando para separar

    docker run --rm -v "${PWD}/input_audio:/input" -v "${PWD}/output_audio:/output" -v demucs_cache:/cache demucs:optimized "cancion.mp3"

💡 El nombre de la canción va entre comillas

