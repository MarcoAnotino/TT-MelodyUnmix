from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator

class Usuario(AbstractUser):
    # Hereda username, email, password y más
    # Puedes agregar campos adicionales si quieres

    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        USER = 'USER', 'Usuario normal'

    rol = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.USER,
    )
    fecha_registro = models.DateTimeField(auto_now_add=True)

    email = models.EmailField(unique=True)

    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
    )

    def __str__(self):
        return self.username


class PasswordResetCode(models.Model):
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=32, db_index=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveIntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=["email", "code"]),
            models.Index(fields=["created_at"]),
        ]

    def is_used(self):
        return self.used_at is not None

    def mark_used(self):
        self.used_at = timezone.now()
        self.save(update_fields=["used_at"])

    def age_seconds(self):
        return (timezone.now() - self.created_at).total_seconds()


class EmailVerificationCode(models.Model):
    """
    Almacena códigos de verificación de email para nuevos registros.
    Similar a PasswordResetCode pero para verificar emails.
    """
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=32, db_index=True)  # formato: X-Y-Z-A-B-C
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveIntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=["email", "code"]),
            models.Index(fields=["created_at"]),
        ]

    def is_used(self):
        return self.used_at is not None

    def mark_used(self):
        self.used_at = timezone.now()
        self.save(update_fields=["used_at"])

    def age_seconds(self):
        return (timezone.now() - self.created_at).total_seconds()
