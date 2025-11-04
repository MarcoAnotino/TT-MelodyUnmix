from django.urls import path
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,   # login
    TokenRefreshView,      # refrescar token
    TokenVerifyView,        # verificar validez
    TokenBlacklistView
)
from .views import RegisterView, UserDetailView, UserListView
from .auth_email import EmailTokenObtainPairView  


app_name = "users"

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),

    # login por username (igual que antes, se usa si quieres)
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),

    # login por email (nuevo)
    path("auth/login-email/", EmailTokenObtainPairView.as_view(), name="login_email"),

    path("auth/logout/", TokenBlacklistView.as_view(), name="logout"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/verify/", TokenVerifyView.as_view(), name="token_verify"),

    path("me/", UserDetailView.as_view(), name="me"),
    path("", UserListView.as_view(), name="user-list"),
]