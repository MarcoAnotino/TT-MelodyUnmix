from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()


class RolePermissionTests(APITestCase):
    def setUp(self):
        # Crear usuarios con roles distintos
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="SuperPass123!",
            rol="ADMIN"
        )
        self.normal_user = User.objects.create_user(
            username="juan",
            email="juan@example.com",
            password="SuperPass123!",
            rol="USER"
        )

        # URLs
        self.login_url = reverse("users:login")
        self.user_list_url = reverse("users:user-list")
        self.me_url = reverse("users:me")

    def login_and_get_token(self, username, password):
        res = self.client.post(self.login_url, {"username": username, "password": password}, format="json")
        return res.data["access"]

    def test_admin_can_view_user_list(self):
        token = self.login_and_get_token("admin", "SuperPass123!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.get(self.user_list_url)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.data) >= 1)

    def test_user_cannot_view_user_list(self):
        token = self.login_and_get_token("juan", "SuperPass123!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.get(self.user_list_url)
        self.assertEqual(res.status_code, 403)

    def test_user_can_view_own_profile(self):
        token = self.login_and_get_token("juan", "SuperPass123!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["username"], "juan")

    def test_admin_can_view_own_profile(self):
        token = self.login_and_get_token("admin", "SuperPass123!")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["username"], "admin")
