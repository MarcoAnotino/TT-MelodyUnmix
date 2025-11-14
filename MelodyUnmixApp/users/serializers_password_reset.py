# users/serializers_password_reset.py
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from .models import PasswordResetCode

User = get_user_model()
token_gen = PasswordResetTokenGenerator()

def _ttl_seconds():
    return getattr(settings, "PASSWORD_RESET_CODE_TTL_SEC",
                   getattr(settings, "PASSWORD_RESET_CODE_TTL_MIN", 15) * 60)

def _max_attempts():
    return getattr(settings, "PASSWORD_RESET_MAX_ATTEMPTS", 5)

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def create(self, validated_data):
        email = validated_data["email"].strip().lower()
        # ¿Existe usuario con ese email?
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            user = None

        # Siempre crea código si existe usuario; si no, responde genérico (anti-enumeración).
        if user:
            code = self.context["generate_code"]()
            rec = PasswordResetCode.objects.create(email=email, code=code)
            self.context["send_email"](email, code)
            validated_data.update(found=True, status="sent", id=rec.id)
        else:
            validated_data.update(found=False, status="unknown")
        return validated_data


class PasswordResetVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        code = attrs["code"].strip().upper()
        ttl = _ttl_seconds()

        # Busca el más reciente que no esté usado
        rec = (PasswordResetCode.objects
               .filter(email__iexact=email, code__iexact=code, used_at__isnull=True)
               .order_by("-created_at")
               .first())
        if not rec:
            raise serializers.ValidationError({"code": "Código inválido."})

        # Demasiados intentos
        if rec.attempts >= _max_attempts():
            raise serializers.ValidationError({"code": "Demasiados intentos. Solicita un nuevo código."})

        # Expirado
        if rec.age_seconds() > ttl:
            raise serializers.ValidationError({"code": "El código ha expirado. Solicita uno nuevo."})

        attrs["_record"] = rec
        return attrs

    def create(self, validated_data):
        email = validated_data["email"].strip().lower()
        rec: PasswordResetCode = validated_data["_record"]

        # Marca un intento exitoso (no incrementamos attempts aquí; lo haríamos en fallos)
        # Buscamos usuario
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Respuesta genérica
            return {"uid": None, "token": None, "ok": False}

        # Genera uidb64 + token
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_gen.make_token(user)
        # Opcional: marcar el código como usado ya en verify (o hasta confirm)
        rec.mark_used()
        return {"uid": uid, "token": token, "ok": True}


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    re_new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["re_new_password"]:
            raise serializers.ValidationError({"new_password": "Las contraseñas no coinciden."})
        # Validación de fortaleza Django
        validate_password(attrs["new_password"])
        return attrs

    def create(self, validated_data):
        uid = validated_data["uid"]
        token = validated_data["token"]
        new_password = validated_data["new_password"]

        try:
            uid_int = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_int)
        except Exception:
            raise serializers.ValidationError({"uid": "UID inválido."})

        if not token_gen.check_token(user, token):
            raise serializers.ValidationError({"token": "Token inválido o expirado."})

        user.set_password(new_password)
        user.save()
        return {"ok": True}
