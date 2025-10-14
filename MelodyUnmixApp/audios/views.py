from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import guardar_audio, agregar_pista, obtener_audio
from .models import ProcesamientoAudio, ArchivoAudio, PistaSeparada
from .demucs_service import ejecutar_demucs
import os


# -----------------
# Subida de audio
# -----------------
class AudioUploadView(APIView):
    def post(self, request):
        try:
            # 1️⃣ Obtener archivo y metadatos
            archivo_subido = request.FILES.get("archivo")
            if not archivo_subido:
                return Response({"error": "No se envió ningún archivo de audio."}, status=400)

            nombre_audio = archivo_subido.name
            formato = nombre_audio.split(".")[-1]

            # 2️⃣ Guardar físicamente el archivo en input_audio/
            base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
            input_dir = os.path.join(base_path, "input_audio")
            os.makedirs(input_dir, exist_ok=True)

            ruta_guardada = os.path.join(input_dir, nombre_audio)

            # 🔧 Guardar manualmente el archivo
            with open(ruta_guardada, "wb+") as destino:
                for chunk in archivo_subido.chunks():
                    destino.write(chunk)

            # 3️⃣ Guardar en Mongo y Postgres (inicialmente en estado "procesando")
            audio_id_mongo = guardar_audio(
                usuario_id=request.user.id,
                nombre_archivo=nombre_audio,
                url_archivo=ruta_guardada,
                duracion=request.data.get("duracion"),
                modelo_ia="Demucs-mdx_extra_q",
            )

            audio_pg = ProcesamientoAudio.objects.create(
                nombre_audio=nombre_audio,
                estado="procesando",
                formato=formato,
                tamano_mb=request.data.get("tamano_mb", 0),
                duracion=request.data.get("duracion"),
                ruta_almacenamiento_in=ruta_guardada,
            )

            archivo_pg = ArchivoAudio.objects.create(
                audio_in=audio_pg,
                usuario=request.user
            )

            # 4️⃣ Ejecutar Demucs en Docker
            ruta_output = ejecutar_demucs(nombre_audio, usuario=request.user.username)

            # 5️⃣ Registrar pistas separadas con tamaño real en MB
            stems = ["drums", "bass", "vocals", "other"]
            pistas_pg = []
            total_mb = 0.0

            for stem in stems:
                ruta_pista = os.path.join(ruta_output, f"{stem}.wav")
                if os.path.exists(ruta_pista):
                    # 🔹 Calcular tamaño real
                    tamano_bytes = os.path.getsize(ruta_pista)
                    tamano_mb = round(tamano_bytes / (1024 * 1024), 2)
                    total_mb += tamano_mb

                    # 🔹 Crear registro en Postgres
                    pista_pg = PistaSeparada.objects.create(
                        nombre_pista=f"{nombre_audio}_{stem}",
                        instrumento=stem,
                        ruta_pista_out=ruta_pista,
                        duracion=audio_pg.duracion,
                        tamano_mb=tamano_mb
                    )
                    archivo_pg.pistas.add(pista_pg)

                    # 🔹 Guardar también en Mongo
                    agregar_pista(audio_id_mongo, stem, ruta_pista, "wav", tamano_mb)

                    pistas_pg.append({
                        "stem": stem,
                        "tamano_mb": tamano_mb,
                        "ruta": ruta_pista
                    })

            # 6️⃣ Actualizar estado final y tamaño total
            audio_pg.estado = "procesado"
            audio_pg.tamano_mb = total_mb
            audio_pg.save()

            # 🧹 (Opcional) eliminar archivo original de entrada
            try:
                os.remove(ruta_guardada)
            except Exception as err:
                print(f"⚠️ No se pudo borrar el archivo original: {err}")

            return Response({
                "mensaje": "✅ Separación completada correctamente.",
                "audio_id_mongo": audio_id_mongo,
                "audio_id_postgres": audio_pg.id,
                "archivo_id_postgres": archivo_pg.id,
                "pistas_generadas": pistas_pg
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


# -----------------
# Agregar pista (usa ID de Postgres para ArchivoAudio)
# -----------------
class AgregarPistaView(APIView):
    def post(self, request, audio_id):
        data = request.data

        # 1️⃣ Guardar en Mongo
        updated = agregar_pista(
            audio_id=data.get("audio_id_mongo"),  # aquí pasamos el id de Mongo
            instrumento=data.get("instrumento"),
            url_archivo=data.get("url_archivo"),
            formato=data.get("formato"),
            tamano_mb=data.get("tamano_mb"),
        )

        # 2️⃣ Guardar en Postgres
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
