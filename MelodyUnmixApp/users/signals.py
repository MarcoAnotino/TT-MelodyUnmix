# users/signals.py
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import Usuario
import os
import logging

logger = logging.getLogger(__name__)


@receiver(post_delete, sender=Usuario)
def delete_avatar_on_user_delete(sender, instance, **kwargs):
    """
    Elimina el archivo de avatar del sistema de archivos cuando se elimina el usuario.
    Se ejecuta automáticamente después de user.delete()
    """
    if instance.avatar and instance.avatar.name:
        try:
            if os.path.isfile(instance.avatar.path):
                os.remove(instance.avatar.path)
                logger.info(f"Avatar eliminado: {instance.avatar.path}")
        except Exception as e:
            logger.warning(f"No se pudo eliminar el avatar de {instance.username}: {e}")


@receiver(pre_save, sender=Usuario)
def delete_old_avatar_on_change(sender, instance, **kwargs):
    """
    Elimina el avatar anterior cuando se actualiza a uno nuevo.
    Evita acumulación de archivos huérfanos.
    """
    if not instance.pk:
        # Usuario nuevo, no hay avatar anterior
        return

    try:
        old_user = Usuario.objects.get(pk=instance.pk)
    except Usuario.DoesNotExist:
        return

    # Si había un avatar anterior y ahora es diferente, eliminar el anterior
    old_avatar = old_user.avatar
    new_avatar = instance.avatar

    if old_avatar and old_avatar != new_avatar:
        try:
            if os.path.isfile(old_avatar.path):
                os.remove(old_avatar.path)
                logger.info(f"Avatar anterior eliminado: {old_avatar.path}")
        except Exception as e:
            logger.warning(f"No se pudo eliminar avatar anterior: {e}")
