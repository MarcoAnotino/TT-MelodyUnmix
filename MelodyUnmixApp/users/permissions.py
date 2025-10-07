from rest_framework import permissions

class IsAdminUserCustom(permissions.BasePermission):
    """
    Permite acceso total solo a usuarios con rol ADMIN
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'ADMIN'


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permite acceso al propietario del recurso o a un ADMIN
    """
    def has_object_permission(self, request, view, obj):
        if request.user.rol == 'ADMIN':
            return True
        return obj == request.user  # Solo puede acceder a su propio recurso
