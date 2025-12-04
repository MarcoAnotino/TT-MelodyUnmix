import os
import shutil
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, parsers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken,
)

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserAdminSerializer,
    UserPublicSerializer,
    DeleteAccountSerializer,
)
from .permissions import IsAdminUserCustom, IsOwnerOrAdmin
from .email_utils import send_templated_email

from logs.models import AccountDeletionLog
from audios.services import get_collection
from audios.models import PistaSeparada


User = get_user_model()
logger = logging.getLogger(__name__)


# Registro abierto a todos
class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    # El correo de bienvenida se envía DESPUÉS de verificar el email
    # Ver EmailVerificationVerifyView en views_email_verify.py

# Perfil del usuario autenticado (solo dueño o admin)
class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]

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


class DeleteAccountView(APIView):
    """
    Elimina la cuenta del usuario autenticado y todos sus datos relacionados.
    Requiere:
      - current_password
      - confirm_password
      - phrase = 'eliminar cuenta'
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = DeleteAccountSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Datos importantes ANTES de borrar al usuario
        user_id = user.id
        username = user.username or (user.email or "")
        email = user.email

        # Metadatos de auditoría
        ip = (
            request.META.get("HTTP_X_FORWARDED_FOR", "")
            .split(",")[0]
            .strip()
            or request.META.get("REMOTE_ADDR")
        )
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        # 1) Borrar tokens de JWT asociados a este usuario
        tokens = OutstandingToken.objects.filter(user=user)
        BlacklistedToken.objects.filter(token__in=tokens).delete()
        tokens.delete()

        # 2) Borrar documentos de audios en Mongo para este usuario
        try:
            col = get_collection()
            col.delete_many({"usuario_id": str(user_id)})
        except Exception as e:
            logger.warning(
                "No se pudo limpiar audios de Mongo del usuario %s: %s",
                user_id,
                e,
            )

        # 3) Borrar carpeta de salida de stems: output_audio/user_<id>/
        try:
            base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
            user_output_root = os.path.join(base_path, "output_audio", f"user_{user_id}")
            if os.path.isdir(user_output_root):
                shutil.rmtree(user_output_root)
        except Exception as e:
            logger.warning(
                "No se pudo borrar la carpeta de salida del usuario %s: %s",
                user_id,
                e,
            )

        # 4) Borrar pistas separadas asociadas a este usuario en Postgres
        try:
            PistaSeparada.objects.filter(archivos__usuario=user).delete()
        except Exception as e:
            logger.warning(
                "No se pudieron borrar PistaSeparada del usuario %s: %s",
                user_id,
                e,
            )

        # 5) Crear registro de auditoría
        AccountDeletionLog.objects.create(
            user_id=user_id,
            username=username,
            email=email,
            reason="user_self_delete",
            ip_address=ip,
            user_agent=user_agent,
        )

        # 6) Enviar correo de despedida (si hay email)
        if email:
            try:
                send_templated_email(
                    subject="Tu cuenta en Melody Unmix ha sido eliminada",
                    to_email=email,
                    template_base="emails/account_deleted",
                    context={
                        "username": username or "usuario",
                        "support_email": settings.DEFAULT_FROM_EMAIL,
                    },
                )
            except Exception as e:
                logger.exception(
                    "Error al enviar correo de eliminación de cuenta para %s: %s",
                    email,
                    e,
                )

        # 7) Eliminar usuario (avatar se borra por señal post_delete;
        #    ArchivoAudio / ProcesamientoAudio por on_delete=CASCADE)
        user.delete()

        return Response(
            {"detail": "Tu cuenta ha sido eliminada correctamente."},
            status=status.HTTP_200_OK,
        )
