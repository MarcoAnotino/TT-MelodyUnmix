from django.contrib.auth.models import AbstractUser
from django.db import models

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

    def __str__(self):
        return self.username

