import time
from datetime import timedelta
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

class TokenExpiryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="expiringuser",
            email="expiring@example.com",
            password="SuperPass123!"
        )

    def test_access_token_expiry(self):
        # 1. Generar un token con lifetime de 1 segundo
        token = AccessToken.for_user(self.user)
        token.set_exp(lifetime=timedelta(seconds=1))  # <-- caduca en 1s
        access = str(token)

        # 2. Usar el token inmediatamente → debe funcionar
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        url = reverse("users:me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Esperar a que caduque
        time.sleep(3)

        # 4. Intentar usarlo después de expirar → debe fallar
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)
