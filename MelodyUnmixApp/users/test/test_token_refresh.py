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

    def test_refresh_token_flow_with_remember(self):
        """Test refresh flow when user selects 'Remember Me' (persistent session)"""
        # 1. Login with email + remember=True
        url = reverse("users:login_email")
        response = self.client.post(url, {
            "email": "refresh@example.com",
            "password": "SuperPass123!",
            "remember": True
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        # Refresh token should be in cookie, not in body
        self.assertNotIn("refresh", response.data)
        self.assertIn("refresh_token", response.cookies)
        
        # Cookie should have max_age set (persistent)
        cookie = response.cookies.get("refresh_token")
        self.assertIsNotNone(cookie.get("max-age"))

        old_access = response.data["access"]

        # 2. Use the refresh token (via cookie) to get a new access token
        url = reverse("users:token_refresh")
        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

        new_access = response.data["access"]
        self.assertNotEqual(old_access, new_access)  # token should be different

        # 3. Use the new access token in /me
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access}")
        url = reverse("users:me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "refreshuser")

    def test_refresh_token_flow_without_remember(self):
        """Test refresh flow when user does NOT select 'Remember Me' (session-only)"""
        # 1. Login with email + remember=False
        url = reverse("users:login_email")
        response = self.client.post(url, {
            "email": "refresh@example.com",
            "password": "SuperPass123!",
            "remember": False
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        # Refresh token should be in cookie, not in body
        self.assertIn("refresh_token", response.cookies)
        
        # Cookie should NOT have max_age set (session cookie)
        cookie = response.cookies.get("refresh_token")
        # Django sets max-age to empty string for session cookies
        max_age = cookie.get("max-age")
        self.assertTrue(max_age == "" or max_age is None or max_age == 0)

        # 2. Refresh should still work during the session
        url = reverse("users:token_refresh")
        response = self.client.post(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

