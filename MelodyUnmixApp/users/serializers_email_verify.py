# MelodyUnmixApp/users/serializers_email_verify.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import EmailValidator

User = get_user_model()


class EmailVerificationRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitar el envío (o reenvío) de un código de verificación.
    """
    email = serializers.EmailField(
        required=True,
        validators=[EmailValidator(message="Formato de correo inválido.")]
    )

    def validate_email(self, value):
        """
        Verifica que el email exista en el sistema y que el usuario no esté ya activo.
        """
        email = value.lower().strip()
        try:
            user = User.objects.get(email=email)
            if user.is_active:
                raise serializers.ValidationError(
                    "Este email ya ha sido verificado. Puedes iniciar sesión normalmente."
                )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No existe una cuenta con este email. Regístrate primero."
            )
        return email


class EmailVerificationCodeSerializer(serializers.Serializer):
    """
    Serializer para verificar un código de verificación de email.
    """
    email = serializers.EmailField(
        required=True,
        validators=[EmailValidator(message="Formato de correo inválido.")]
    )
    code = serializers.CharField(
        required=True,
        min_length=6,
        max_length=32,
        help_text="Código de verificación de 6 caracteres (formato: X-Y-Z-A-B-C)"
    )

    def validate_email(self, value):
        """
        Verifica que el email exista en el sistema.
        """
        email = value.lower().strip()
        try:
            user = User.objects.get(email=email)
            if user.is_active:
                raise serializers.ValidationError(
                    "Este email ya ha sido verificado."
                )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No existe una cuenta con este email."
            )
        return email

    def validate_code(self, value):
        """
        Formatea el código: elimina espacios y convierte a mayúsculas.
        """
        return value.strip().upper()
