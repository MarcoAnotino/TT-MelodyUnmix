from django.urls import path
from .views import AudioUploadView, AgregarPistaView, ObtenerAudioView

urlpatterns = [
    path("upload/", AudioUploadView.as_view(), name="upload-audio"),
    path("<str:audio_id>/add-pista/", AgregarPistaView.as_view(), name="add-pista"),
    path("<str:audio_id>/", ObtenerAudioView.as_view(), name="get-audio"),  # 👈 nuevo endpoint
]
