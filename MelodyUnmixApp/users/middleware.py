from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class RolePermissionMiddleware(MiddlewareMixin):
    """
    Middleware de control de acceso por rol:
    - ADMIN: acceso total
    - USER: acceso limitado a sus propios recursos
    """

    def process_view(self, request, view_func, view_args, view_kwargs):
        # Solo aplica si el usuario está autenticado
        if not request.user.is_authenticated:
            return None  # Deja que los permisos DRF manejen la autenticación

        user = request.user
        path = request.path.lower()

        # ADMIN tiene acceso completo
        if getattr(user, "rol", None) == "ADMIN":
            return None

        # Si es usuario normal
        if getattr(user, "rol", None) == "USER":
            # Definimos los prefijos de rutas restringidas
            restricted_paths = ["/admin", "/api/users"]

            # Excepción: permitir "/api/users/me/"
            if path.endswith("/me/"):
                return None

            # Bloquear si coincide con ruta restringida
            if any(path.startswith(p) for p in restricted_paths):
                return JsonResponse(
                    {"detail": "Acceso denegado para usuario normal."},
                    status=403
                )

        # Si no coincide con nada, deja continuar
        return None
