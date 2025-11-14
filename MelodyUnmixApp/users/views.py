from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, UserAdminSerializer, UserPublicSerializer
from .permissions import IsAdminUserCustom, IsOwnerOrAdmin
from .email_utils import send_templated_email
from django.conf import settings


User = get_user_model()

# Registro abierto a todos
class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()

        try:
            send_templated_email(
                subject="Tu cuenta en Melody Unmix está lista",
                to_email=user.email,
                template_base="emails/account_welcome",
                context={
                    "first_name": user.first_name or user.username,
                    "login_url": settings.FRONTEND_URL + "/login",
                },
            )
        except Exception as e:
            from django.contrib.auth import get_user_model
            import logging
            logging.getLogger(__name__).exception(f"Error al enviar el correo de bienvenida: %s", e)

# Perfil del usuario autenticado (solo dueño o admin)
class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_serializer_class(self):
        u = self.request.user
        return UserAdminSerializer if getattr(u, "rol", None) == "ADMIN" else UserPublicSerializer
    def get_object(self):
        return self.request.user

# Listado de todos los usuarios (solo admin)
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserCustom]