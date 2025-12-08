from django.apps import AppConfig


class AudiosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'audios'

    def ready(self):
        """Precargar modelo GuitarNet al iniciar Django"""
        import os
        # Evitar doble carga en dev con auto-reload
        if os.environ.get('RUN_MAIN') == 'true':
            try:
                from .services.guitar_service import get_guitar_separator
                get_guitar_separator()
                print("GuitarNet precargado exitosamente")
            except Exception as e:
                print(f"No se pudo precargar GuitarNet: {e}")
