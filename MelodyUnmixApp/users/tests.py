from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import Argon2PasswordHasher

User = get_user_model()

class RegisterTestCase(TestCase):
    def test_password_hash_is_argon2(self):
        user = User.objects.create_user(
            username="usuario_test",
            email="test@email.com",
            password="TestPass123!"
        )
        self.assertTrue(user.password.startswith('argon2$'))
