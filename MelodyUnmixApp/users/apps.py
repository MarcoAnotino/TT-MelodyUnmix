from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        """
        Importa las señales cuando la app está lista.
        Esto registra automáticamente los receivers.
        """
        import users.signals  # noqa: F401
