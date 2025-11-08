# MelodyUnmixApp/users/serializers.py
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.core.validators import EmailValidator
from rest_framework.validators import UniqueValidator


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
        )

class UserPublicSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = tuple(f for f in UserSerializer.Meta.fields if f != "is_active")  # opcional

class UserAdminSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ("rol",)