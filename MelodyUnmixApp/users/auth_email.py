from django.contrib.auth import get_user_model
from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Correo o contraseña inválidos."})

        if not user.is_active:
            raise serializers.ValidationError({"email": "Correo o contraseña inválidos."})

        if not user.check_password(password):
            raise serializers.ValidationError({"password": "Correo o contraseña inválidos."})

        attrs["user"] = user
        return attrs


class EmailTokenObtainPairView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = EmailLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        
        # Respuesta JSON con SOLO el access token y datos de usuario
        response = Response(
            {
                "access": str(refresh.access_token),
                # "refresh": str(refresh),  <-- Ya no lo enviamos en el body
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "rol": getattr(user, "rol", None),
                },
            },
            status=status.HTTP_200_OK,
        )

        # Seteamos el refresh token en cookie HTTP-Only
        from django.conf import settings
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=not settings.DEBUG,  # True en prod
            samesite='Lax',             # Ajustar si es cross-site
            max_age=7 * 24 * 60 * 60    # 7 días
        )

        return response
