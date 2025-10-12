from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

class RolePermissionMiddleware(MiddlewareMixin):
    """
    Middleware de control de acceso por rol:
    - Admin: acceso total
    - Usuario: acceso limitado a sus recursos
    """

    def process_view(self, request, view_func, view_args, view_kwargs):
        # Solo aplica si el usuario está autenticado
        if not request.user.is_authenticated:
            return None  # Deja que los permisos de DRF manejen el resto

        user = request.user

        # Acceso completo para ADMIN
        if getattr(user, "rol", None) == 'ADMIN':
            return None

        # Para usuarios normales: restringir acceso a ciertas rutas
        if getattr(user, "rol", None) == 'USER':
            restricted_paths = ['/admin', '/api/users']
            if any(request.path.startswith(path) for path in restricted_paths):
                return JsonResponse({'detail': 'Acceso denegado para usuario normal.'}, status=403)

        return None
