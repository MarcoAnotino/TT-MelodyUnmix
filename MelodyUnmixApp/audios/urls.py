# MelodyUnmixApp/audios/urls.py
from django.urls import path
from .views import (
    AudioUploadView, AgregarPistaView, ObtenerAudioMongoView, ObtenerAudioPostgresView,
    AudioStatusView, DownloadStemView, MyUploadsView, DeleteAudioView
)

urlpatterns = [
    path("upload/", AudioUploadView.as_view(), name="upload-audio"),
    path("pg/<int:audio_id>/add-pista/", AgregarPistaView.as_view(), name="add-pista"),
    path("mongo/<str:audio_id>/", ObtenerAudioMongoView.as_view(), name="get-audio-mongo"),
    path("pg/<int:audio_id>/",   ObtenerAudioPostgresView.as_view(), name="get-audio-pg"),

    # nuevos:
    path("<int:audio_id>/status",               AudioStatusView.as_view()),
    path("<int:audio_id>/download/<str:stem>",  DownloadStemView.as_view()),

    # archivos que ya se han subido 
    path("mine/", MyUploadsView.as_view(), name="my-uploads"),

    # eliminar audios
    path("<int:audio_id>/", DeleteAudioView.as_view(), name="delete-audio"),
    
]
