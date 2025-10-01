# Tests de Autenticación (users/tests)

Este directorio contiene las pruebas unitarias y de integración relacionadas con el flujo de autenticación en la app **users** de MelodyUnmix.

---

## 📌 Archivos de pruebas

### 1. `test_auth.py`
- **Objetivo:** validar el flujo completo de autenticación.
- **Casos cubiertos:**
  - Registro de usuario (`/auth/register/`)
  - Login y obtención de tokens (`/auth/login/`)
  - Acceso a información del usuario autenticado (`/me/`)
  - Logout con invalidación del refresh token (`/auth/logout/`)
  - Intento de refrescar token tras logout → debe fallar (`401 Unauthorized`)

---

### 2. `test_token_expiry.py`
- **Objetivo:** comprobar que un **access token expira correctamente**.
- **Casos cubiertos:**
  - Generar un access token con lifetime de 1 segundo.
  - Usarlo inmediatamente → funciona (`200 OK`).
  - Usarlo tras 3 segundos → expira (`401 Unauthorized`).

---

### 3. `test_token_refresh.py`
- **Objetivo:** comprobar el **flujo correcto de refresh token**.
- **Casos cubiertos:**
  - Login inicial para obtener `access` y `refresh`.
  - Uso de `refresh` en `/auth/refresh/` para obtener un **nuevo access token**.
  - Validación de que el nuevo `access` funciona en `/me/`.

---

## ▶️ Cómo ejecutar los tests

Desde la raíz del proyecto (donde está `manage.py`):

```bash
python manage.py test users
