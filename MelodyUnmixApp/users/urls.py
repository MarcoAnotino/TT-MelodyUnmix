from django.urls import path
from .views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Login personalizado
    path("login/", CustomTokenObtainPairView.as_view(), name="custom_token_obtain_pair"),

    # Refresh token
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # aquí después puedes añadir más rutas de users
    # path("profile/", ProfileView.as_view(), name="profile"),
]
