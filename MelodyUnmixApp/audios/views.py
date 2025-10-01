from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import guardar_audio, agregar_pista, obtener_audio
from .models import ProcesamientoAudio, ArchivoAudio, PistaSeparada

# -----------------
# Subida de audio
# -----------------
class AudioUploadView(APIView):
    def post(self, request):
        data = request.data

        # 1. Guardar en Mongo
        audio_id_mongo = guardar_audio(
            usuario_id=request.user.id,
            nombre_archivo=data.get("nombre_archivo"),
            url_archivo=data.get("url_archivo"),
            duracion=data.get("duracion"),
            modelo_ia="Spleeter-v2",
        )

        # 2. Guardar en Postgres
        audio_pg = ProcesamientoAudio.objects.create(
            nombre_audio=data.get("nombre_archivo"),
            estado="procesando",
            formato=data.get("formato", "mp3"),
            tamano_mb=data.get("tamano_mb", 0),
            duracion=data.get("duracion"),
            ruta_almacenamiento_in=data.get("url_archivo"),
        )

        archivo = ArchivoAudio.objects.create(
            audio_in=audio_pg,
            usuario=request.user
        )

        # 3. Respuesta unificada
        return Response({
            "audio_id_mongo": audio_id_mongo,
            "audio_id_postgres": audio_pg.id,
            "archivo_id_postgres": archivo.id,
        }, status=status.HTTP_201_CREATED)


# -----------------
# Agregar pista (usa ID de Postgres para ArchivoAudio)
# -----------------
class AgregarPistaView(APIView):
    def post(self, request, audio_id):
        data = request.data

        # 1. Guardar en Mongo
        updated = agregar_pista(
            audio_id=data.get("audio_id_mongo"),  # aquí pasamos el id de Mongo
            instrumento=data.get("instrumento"),
            url_archivo=data.get("url_archivo"),
            formato=data.get("formato"),
            tamano_mb=data.get("tamano_mb"),
        )

        # 2. Guardar en Postgres
        try:
            archivo = ArchivoAudio.objects.get(audio_in__id=audio_id, usuario=request.user)
        except ArchivoAudio.DoesNotExist:
            return Response({"error": "ArchivoAudio no encontrado en Postgres"}, status=404)

        pista_pg = PistaSeparada.objects.create(
            nombre_pista=f"{archivo.audio_in.nombre_audio}_{data.get('instrumento')}",
            instrumento=data.get("instrumento"),
            tamano_mb=data.get("tamano_mb"),
            duracion=data.get("duracion", 0),
            ruta_pista_out=data.get("url_archivo"),
        )

        archivo.pistas.add(pista_pg)

        return Response({
            "mongo_updated": updated,
            "pista_id_postgres": pista_pg.id,
            "archivo_id_postgres": archivo.id,
        }, status=status.HTTP_201_CREATED)


# -----------------
# Obtener audio desde Mongo
# -----------------
class ObtenerAudioMongoView(APIView):
    def get(self, request, audio_id):
        audio_mongo = obtener_audio(audio_id)

        if audio_mongo:
            return Response({"mongo": audio_mongo}, status=200)
        return Response({"error": "Audio no encontrado en Mongo"}, status=404)


# -----------------
# Obtener audio desde Postgres
# -----------------
class ObtenerAudioPostgresView(APIView):
    def get(self, request, audio_id):
        try:
            archivo = ArchivoAudio.objects.get(audio_in__id=audio_id, usuario=request.user)
        except ArchivoAudio.DoesNotExist:
            return Response({"error": "Audio no encontrado en Postgres"}, status=404)

        audio_pg = {
            "id": archivo.audio_in.id,
            "nombre_audio": archivo.audio_in.nombre_audio,
            "estado": archivo.audio_in.estado,
            "formato": archivo.audio_in.formato,
            "tamano_mb": archivo.audio_in.tamano_mb,
            "duracion": archivo.audio_in.duracion,
            "ruta_almacenamiento_in": archivo.audio_in.ruta_almacenamiento_in,
            "fecha_procesamiento": archivo.audio_in.fecha_procesamiento,
        }

        pistas_pg = [
            {
                "id": pista.id,
                "nombre_pista": pista.nombre_pista,
                "instrumento": pista.instrumento,
                "duracion": pista.duracion,
                "tamano_mb": pista.tamano_mb,
                "ruta_pista_out": pista.ruta_pista_out,
                "fecha_creacion": pista.fecha_creacion,
            }
            for pista in archivo.pistas.all()
        ]

        return Response({
            "postgres": {
                "audio": audio_pg,
                "pistas": pistas_pg,
            }
        }, status=200)
