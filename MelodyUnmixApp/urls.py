"""
URL configuration for MelodyUnmixApp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.urls import path, include
from django.http import JsonResponse

# Importamos vistas de simplejwt
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # login (access + refresh)
    TokenRefreshView,      # renovar access con refresh
    TokenVerifyView        # verificar validez de un token
)

def api_home(request):
    data = {
        "message": "Welcome to the MelodyUnmix API",
        "status": "success"
    }
    return JsonResponse(data)

urlpatterns = [
    path("admin/", admin.site.urls),

    #Ruta de bienvenida
    path('api/', api_home),

    # Endpoints de autenticación con JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # Endpoints de tu app users (ejemplo: registro, perfil, etc.)
    path("api/users/", include("MelodyUnmixApp.users.urls")),

    path("dashboard/", include("MelodyUnmixApp.dashboard.urls")),

]
