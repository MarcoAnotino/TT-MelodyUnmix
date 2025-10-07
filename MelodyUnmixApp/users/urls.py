from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # login
    TokenRefreshView,      # refrescar token
    TokenVerifyView        # verificar validez
)
from .views import RegisterView, UserDetailView, UserListView

app_name = "users"

urlpatterns = [
    # Registro
    path("auth/register/", RegisterView.as_view(), name="register"),

    # Login / Tokens
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # Información del usuario logueado
    path("me/", UserDetailView.as_view(), name="me"),
    path("", UserListView.as_view(), name="user-list"),  # Listado de usuarios (solo admin)
]