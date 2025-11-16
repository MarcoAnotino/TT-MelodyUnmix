from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services import guardar_audio, agregar_pista, obtener_audio
from .models import ProcesamientoAudio, ArchivoAudio, PistaSeparada
from .demucs_service import ejecutar_demucs
from django.http import JsonResponse, FileResponse, Http404
from django.shortcuts import get_object_or_404
from .services import get_collection
from django.db import close_old_connections
from bson import ObjectId 
from pymongo.errors import PyMongoError

import shutil
import threading
import traceback
import zipfile
import time 
import os


def safe_rm(path):
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print("No se pudo borrar", path, e)

def safe_rmtree(path):
    """Borra recursivamente una carpeta si existe."""
    try:
        if path and os.path.exists(path):
            shutil.rmtree(path)
    except Exception as e:
        print("No se pudo borrar carpeta", path, e)


# -----------------
# Audios Subidos
# -----------------

class MyUploadsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        GET /api/audios/mine/
        Lista de archivos subidos por el usuario autenticado (PostgreSQL).
        """
        user = request.user
        qs = (
            ArchivoAudio.objects
            .select_related("audio_in")
            .filter(usuario=user)
            .order_by("-audio_in__fecha_procesamiento")
        )

        results = []
        for a in qs:
            ai = a.audio_in
            results.append({
                "audio_id": ai.id,
                "nombre_audio": ai.nombre_audio,
                "estado": ai.estado,  # "procesando" | "procesado" | "error"
                "formato": ai.formato,
                "duracion": ai.duracion,  # segundos (int o null)
                "tamano_mb": float(ai.tamano_mb) if ai.tamano_mb is not None else None,
                "fecha_procesamiento": ai.fecha_procesamiento,
                "pistas_count": a.pistas.count(),
            })
        return Response({"results": results})

# -----------------
# Subida de audio
# -----------------
class AudioUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # 1️⃣ Obtener archivo y metadatos
            archivo_subido = request.FILES.get("archivo")
            if not archivo_subido:
                return Response({"error": "No se envió ningún archivo de audio."}, status=400)

            nombre_audio = archivo_subido.name
            formato = nombre_audio.split(".")[-1]

            base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
            input_dir = os.path.join(base_path, "input_audio")
            os.makedirs(input_dir, exist_ok=True)

            # 2️⃣ Guardar físicamente el archivo en input_audio/
            ruta_guardada = os.path.join(input_dir, nombre_audio)
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

            # 4️⃣ Lanzar procesamiento en background (Demucs + creación de pistas)
            lanzar_procesamiento_asincrono(
                audio_pg_id=audio_pg.id,
                archivo_pg_id=archivo_pg.id,
                nombre_audio=nombre_audio,
                ruta_guardada=ruta_guardada,
                user_id=request.user.id,
                username=request.user.username,
                audio_id_mongo=audio_id_mongo,
            )

            # 5️⃣ Responder rápido al frontend
            return Response({
                "mensaje": "✅ Archivo recibido. Procesamiento iniciado en segundo plano.",
                "audio_id_mongo": audio_id_mongo,
                "audio_id_postgres": audio_pg.id,
                "archivo_id_postgres": archivo_pg.id,
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

class AudioStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, audio_id):
        archivo = get_object_or_404(
            ArchivoAudio.objects.select_related("audio_in"),
            audio_in__id=audio_id,
            usuario=request.user,
        )
        audio = archivo.audio_in

        return Response({
            "id": audio.id,
            "status": audio.estado,   # "procesando" | "procesado" | "error"
            "title": audio.nombre_audio,
            "tamano_mb": float(audio.tamano_mb) if audio.tamano_mb is not None else None,
            "duracion": audio.duracion,
            "fecha_procesamiento": audio.fecha_procesamiento,
            "pistas_count": archivo.pistas.count(),
        }, status=200)


# MelodyUnmixApp/audios/views.py (añade)
class DownloadStemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, audio_id, stem):
        """
        GET /api/audios/<audio_id>/download/<stem>
        - <stem> puede ser 'vocals', 'drums', 'bass', 'other' o 'all'
        Requiere que el audio pertenezca al usuario autenticado.
        """
        # 1) Validar que el audio le pertenece al usuario
        try:
            archivo = ArchivoAudio.objects.select_related("audio_in").get(
                audio_in__id=audio_id,
                usuario=request.user
            )
        except ArchivoAudio.DoesNotExist:
            # No revelar existencia de IDs ajenos
            raise Http404("No autorizado o no existe")

        # 2) Caso "all": crear/servir ZIP con todos los stems disponibles
        if stem == "all":
            pistas = list(archivo.pistas.all())
            if not pistas:
                raise Http404("No hay pistas disponibles para este audio.")

            # Verificar qué archivos existen físicamente
            existentes = []
            newest_src_mtime = 0.0
            for p in pistas:
                if p.ruta_pista_out and os.path.exists(p.ruta_pista_out):
                    existentes.append(p)
                    newest_src_mtime = max(newest_src_mtime, os.path.getmtime(p.ruta_pista_out))

            if not existentes:
                raise Http404("Pistas no disponibles en el almacenamiento.")

            # Construir ruta del ZIP (en la misma carpeta del primer stem)
            # Nombre: <nombre_sin_ext>_stems.zip
            base_name = os.path.splitext(archivo.audio_in.nombre_audio)[0]
            first_dir = os.path.dirname(existentes[0].ruta_pista_out)
            zip_path = os.path.join(first_dir, f"{base_name}_stems.zip")

            # Reusar si existe y está actualizado (más nuevo que cualquier stem)
            need_rebuild = True
            if os.path.exists(zip_path):
                zip_mtime = os.path.getmtime(zip_path)
                # Si el zip es más nuevo que la pista más reciente, no reconstruimos
                if zip_mtime >= newest_src_mtime:
                    need_rebuild = False

            # (Re) construir zip si hace falta
            if need_rebuild:
                # Asegura directorio
                os.makedirs(first_dir, exist_ok=True)
                # Crear ZIP
                tmp_zip_path = f"{zip_path}.tmp"
                with zipfile.ZipFile(tmp_zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                    # Guardar cada pista con nombre readable: <instrumento>.wav (o el filename real)
                    for p in existentes:
                        src = p.ruta_pista_out
                        if not src or not os.path.exists(src):
                            continue
                        # arcname legible
                        ext = os.path.splitext(src)[1].lower() or ".wav"
                        inst = (p.instrumento or "stem").lower()
                        arcname = f"{inst}{ext}"
                        # Evitar duplicados (p.ej. dos 'other')
                        i = 1
                        base_arc = arcname
                        while True:
                            try:
                                # zipfile no expone conflicto hasta escribir; lo evitamos manual
                                if arcname in zf.namelist():
                                    i += 1
                                    arcname = f"{inst}_{i}{ext}"
                                    continue
                                break
                            except Exception:
                                break
                        zf.write(src, arcname=arcname)

                # Movimiento atómico del tmp -> definitivo
                if os.path.exists(tmp_zip_path):
                    # En Windows es mejor quitar antes; en Linux overwrite funciona con replace
                    try:
                        if os.path.exists(zip_path):
                            os.remove(zip_path)
                    except Exception:
                        pass
                    os.replace(tmp_zip_path, zip_path)
                    # Opcional: ajustar mtime al más nuevo de los stems
                    try:
                        os.utime(zip_path, (time.time(), newest_src_mtime))
                    except Exception:
                        pass

            # 3) Servir ZIP
            if not os.path.exists(zip_path):
                raise Http404("No se pudo generar el paquete de pistas.")
            return FileResponse(
                open(zip_path, "rb"),
                as_attachment=True,
                filename=os.path.basename(zip_path),
                content_type="application/zip",
            )

        # 4) Caso: un solo stem (vocals/drums/bass/other…)
        pista = archivo.pistas.filter(instrumento=stem).first()
        if not pista or not pista.ruta_pista_out or not os.path.exists(pista.ruta_pista_out):
            raise Http404("Pista no disponible")

        return FileResponse(
            open(pista.ruta_pista_out, "rb"),
            as_attachment=True,
            filename=os.path.basename(pista.ruta_pista_out),
        )
# -----------------
# Eliminar audio
# -----------------

def safe_rm(path):
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print("No se pudo borrar", path, e)

class DeleteAudioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, audio_id):
        """
        DELETE /api/audios/<audio_id>/
        Elimina por completo un audio del usuario autenticado:
        - registros en Postgres
        - archivos físicos
        - documento en Mongo
        """
        # 1) localizar por dueño + id postgres
        archivo = get_object_or_404(ArchivoAudio, audio_in__id=audio_id, usuario=request.user)
        ai = archivo.audio_in

        user_id = request.user.id
        audio_pg_id = ai.id

        # 2) borrar archivos físicos
        safe_rm(ai.ruta_almacenamiento_in)
        for pista in archivo.pistas.all():
            safe_rm(pista.ruta_pista_out)

        # borrar la carpeta completa de salida (incluyendo el zip y stems)
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        output_root = os.path.join(
            base_path,
            "output_audio",
            f"user_{user_id}",
            f"audio_{audio_pg_id}"
        )
        safe_rmtree(output_root)

        # 3) borrar en Mongo (si guardas mongo_id es mejor; ver nota abajo)
        try:
            col = get_collection()
            col.delete_many({
                "usuario_id": str(request.user.id),
                "nombre_archivo": ai.nombre_audio
                # o "url_archivo": ai.ruta_almacenamiento_in
            })
        except Exception as e:
            print("No se pudo borrar en Mongo: ", e)

        # 4) borrar objetos de DB
        PistaSeparada.objects.filter(archivos=archivo).delete()
        archivo.delete()
        ai.delete()

        return Response({"deleted": True})

# ===========================
# Procesamiento asíncrono Demucs
# ===========================

def procesar_audio_en_background(
    audio_pg_id,
    archivo_pg_id,
    nombre_audio,
    ruta_guardada,
    user_id,
    username,
    audio_id_mongo=None,
):
    """
    Se ejecuta en un hilo aparte:
    - Llama a Demucs
    - Crea las pistas en Postgres
    - Actualiza tamaño total y estado
    - Actualiza Mongo (si audio_id_mongo no es None)
    """
    from .models import ProcesamientoAudio, ArchivoAudio, PistaSeparada
    from .demucs_service import ejecutar_demucs
    from .services import agregar_pista, get_collection
    from .views import safe_rm  # ya lo tienes más abajo en este mismo archivo

    close_old_connections()

    try:
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

        # Carpeta de salida única por usuario + audio
        output_root = os.path.join(
            base_path,
            "output_audio",
            f"user_{user_id}",
            f"audio_{audio_pg_id}",
        )
        os.makedirs(output_root, exist_ok=True)

        # 1️⃣ Ejecutar Demucs
        ruta_output = ejecutar_demucs(
            nombre_archivo=nombre_audio,
            usuario=username,
            output_dir=output_root,
        )

        # 2️⃣ Cargar objetos desde DB
        audio_pg = ProcesamientoAudio.objects.get(id=audio_pg_id)
        archivo_pg = ArchivoAudio.objects.get(id=archivo_pg_id)

        # 3️⃣ Registrar pistas separadas con tamaño real en MB
        stems = ["drums", "bass", "vocals", "other"]
        total_mb = 0.0

        for stem in stems:
            ruta_pista = os.path.join(ruta_output, f"{stem}.wav")
            if os.path.exists(ruta_pista):
                tamano_bytes = os.path.getsize(ruta_pista)
                tamano_mb = round(tamano_bytes / (1024 * 1024), 2)
                total_mb += tamano_mb

                pista_pg = PistaSeparada.objects.create(
                    nombre_pista=f"{nombre_audio}_{stem}",
                    instrumento=stem,
                    ruta_pista_out=ruta_pista,
                    duracion=audio_pg.duracion,
                    tamano_mb=tamano_mb,
                )
                archivo_pg.pistas.add(pista_pg)

                # Mongo (si queremos reflejar también allí)
                if audio_id_mongo:
                    agregar_pista(
                        audio_id=audio_id_mongo,
                        instrumento=stem,
                        url_archivo=ruta_pista,
                        formato="wav",
                        tamano_mb=tamano_mb,
                    )

        # 4️⃣ Actualizar estado final y tamaño total en Postgres
        audio_pg.estado = "procesado"
        audio_pg.tamano_mb = total_mb
        audio_pg.save()

        # 5️⃣ Actualizar estado en Mongo (opcional pero recomendable)
        if audio_id_mongo:
            col = get_collection()
            col.update_one(
                {"_id": ObjectId(audio_id_mongo)},
                {"$set": {"estado_proc": "procesado"}},
            )

    except Exception as e:
        print("❌ Error en procesamiento asíncrono:", e)
        print(traceback.format_exc())
        try:
            audio_pg = ProcesamientoAudio.objects.get(id=audio_pg_id)
            audio_pg.estado = "error"
            audio_pg.save()
        except Exception:
            pass

        if audio_id_mongo:
            try:
                col = get_collection()
                col.update_one(
                    {"_id": ObjectId(audio_id_mongo)},
                    {"$set": {"estado_proc": "error"}},
                )
            except Exception:
                pass

    finally:
        # Intentar borrar el archivo original (como ya hacías)
        try:
            safe_rm(ruta_guardada)
        except Exception:
            pass
        close_old_connections()


def lanzar_procesamiento_asincrono(
    audio_pg_id,
    archivo_pg_id,
    nombre_audio,
    ruta_guardada,
    user_id,
    username,
    audio_id_mongo=None,
):
    """
    Crea y lanza el hilo en background.
    """
    hilo = threading.Thread(
        target=procesar_audio_en_background,
        args=(audio_pg_id, archivo_pg_id, nombre_audio, ruta_guardada, user_id, username, audio_id_mongo),
        daemon=True,
    )
    hilo.start()
