from django.urls import path
from .views import AudioUploadView, AgregarPistaView, ObtenerAudioMongoView, ObtenerAudioPostgresView

urlpatterns = [
    path("upload/", AudioUploadView.as_view(), name="upload-audio"),

    # Agregar pista (Postgres + Mongo, requiere ID de Postgres)
    path("pg/<int:audio_id>/add-pista/", AgregarPistaView.as_view(), name="add-pista"),

    # Obtener audio desde Mongo
    path("mongo/<str:audio_id>/", ObtenerAudioMongoView.as_view(), name="get-audio-mongo"),

    # Obtener audio desde Postgres
    path("pg/<int:audio_id>/", ObtenerAudioPostgresView.as_view(), name="get-audio-pg"),
]
