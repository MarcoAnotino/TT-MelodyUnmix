from django.db import models
from django.conf import settings

class LogProcesamiento(models.Model):
    descripcion_log = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log {self.id} - {self.fecha}"


class ProcesamientoAudio(models.Model):
    nombre_audio = models.CharField(max_length=255)
    log = models.ForeignKey(LogProcesamiento, on_delete=models.SET_NULL, null=True, blank=True)
    estado = models.CharField(max_length=50, blank=True, null=True)
    formato = models.CharField(max_length=10, blank=True, null=True)
    tamano_mb = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    duracion = models.IntegerField(blank=True, null=True)
    ruta_almacenamiento_in = models.CharField(max_length=255, blank=True, null=True)
    fecha_procesamiento = models.DateTimeField(auto_now_add=True)
    
    # Metadatos extraídos del archivo de audio
    title = models.CharField(max_length=500, blank=True, null=True)
    artist = models.CharField(max_length=500, blank=True, null=True)
    album = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.nombre_audio


class PistaSeparada(models.Model):
    nombre_pista = models.CharField(max_length=255)
    instrumento = models.CharField(max_length=50, blank=True, null=True)
    tamano_mb = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    duracion = models.IntegerField(blank=True, null=True)
    ruta_pista_out = models.CharField(max_length=255, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre_pista


class ArchivoAudio(models.Model):
    audio_in = models.ForeignKey(ProcesamientoAudio, on_delete=models.CASCADE)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # Relación M2M explícita con "ArchivoPista"
    pistas = models.ManyToManyField(PistaSeparada, through="ArchivoPista", related_name="archivos")

    def __str__(self):
        return f"Archivo {self.id} - {self.audio_in.nombre_audio}"


class ArchivoPista(models.Model):
    archivo = models.ForeignKey(ArchivoAudio, on_delete=models.CASCADE)
    pista = models.ForeignKey(PistaSeparada, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("archivo", "pista")  # Evitar duplicados

    def __str__(self):
        return f"Archivo {self.archivo.id} ↔ Pista {self.pista.id}"
