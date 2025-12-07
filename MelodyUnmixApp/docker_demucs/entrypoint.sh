#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Debes indicar el nombre del archivo (por ejemplo: cancion.mp3)"
  exit 1
fi

INPUT_FILE="/input/$1"

if [ ! -f "$INPUT_FILE" ]; then
  echo "No se encontró el archivo $INPUT_FILE"
  exit 1
fi

echo "Procesando $INPUT_FILE con Demucs (mdx_extra_q)..."
demucs -n mdx_extra_q -o /output "$INPUT_FILE"
echo "Separación completada. Archivos disponibles en /output/mdx_extra_q/"