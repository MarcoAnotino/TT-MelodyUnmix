from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import guardar_audio, agregar_pista, obtener_audio


class AudioUploadView(APIView):
    def post(self, request):
        data = request.data
        audio_id = guardar_audio(
            usuario_id=request.user.id,
            nombre_archivo=data.get("nombre_archivo"),
            url_archivo=data.get("url_archivo"),
            duracion=data.get("duracion"),
            modelo_ia="Spleeter-v2",
        )
        return Response({"audio_id": audio_id}, status=201)


class AgregarPistaView(APIView):
    def post(self, request, audio_id):
        data = request.data
        updated = agregar_pista(
            audio_id=audio_id,
            instrumento=data.get("instrumento"),
            url_archivo=data.get("url_archivo"),
            formato=data.get("formato"),
            tamano_mb=data.get("tamano_mb"),
        )
        return Response({"updated": updated})


class ObtenerAudioView(APIView):
    def get(self, request, audio_id):
        audio = obtener_audio(audio_id)
        if audio:
            return Response(audio, status=200)
        return Response({"error": "Audio no encontrado"}, status=status.HTTP_404_NOT_FOUND)
