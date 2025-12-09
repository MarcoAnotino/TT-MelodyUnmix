from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

class CookieTokenRefreshView(TokenRefreshView):
    """
    Toma el refresh token de la cookie httpOnly en lugar del body JSON.
    Devuelve un nuevo access token.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
             return Response(
                {"detail": "No refresh token cookie found."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Inyectamos el token en los datos para que el serializer de SimpleJWT lo procese
        # SimpleJWT espera 'refresh' en el data
        data = {"refresh": refresh_token}
        
        serializer = self.get_serializer(data=data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        # Obtenemos la respuesta estándar (que trae el access token)
        token_data = serializer.validated_data
        
        # Opcional: Si rotamos refresh tokens, podríamos querer setear la nueva cookie aquí.
        # Por defecto SimpleJWT devuelve 'access' y (si rota) 'refresh'.
        
        response = Response(token_data, status=status.HTTP_200_OK)
        
        if 'refresh' in token_data:
            # Si hay un nuevo refresh token (rotación activada), actualizamos la cookie
            # Nota: No seteamos max_age para preservar el comportamiento de sesión
            # Si el login original fue con "recordarme", el navegador ya tiene la cookie persistente
            # Si fue sin "recordarme", esta cookie de sesión se borrará al cerrar el navegador
            response.set_cookie(
                key='refresh_token',
                value=token_data['refresh'],
                httponly=True,
                secure=not settings.DEBUG, # True en prod (https)
                samesite='Lax', # O 'None' si frontend y backend están en dominios distintos y usas HTTPS
                # Sin max_age: hereda comportamiento de sesión del navegador
            )
            # Lo quitamos del body para no exponerlo
            del token_data['refresh']
            response.data = token_data
            
        return response

class CookieLogoutView(APIView):
    """
    Limpia la cookie de refresh token y opcionalmente pone el token en blacklist.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        # Intentar blacklistear si está configurado
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                # Si falla (token inválido o expirado), igual queremos borrar la cookie
                pass

        response = Response({"detail": "Logout exitoso."}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response
