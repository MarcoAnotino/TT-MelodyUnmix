# Tests de Audios (audios/tests)

Este directorio contiene las pruebas unitarias e integrales para el flujo de manejo de audios en la app **audios** de MelodyUnmix.

---

## 📌 Archivos de pruebas

### 1. `test_audios.py`
- **Objetivo:** validar el flujo positivo completo de audios.
- **Casos cubiertos:**
  - Subida de audio (`POST /api/audios/upload/`)
  - Obtener audio desde Mongo (`GET /api/audios/mongo/<mongo_id>/`)
  - Obtener audio desde Postgres (`GET /api/audios/pg/<pg_id>/`)
  - Agregar pista a un audio existente (`POST /api/audios/pg/<pg_id>/add-pista/`)

---

### 2. `test_audios_negativos.py`
- **Objetivo:** validar respuestas correctas en casos de error.
- **Casos cubiertos:**
  - Obtener audio desde Mongo con un **ObjectId inválido** → `404`
  - Obtener audio desde Postgres con un **ID inexistente** → `404`
  - Intentar agregar pista a un audio de Postgres inexistente → `404`

---

## ▶️ Cómo ejecutar los tests

Desde la raíz del proyecto (donde está `manage.py`):

```bash
python manage.py test audios
