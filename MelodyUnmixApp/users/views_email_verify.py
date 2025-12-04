# MelodyUnmixApp/users/views_email_verify.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model

from .serializers_email_verify import (
    EmailVerificationRequestSerializer,
    EmailVerificationCodeSerializer,
)
from .utils_email_verify import send_verification_email, verify_code

User = get_user_model()


class EmailVerificationSendView(APIView):
    """
    Envía (o reenvía) un código de verificación de email.
    POST: { "email": "usuario@example.com" }
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = EmailVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        # Obtener el usuario
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "No existe una cuenta con este email."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Enviar código de verificación
        code = send_verification_email(email, user.first_name)

        if code:
            return Response(
                {
                    "detail": "Código de verificación enviado correctamente.",
                    "email": email,
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"detail": "Error al enviar el código. Inténtalo de nuevo."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EmailVerificationVerifyView(APIView):
    """
    Verifica un código de verificación de email y activa la cuenta del usuario.
    POST: { "email": "usuario@example.com", "code": "X-Y-Z-A-B-C" }
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = EmailVerificationCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]

        # Verificar el código
        success, message = verify_code(email, code)

        if not success:
            return Response(
                {"detail": message},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Activar la cuenta del usuario
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=['is_active'])

                # Enviar email de bienvenida DESPUÉS de verificar el email
                from .email_utils import send_templated_email
                from django.conf import settings
                try:
                    send_templated_email(
                        subject="Tu cuenta en Melody Unmix está lista",
                        to_email=user.email,
                        template_base="emails/account_welcome",
                        context={
                            "first_name": user.first_name or user.username,
                            "login_url": settings.FRONTEND_URL + "/signin",
                        },
                    )
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).warning(
                        f"Error al enviar correo de bienvenida a {email}: {e}"
                    )

            return Response(
                {
                    "detail": "Email verificado correctamente. Ya puedes iniciar sesión.",
                    "email": email,
                },
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "No existe una cuenta con este email."},
                status=status.HTTP_404_NOT_FOUND
            )
