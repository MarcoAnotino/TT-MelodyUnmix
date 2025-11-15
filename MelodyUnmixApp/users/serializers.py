# MelodyUnmixApp/users/serializers.py
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.core.validators import EmailValidator
from rest_framework.validators import UniqueValidator
from django.contrib.auth import authenticate


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            EmailValidator(message="Formato de correo inválido."),
            UniqueValidator(queryset=User.objects.all(), message="Este correo ya está registrado."),
        ]
    )
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    rol = serializers.ChoiceField(
        choices=User.Roles.choices, 
        default=User.Roles.USER,
        write_only = True,
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",   
            "last_name",    
            "password",
            "password2",
            "rol",
            "fecha_registro",
            "is_active",
        )
        read_only_fields = ("fecha_registro", "is_active")
        extra_kwargs = {
            "email": {"required": True, "allow_blank": False},
            "username": {"required": True, "allow_blank": False},
            "first_name": {"required": True, "allow_blank": False},
            "last_name": {"required": True, "allow_blank": False},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("password2", None)
        user = User(**validated_data)
        user.set_password(password)  # Argon2
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",  
            "last_name",   
            #"rol",
            "fecha_registro",
            "is_active",
            "avatar",       
            "avatar_url",
        )
        read_only_fields = ("fecha_registro", "is_active", "avatar_url")

    def update(self, instance, validated_data):
        request = self.context.get("request")

        # Si viene clear_avatar=1 y no se mandó un nuevo avatar → borrar archivo
        if request and request.data.get("clear_avatar") == "1":
            if instance.avatar:
                instance.avatar.delete(save=False)
            instance.avatar = None

        # Si viene un nuevo avatar en validated_data, se asigna normalmente
        return super().update(instance, validated_data)

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        # Si tu modelo Usuario YA tiene campo avatar:
        if getattr(obj, "avatar", None) and hasattr(obj.avatar, "url"):
            url = obj.avatar.url
            return request.build_absolute_uri(url) if request else url
        return None

    def validate_avatar(self, value):
        """
        Asegura que el archivo sea realmente una imagen y no pese más de 2 MB.
        """
        if not value:
            return value

        # Tipo MIME
        content_type = getattr(value, "content_type", "")
        if not content_type.startswith("image/"):
            raise serializers.ValidationError("Solo se permiten archivos de imagen.")

        # Tamaño (2 MB)
        max_size = 2 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("La imagen no debe exceder 2 MB.")

        return value

class UserPublicSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = tuple(f for f in UserSerializer.Meta.fields if f != "is_active")  # opcional

class UserAdminSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ("rol",)
        

class DeleteAccountSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    phrase = serializers.CharField(write_only=True)

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
          raise serializers.ValidationError("Usuario no autenticado.")

        pwd1 = attrs.get("current_password")
        pwd2 = attrs.get("confirm_password")
        phrase = (attrs.get("phrase") or "").strip().lower()

        if pwd1 != pwd2:
            raise serializers.ValidationError(
                {"confirm_password": "Las contraseñas no coinciden."}
            )

        # Verificar contraseña real del usuario
        if not user.check_password(pwd1):
            raise serializers.ValidationError(
                {"current_password": "La contraseña no es correcta."}
            )

        # Verificar la frase exacta
        if phrase != "eliminar cuenta":
            raise serializers.ValidationError(
                {"phrase": "Debes escribir exactamente: eliminar cuenta"}
            )

        return attrs