# logs/models.py
from django.db import models


class AccountDeletionLog(models.Model):
    """
    Registro de auditoría cuando un usuario elimina su cuenta.
    NO guarda contraseña ni datos sensibles, solo identificadores y metadatos.
    """
    user_id = models.IntegerField(null=True, blank=True)
    username = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)

    reason = models.CharField(
        max_length=255,
        blank=True,
        help_text="Motivo o contexto (por ahora fijo: 'user_self_delete').",
    )

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"AccountDeletionLog(user={self.username or self.email}, at={self.created_at})"
