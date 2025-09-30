from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()


class AudioTests(APITestCase):
    def setUp(self):
        # Crear usuario y loguearlo
        self.user = User.objects.create_user(
            username="testaudio",
            email="testaudio@example.com",
            password="SuperPass123!"
        )

        login_url = reverse("users:login")
        response = self.client.post(login_url, {
            "username": "testaudio",
            "password": "SuperPass123!"
        }, format="json")

        self.assertEqual(response.status_code, 200)
        access = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    def test_audio_flow(self):
        # 1. Subir audio
        upload_url = reverse("upload-audio")
        data = {
            "nombre_archivo": "CancionPrueba.mp3",
            "url_archivo": "https://mi-servidor.com/files/CancionPrueba.mp3",
            "duracion": 120,
            "formato": "mp3",
            "tamano_mb": 5.5
        }
        response = self.client.post(upload_url, data, format="json")
        self.assertEqual(response.status_code, 201)

        audio_id_mongo = response.data["audio_id_mongo"]
        audio_id_pg = response.data["audio_id_postgres"]

        # 2. Obtener desde Mongo
        url_mongo = reverse("get-audio-mongo", args=[audio_id_mongo])
        response = self.client.get(url_mongo)
        self.assertEqual(response.status_code, 200)
        self.assertIn("mongo", response.data)

        # 3. Obtener desde Postgres
        url_pg = reverse("get-audio-pg", args=[audio_id_pg])
        response = self.client.get(url_pg)
        self.assertEqual(response.status_code, 200)
        self.assertIn("postgres", response.data)

        # 4. Agregar pista
        url_add_pista = reverse("add-pista", args=[audio_id_pg])
        pista_data = {
            "audio_id_mongo": audio_id_mongo,  # 👈 importante para Mongo
            "instrumento": "guitarra",
            "url_archivo": "https://mi-servidor.com/files/guitarra.mp3",
            "formato": "mp3",
            "tamano_mb": 1.2,
            "duracion": 30
        }
        response = self.client.post(url_add_pista, pista_data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIn("pista_id_postgres", response.data)
        self.assertIn("archivo_id_postgres", response.data)
