
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connections
from django.conf import settings

# Importamos vistas de simplejwt
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # login (access + refresh)
    TokenRefreshView,      # renovar access con refresh
    TokenVerifyView        # verificar validez de un token
)

def api_home(request):
    return JsonResponse({
        "message": "Welcome to the MelodyUnmix API",
        "status": "ok"
    })

def health_check(request):
    health_status = {
        "status": "ok",
        "database": "unknown",
        "mongo": "unknown",
    }

    # Verificar conexión a PostgreSQL
    try:
        connections['default'].cursor()
        health_status["database"] = "ok"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"

    # Verificar conexión a MongoDB
    try:
        mongo_db = settings.MONGO_CLIENT[settings.MONGO_DB]
        mongo_db.command("ping")  # comando mínimo
        health_status["mongo"] = "ok"
    except Exception as e:
        health_status["mongo"] = f"error: {str(e)}"

    return JsonResponse(health_status)


urlpatterns = [
    # Ping inicial de la API
    path("api/", api_home, name="api_home"),
    path("api/health/", health_check, name="health_check"),
    # Admin
    path("admin/", admin.site.urls),

    # API REST
    path("api/users/", include("users.urls", namespace="users")),
    path("api/audios/", include("audios.urls")),

    # Dashboard (decide si es panel HTML o también API)
    path("dashboard/", include("dashboard.urls")),

    # Endpoints de autenticación con JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

]
