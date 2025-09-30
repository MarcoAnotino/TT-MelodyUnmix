from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()


class AudioNegativeTests(APITestCase):
    def setUp(self):
        # Crear usuario y loguearlo
        self.user = User.objects.create_user(
            username="negativetester",
            email="negativetester@example.com",
            password="SuperPass123!"
        )

        login_url = reverse("users:login")
        response = self.client.post(login_url, {
            "username": "negativetester",
            "password": "SuperPass123!"
        }, format="json")

        self.assertEqual(response.status_code, 200)
        access = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    def test_get_invalid_audio_from_mongo(self):
        # Usamos un ObjectId inválido
        invalid_id = "000000000000000000000000"
        url_mongo = reverse("get-audio-mongo", args=[invalid_id])

        response = self.client.get(url_mongo)
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.data)

    def test_get_invalid_audio_from_postgres(self):
        # Usamos un ID de Postgres que no existe
        invalid_id = 9999
        url_pg = reverse("get-audio-pg", args=[invalid_id])

        response = self.client.get(url_pg)
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.data)

    def test_add_pista_to_invalid_postgres_id(self):
        # Intentar agregar pista a un audio de Postgres inexistente
        invalid_id = 9999
        url_add_pista = reverse("add-pista", args=[invalid_id])

        pista_data = {
            "audio_id_mongo": "000000000000000000000000",  # id inválido también
            "instrumento": "bateria",
            "url_archivo": "https://mi-servidor.com/files/bateria.mp3",
            "formato": "mp3",
            "tamano_mb": 2.5,
            "duracion": 45
        }
        response = self.client.post(url_add_pista, pista_data, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.data)
