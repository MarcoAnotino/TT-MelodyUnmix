"""
Django settings for MelodyUnmixApp project.
"""

from pathlib import Path
from decouple import config
from datetime import timedelta
import sys
import pymongo

# =========================
# Paths
# =========================
BASE_DIR = Path(__file__).resolve().parent.parent

# =========================
# Core / Security
# =========================
SECRET_KEY = config("DJ_SECRET_KEY", default="CHANGE_ME_DEV_ONLY")
DEBUG = config("DEBUG", default=True, cast=bool)

# ALLOWED_HOSTS desde .env: "localhost,127.0.0.1,api.midu.com"
ALLOWED_HOSTS = [h.strip() for h in config("ALLOWED_HOSTS", default="").split(",") if h.strip()]
FRONTEND_URL = config("FRONTEND_BASE_URL", default="http://localhost:3000")

# =========================
# Installed Apps
# =========================
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 3rd party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",

    # Apps propias
    "users",
    "audios",
    "processing",
    "dashboard",
    "logs",
]

# =========================
# Password Hashers (preferir Argon2)
# =========================
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.ScryptPasswordHasher",
]

# =========================
# REST Framework + JWT
# =========================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    # Throttling básico (ajusta según tus necesidades)
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": config("THROTTLE_ANON", default="20/min"),
        "user": config("THROTTLE_USER", default="60/min"),
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# =========================
# Middleware
# =========================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "users.middleware.RolePermissionMiddleware",
]

# =========================
# CORS / CSRF
# =========================
CORS_ALLOW_ALL_ORIGINS = config("CORS_ALLOW_ALL_ORIGINS", default=True, cast=bool)
CORS_ALLOW_CREDENTIALS = True # Permite cookies cross-origin

# Si necesitas lista en vez de ALL:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "https://tu-frontend.com",
# ]

CSRF_TRUSTED_ORIGINS = [
    *[
        o.strip()
        for o in config("CSRF_TRUSTED_ORIGINS", default="", cast=str).split(",")
        if o.strip()
    ]
]

# =========================
# URLs / WSGI
# =========================
ROOT_URLCONF = "MelodyUnmixApp.urls"
WSGI_APPLICATION = "MelodyUnmixApp.wsgi.application"

# =========================
# Templates
# =========================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  # ajusta si usas plantillas
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# =========================
# Database (PostgreSQL por .env)
# =========================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("POSTGRES_DB"),
        "USER": config("POSTGRES_USER"),
        "PASSWORD": config("POSTGRES_PASSWORD"),
        "HOST": config("POSTGRES_HOST"),
        "PORT": config("POSTGRES_PORT", cast=int),
    }
}

# Tests: usar SQLite in-memory para velocidad
if "test" in sys.argv:
    DATABASES = {
        "default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}
    }

# =========================
# MongoDB (uso manual, no ORM)
# =========================
MONGO_URI = config("MONGO_URI", default="")
MONGO_DB = config("MONGO_DB", default="")
MONGO_CLIENT = pymongo.MongoClient(MONGO_URI) if MONGO_URI else None

# =========================
# Archivos estáticos / media
# =========================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# =========================
# Validadores de contraseña
# =========================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},  # refuerzo mínimo
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# =========================
# Usuario custom
# =========================
AUTH_USER_MODEL = "users.Usuario"

# =========================
# i18n / TZ
# =========================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/Mexico_City"
USE_I18N = True
USE_TZ = True

# =========================
# Auto field
# =========================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =========================
# Email (Gmail con App Password)
# =========================
# En dev puedes usar consola para inspeccionar el contenido:
# EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
# En este settings permitimos consola si DEBUG=True, SMTP si DEBUG=False. Cambia si prefieres siempre SMTP.
USE_SMTP = config("USE_SMTP", default=False, cast=bool)

EMAIL_BACKEND = (
    "django.core.mail.backends.smtp.EmailBackend"
    if USE_SMTP
    else "django.core.mail.backends.console.EmailBackend"
)


DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="no-reply@melodyunmix.com")

EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")         # tu correo Gmail
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="") # App Password (16 dígitos)

# =========================
# Password Reset (códigos)
# =========================
PASSWORD_RESET_CODE_TTL_MIN = config("PASSWORD_RESET_CODE_TTL_MIN", default=15, cast=int)
PASSWORD_RESET_MAX_ATTEMPTS = config("PASSWORD_RESET_MAX_ATTEMPTS", default=5, cast=int)

# =========================
# Seguridad recomendada en PROD
# =========================
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SAMESITE = "Lax"
