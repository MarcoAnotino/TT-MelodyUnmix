from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="marcoanotino",
            email="marco@example.com",
            password="Marco&ANVR"
        )

    def test_register_login_me_logout_and_invalid_refresh(self):
        # 1. Registro
        url = reverse("users:register")
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "SuperPass123!",
            "password2": "SuperPass123!"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Login
        url = reverse("users:login")
        response = self.client.post(url, {
            "username": "testuser",
            "password": "SuperPass123!"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access = response.data["access"]
        refresh = response.data["refresh"]

        # 3. Me con token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        url = reverse("users:me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")

        # 4. Logout
        url = reverse("users:logout")
        response = self.client.post(url, {"refresh": refresh}, format="json")
        self.assertIn(response.status_code, [200, 205])

        # 5. Intentar refrescar token después de logout → debe fallar
        url = reverse("users:token_refresh")
        response = self.client.post(url, {"refresh": refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)
