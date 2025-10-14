from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class TokenRefreshTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="refreshuser",
            email="refresh@example.com",
            password="SuperPass123!"
        )

    def test_refresh_token_flow(self):
        # 1. Login
        url = reverse("users:login")
        response = self.client.post(url, {
            "username": "refreshuser",
            "password": "SuperPass123!"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        old_access = response.data["access"]
        refresh = response.data["refresh"]

        # 2. Usar el refresh token para obtener un nuevo access
        url = reverse("users:token_refresh")
        response = self.client.post(url, {"refresh": refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

        new_access = response.data["access"]
        self.assertNotEqual(old_access, new_access)  # el token debe ser distinto

        # 3. Usar el nuevo access en /me
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access}")
        url = reverse("users:me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "refreshuser")
