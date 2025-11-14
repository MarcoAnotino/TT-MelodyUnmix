# users/views_password_reset.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .serializers_password_reset import (
    PasswordResetRequestSerializer,
    PasswordResetVerifySerializer,
    PasswordResetConfirmSerializer
)
from .utils_password_reset import generate_human_code, send_reset_email

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = PasswordResetRequestSerializer(
            data=request.data,
            context={"generate_code": generate_human_code, "send_email": send_reset_email},
        )
        ser.is_valid(raise_exception=True)
        data = ser.save()
        # Anti-enumeración: siempre 200 con mensaje genérico si quieres
        return Response(
            {
                "found": bool(data.get("found")),
                "status": data.get("status", "sent"),
                "message": "Si el correo existe, te enviamos un código de verificación."
            },
            status=status.HTTP_200_OK
        )


class PasswordResetVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = PasswordResetVerifySerializer(data=request.data)
        if not ser.is_valid():
            # Incrementa intentos en fallos
            email = request.data.get("email", "").strip().lower()
            code = str(request.data.get("code", "")).strip().upper()
            from .models import PasswordResetCode
            rec = (PasswordResetCode.objects
                   .filter(email__iexact=email, code__iexact=code, used_at__isnull=True)
                   .order_by("-created_at")
                   .first())
            if rec:
                rec.attempts += 1
                rec.save(update_fields=["attempts"])
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        data = ser.save()
        if not data.get("ok"):
            # respuesta genérica
            return Response({"detail": "Código inválido."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"uid": data["uid"], "token": data["token"]}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = PasswordResetConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.save()
        return Response({"ok": True, "message": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)
