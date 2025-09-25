from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    # Hereda username, email, password y más
    # Puedes agregar campos adicionales si quieres
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
