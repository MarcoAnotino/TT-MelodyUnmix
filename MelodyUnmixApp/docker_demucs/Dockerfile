# =======================================================
# 🧠 DEMUCS OPTIMIZADO - MODELO mdx_extra_q (CPU)
# =======================================================
FROM python:3.11-slim

# -------------------------------------------------------
# 1️⃣ Instalación temporal de compiladores y librerías base
# -------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg git build-essential gcc g++ python3-dev curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# -------------------------------------------------------
# 2️⃣ Instalación de dependencias de Python
# -------------------------------------------------------
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir torch torchvision torchaudio && \
    pip install --no-cache-dir demucs audioread soundfile diffq

# -------------------------------------------------------
# 3️⃣ Limpieza de compiladores (reduce el tamaño final)
# -------------------------------------------------------
RUN apt-get remove -y build-essential gcc g++ python3-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* ~/.cache/pip

# -------------------------------------------------------
# 4️⃣ Configuración del entorno
# -------------------------------------------------------
# Crea directorios de trabajo y define la caché del modelo
RUN mkdir -p /input /output /cache
ENV DEMUCS_CACHE=/cache
WORKDIR /app

# Copia el script de entrada y lo hace ejecutable
COPY docker_demucs/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Comando por defecto
ENTRYPOINT ["entrypoint.sh"]