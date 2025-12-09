"""
🎸 GuitarNet INFERENCE - Separación de guitarra en producción
Autor: Marco Antonio Jimenez Morales
Fecha: 04/12/2025
Proyecto: Melody Unmix

Uso:
    python inference.py input.wav output_folder/
    
Output:
    - output_folder/guitar.wav
    - output_folder/others.wav
"""

import torch
import torch.nn as nn
import torchaudio
import numpy as np
from pathlib import Path
import argparse
import sys


# =====================================================
# 1️) MODELO (misma arquitectura del entrenamiento)
# =====================================================
class EfficientGuitarNet(nn.Module):
    """U-Net optimizada - debe coincidir exactamente con el entrenamiento"""
    def __init__(self):
        super().__init__()
        
        # Encoder
        self.enc1 = nn.Sequential(
            nn.Conv2d(1, 32, 3, 1, 1),
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(32, 32, 3, 1, 1),
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2, inplace=True),
        )
        self.pool1 = nn.Conv2d(32, 32, 3, 2, 1)
        
        self.enc2 = nn.Sequential(
            nn.Conv2d(32, 64, 3, 1, 1),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(64, 64, 3, 1, 1),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2, inplace=True),
        )
        self.pool2 = nn.Conv2d(64, 64, 3, 2, 1)
        
        self.enc3 = nn.Sequential(
            nn.Conv2d(64, 128, 3, 1, 1),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(128, 128, 3, 1, 1),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
        )
        self.pool3 = nn.Conv2d(128, 128, 3, 2, 1)
        
        self.enc4 = nn.Sequential(
            nn.Conv2d(128, 256, 3, 1, 1),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(256, 256, 3, 1, 1),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
        )
        self.pool4 = nn.Conv2d(256, 256, 3, 2, 1)
        
        # Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Conv2d(256, 512, 3, 1, 1),
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(512, 512, 3, 1, 1),
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(512, 256, 3, 1, 1),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
        )
        
        # Decoder
        self.up4 = nn.ConvTranspose2d(256, 128, 4, 2, 1)
        self.dec4 = nn.Sequential(
            nn.Conv2d(256 + 128, 128, 3, 1, 1),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(128, 128, 3, 1, 1),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
        )
        
        self.up3 = nn.ConvTranspose2d(128, 64, 4, 2, 1)
        self.dec3 = nn.Sequential(
            nn.Conv2d(128 + 64, 64, 3, 1, 1),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(64, 64, 3, 1, 1),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2, inplace=True),
        )
        
        self.up2 = nn.ConvTranspose2d(64, 32, 4, 2, 1)
        self.dec2 = nn.Sequential(
            nn.Conv2d(64 + 32, 32, 3, 1, 1),
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(32, 32, 3, 1, 1),
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2, inplace=True),
        )
        
        self.up1 = nn.ConvTranspose2d(32, 16, 4, 2, 1)
        self.dec1 = nn.Sequential(
            nn.Conv2d(32 + 16, 16, 3, 1, 1),
            nn.BatchNorm2d(16),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(16, 16, 3, 1, 1),
            nn.BatchNorm2d(16),
            nn.LeakyReLU(0.2, inplace=True),
        )
        
        self.out = nn.Conv2d(16, 1, 1)

    def forward(self, x):
        e1 = self.enc1(x)
        e1_down = self.pool1(e1)
        
        e2 = self.enc2(e1_down)
        e2_down = self.pool2(e2)
        
        e3 = self.enc3(e2_down)
        e3_down = self.pool3(e3)
        
        e4 = self.enc4(e3_down)
        e4_down = self.pool4(e4)
        
        b = self.bottleneck(e4_down)
        
        d4 = self.up4(b)
        d4 = torch.cat([d4, e4], dim=1)
        d4 = self.dec4(d4)
        
        d3 = self.up3(d4)
        d3 = torch.cat([d3, e3], dim=1)
        d3 = self.dec3(d3)
        
        d2 = self.up2(d3)
        d2 = torch.cat([d2, e2], dim=1)
        d2 = self.dec2(d2)
        
        d1 = self.up1(d2)
        d1 = torch.cat([d1, e1], dim=1)
        d1 = self.dec1(d1)
        
        mask = torch.sigmoid(self.out(d1))
        return mask


# =====================================================
# 2) CLASE DE INFERENCIA
# =====================================================
class GuitarSeparator:
    def __init__(self, model_path, device=None):
        """
        Inicializa el separador de guitarra
        
        Args:
            model_path: Ruta al modelo entrenado (.pth)
            device: 'mps', 'cuda', 'cpu' o None (auto-detect)
        """
        # Auto-detectar device
        if device is None:
            if torch.backends.mps.is_available():
                device = torch.device("mps")
            elif torch.cuda.is_available():
                device = torch.device("cuda")
            else:
                device = torch.device("cpu")
        else:
            device = torch.device(device)
        
        self.device = device
        print(f"Usando device: {device}")
        
        # Cargar modelo
        self.model = EfficientGuitarNet().to(device)
        self.model.load_state_dict(torch.load(model_path, map_location=device))
        self.model.eval()
        print(f"Modelo cargado desde: {model_path}")
        
        # Parámetros STFT (deben coincidir con el entrenamiento)
        self.n_fft = 2048
        self.hop_length = 512
        self.win_length = 2048
        self.target_sr = 44100

    def enhance_guitar_mask(self, mask,
                            gamma=0.8,
                            high_start_ratio=0.4,
                            high_boost_db=3.0):
        """
        Ajusta la máscara para favorecer ligeramente la guitarra,
        especialmente en frecuencias agudas.

        Args:
            mask: [F, T] en [0, 1]
            gamma: <1 -> empuja valores hacia 1 (más agresivo)
            high_start_ratio: a partir de qué fracción de F empezar a subir (0-1)
            high_boost_db: cuántos dB extra para las altas

        Returns:
            mask_enhanced: [F, T] en [0, 1]
        """
        mask = mask.clamp(0, 1)

        # 1) Gamma correction: sharpen suave
        #    gamma < 1 hace más "blancas" las zonas ya altas de la máscara
        mask = mask ** gamma

        F, T = mask.shape
        device = mask.device

        # 2) Peso por frecuencia, subiendo en las altas
        freqs = torch.linspace(0, 1, F, device=device)  # 0 abajo, 1 arriba
        start = high_start_ratio
        weight = torch.ones_like(freqs)

        # zona donde queremos empezar a aumentar
        idx = freqs >= start
        if idx.any():
            boost_lin = 10 ** (high_boost_db / 20)  # pasar dB a factor lineal
            # sube linealmente de 1 a boost_lin entre start y 1
            weight[idx] = 1 + (boost_lin - 1) * (freqs[idx] - start) / (1 - start)

        # expandir al eje temporal
        weight = weight.view(F, 1)
        mask = mask * weight

        # 3) Re-normalizar a [0, 1] para no romper la mixture consistency
        m_min = mask.min()
        m_max = mask.max()
        if (m_max - m_min) > 1e-8:
            mask = (mask - m_min) / (m_max - m_min)

        return mask

        
    def load_audio(self, audio_path):
        """
        Carga audio preservando estéreo.
        
        Returns:
            waveform_stereo: Audio original (1 o 2 canales)
            waveform_mono: Versión mono para el modelo
            sr: Sample rate
        """
        print(f"Cargando audio: {audio_path}")
        
        # Cargar audio con backend explícito para evitar errores
        try:
            waveform, sr = torchaudio.load(audio_path, backend="soundfile")
        except Exception:
            # Fallback: intentar sin especificar backend
            waveform, sr = torchaudio.load(audio_path)
        
        # Resamplear si es necesario
        if sr != self.target_sr:
            print(f"Resampling {sr}Hz → {self.target_sr}Hz")
            resampler = torchaudio.transforms.Resample(sr, self.target_sr)
            waveform = resampler(waveform)
        
        # Guardar versión estéreo original
        waveform_stereo = waveform
        is_stereo = waveform.shape[0] > 1
        
        # Crear versión mono para el modelo
        if is_stereo:
            waveform_mono = waveform.mean(dim=0, keepdim=True)
            print(f"Audio estéreo detectado ({waveform.shape[0]} canales)")
        else:
            waveform_mono = waveform
            print("Audio mono")
        
        return waveform_stereo, waveform_mono, self.target_sr
    
    def audio_to_spectrogram(self, waveform):
        """Convierte audio a espectrograma de magnitud"""
        # STFT
        stft = torch.stft(
            waveform,
            n_fft=self.n_fft,
            hop_length=self.hop_length,
            win_length=self.win_length,
            window=torch.hann_window(self.win_length).to(waveform.device),
            return_complex=True
        )
        
        # Magnitud y fase
        magnitude = torch.abs(stft)
        phase = torch.angle(stft)
        
        return magnitude, phase
    
    def spectrogram_to_audio(self, magnitude, phase):
        """Reconstruye audio desde espectrograma"""
        # Mover tensores a CPU para iSTFT (MPS no soporta bien operaciones complejas)
        magnitude_cpu = magnitude.cpu()
        phase_cpu = phase.cpu()
        
        # Reconstruir STFT complejo usando torch.polar (más compatible)
        stft_complex = torch.polar(magnitude_cpu, phase_cpu)
        
        # iSTFT
        waveform = torch.istft(
            stft_complex,
            n_fft=self.n_fft,
            hop_length=self.hop_length,
            win_length=self.win_length,
            window=torch.hann_window(self.win_length)
        )
        
        return waveform
    
    def process_chunk(self, mag_chunk):
        """Procesa un chunk con el modelo"""
        # Normalizar
        mag_min = mag_chunk.min()
        mag_max = mag_chunk.max()
        mag_norm = (mag_chunk - mag_min) / (mag_max - mag_min + 1e-8)
        
        # Guardar dimensiones originales
        orig_f, orig_t = mag_norm.shape
        
        # Calcular padding para que las dimensiones sean divisibles por 16
        # (4 capas de pooling = 2^4 = 16)
        pad_f = (16 - orig_f % 16) % 16
        pad_t = (16 - orig_t % 16) % 16
        
        # Aplicar padding si es necesario
        if pad_f > 0 or pad_t > 0:
            mag_norm = torch.nn.functional.pad(mag_norm, (0, pad_t, 0, pad_f))
        
        # Agregar dimensiones de batch y canal
        mag_input = mag_norm.unsqueeze(0).unsqueeze(0)  # [1, 1, F, T]
        
        # Inferencia
        with torch.no_grad():
            mask = self.model(mag_input.to(self.device))
        
        # Remover dimensiones extra
        mask = mask.squeeze(0).squeeze(0)  # [F, T]
        
        # Recortar a dimensiones originales
        mask = mask[:orig_f, :orig_t]
        
        # Aplicar máscara (mover mag_chunk al mismo dispositivo que mask)
        mag_chunk_device = mag_chunk.to(mask.device)
        guitar_mag = mask * mag_chunk_device
        
        return guitar_mag, mask
    
    def separate(self, audio_path, output_dir, chunk_duration=30):
        """
        Separa guitarra de un archivo de audio preservando estéreo.
        
        IMPORTANTE: La inferencia coincide exactamente con el entrenamiento:
        - El modelo predice una máscara (0-1)
        - guitar = mask * mix
        - others = (1 - mask) * mix
        
        Args:
            audio_path: Ruta al archivo de audio de entrada
            output_dir: Carpeta donde guardar los outputs
            chunk_duration: Duración de chunks en segundos
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        print("\n" + "="*60)
        print("GUITARNET - Separación de Audio (Estéreo)")
        print("="*60)
        
        # Cargar audio (estéreo + mono)
        waveform_stereo, waveform_mono, sr = self.load_audio(audio_path)
        duration = waveform_stereo.shape[-1] / sr
        num_channels = waveform_stereo.shape[0]
        print(f"Duración: {duration:.2f}s, Canales: {num_channels}")
        
        # Generar espectrograma MONO para el modelo
        print("Generando espectrograma mono para modelo...")
        magnitude_mono, _ = self.audio_to_spectrogram(waveform_mono)
        magnitude_mono = magnitude_mono.to(self.device)
        print(f"   Shape mono: {magnitude_mono.shape}")
        
        # Procesar mono con el modelo (por chunks si es largo)
        chunk_size = int(chunk_duration * sr / self.hop_length)
        total_frames = magnitude_mono.shape[-1]
        
        if total_frames > chunk_size:
            print(f"Procesando en chunks de {chunk_duration}s...")
            # Obtener la MÁSCARA, no la magnitud de guitarra
            guitar_mask = self.process_long_audio_mask(magnitude_mono, chunk_size)
        else:
            print("Procesando con el modelo...")
            _, guitar_mask = self.process_chunk(magnitude_mono.squeeze(0))
        
        # Calcular máscara de others como complemento (como en entrenamiento)
        # mejorar máscara para favorecer guitarra, sobre todo en agudos
        guitar_mask = self.enhance_guitar_mask(
            guitar_mask,
            gamma=0.8,            # más bajo = más agresivo
            high_start_ratio=0.4, # a partir del 40% superior de F
            high_boost_db=5     # prueba 3–6 dB
        )
        # Training code: mask_others = 1 - mask_guitar
        others_mask = (1 - guitar_mask).clamp(min=0)
        
        print("Aplicando máscaras a canales estéreo...")
        guitar_channels = []
        others_channels = []
        
        for ch in range(num_channels):
            # Espectrograma del canal
            channel_wave = waveform_stereo[ch:ch+1]
            mag_ch, phase_ch = self.audio_to_spectrogram(channel_wave)
            mag_ch = mag_ch.to(self.device).squeeze(0)
            phase_ch = phase_ch.to(self.device)
            
            # Aplicar máscaras EXACTAMENTE como en entrenamiento:
            # guitar = mask * mix
            # others = (1 - mask) * mix
            guitar_mag_ch = guitar_mask * mag_ch
            others_mag_ch = others_mask * mag_ch
            
            # Reconstruir audio del canal
            guitar_ch = self.spectrogram_to_audio(guitar_mag_ch.unsqueeze(0), phase_ch)
            others_ch = self.spectrogram_to_audio(others_mag_ch.unsqueeze(0), phase_ch)
            
            guitar_channels.append(guitar_ch)
            others_channels.append(others_ch)
        
        # Combinar canales
        if num_channels > 1:
            guitar_audio = torch.stack(guitar_channels, dim=0)
            others_audio = torch.stack(others_channels, dim=0)
        else:
            guitar_audio = guitar_channels[0].unsqueeze(0)
            others_audio = others_channels[0].unsqueeze(0)
        
        # Asegurar que es 2D
        if guitar_audio.dim() == 3:
            guitar_audio = guitar_audio.squeeze(1)
        if others_audio.dim() == 3:
            others_audio = others_audio.squeeze(1)
        
        # Normalizar para evitar clipping
        guitar_audio = self.normalize_audio(guitar_audio)
        others_audio = self.normalize_audio(others_audio)
        
        # Guardar
        guitar_path = output_dir / "guitar.wav"
        others_path = output_dir / "others.wav"
        
        print(f"Guardando resultados...")
        torchaudio.save(str(guitar_path), guitar_audio.cpu(), sr)
        torchaudio.save(str(others_path), others_audio.cpu(), sr)
        
        print(f"Guitar guardada en: {guitar_path} ({num_channels} canales)")
        print(f"Others guardada en: {others_path} ({num_channels} canales)")
        print("="*60 + "\n")
        
        return guitar_path, others_path
    
    def process_long_audio_mask(self, magnitude, chunk_size, overlap=0.5):
        """
        Procesa audio largo en chunks con overlap y retorna la MÁSCARA.
        
        Esta función coincide con el entrenamiento: el modelo predice
        una máscara (0-1) que luego se multiplica por el mix.
        """
        magnitude = magnitude.squeeze(0)  # [F, T]
        total_frames = magnitude.shape[-1]
        hop = int(chunk_size * (1 - overlap))
        
        # Inicializar output de MÁSCARA
        device = magnitude.device
        mask_output = torch.zeros_like(magnitude)
        weight = torch.zeros(magnitude.shape[-1], device=device)
        
        # Ventana Hann para overlap-add suave
        window = torch.hann_window(chunk_size, device=device)
        
        # Calcular número de chunks
        num_chunks = max(1, (total_frames - 1) // hop + 1)
        
        for i in range(num_chunks):
            start = i * hop
            end = min(start + chunk_size, total_frames)
            actual_len = end - start
            
            # Extraer chunk de magnitud
            chunk = magnitude[:, start:end]
            
            # Pad si es necesario
            if chunk.shape[-1] < chunk_size:
                pad_size = chunk_size - chunk.shape[-1]
                chunk = torch.nn.functional.pad(chunk, (0, pad_size))
            
            # Procesar y obtener la MÁSCARA (no la magnitud de guitarra)
            _, mask_chunk = self.process_chunk(chunk)
            
            # Recortar al tamaño actual
            mask_chunk = mask_chunk[:, :actual_len]
            
            # Aplicar ventana para overlap-add
            win_slice = window[:actual_len]
            windowed_mask = mask_chunk * win_slice
            
            # Acumular
            mask_output[:, start:end] += windowed_mask
            weight[start:end] += win_slice
            
            if (i + 1) % 3 == 0 or i == num_chunks - 1:
                print(f"   Chunk {i+1}/{num_chunks} procesado")
        
        # Promediar overlaps
        weight = weight.clamp(min=1e-8)
        mask_output = mask_output / weight
        
        # Clamp para asegurar que la máscara esté en [0, 1]
        mask_output = mask_output.clamp(0, 1)
        
        return mask_output
    
    def normalize_audio(self, waveform, target_level=-1.0):
        """Normaliza audio para evitar clipping"""
        # Peak normalization
        peak = waveform.abs().max()
        if peak > 0:
            waveform = waveform / peak
        
        # Aplicar target level (en dB)
        scale = 10 ** (target_level / 20)
        waveform = waveform * scale
        
        return waveform


# =====================================================
# 3️) CLI Y FUNCIÓN PRINCIPAL
# =====================================================
def main():
    parser = argparse.ArgumentParser(
        description="🎸 GuitarNet - Separador de guitarra en producción"
    )
    parser.add_argument(
        "input", 
        type=str,
        help="Archivo de audio de entrada (.wav, .mp3, etc.)"
    )
    parser.add_argument(
        "output", 
        type=str,
        help="Carpeta donde guardar los archivos separados"
    )
    parser.add_argument(
        "--model", 
        type=str,
        default="checkpoints_elite_m4/best_model.pth",
        help="Ruta al modelo entrenado (default: checkpoints_elite_m4/best_model.pth)"
    )
    parser.add_argument(
        "--device",
        type=str,
        default=None,
        choices=["cpu", "cuda", "mps"],
        help="Device a usar (default: auto-detect)"
    )
    parser.add_argument(
        "--chunk-duration",
        type=int,
        default=30,
        help="Duración de chunks en segundos para audios largos (default: 30)"
    )
    
    args = parser.parse_args()
    
    # Validar entrada
    if not Path(args.input).exists():
        print(f"Error: Archivo no encontrado: {args.input}")
        sys.exit(1)
    
    if not Path(args.model).exists():
        print(f"Error: Modelo no encontrado: {args.model}")
        print(f"   Asegúrate de haber entrenado el modelo primero.")
        sys.exit(1)
    
    # Inicializar separador
    separator = GuitarSeparator(args.model, device=args.device)
    
    # Separar
    try:
        guitar_path, others_path = separator.separate(
            args.input,
            args.output,
            chunk_duration=args.chunk_duration
        )
        print("¡Separación completada exitosamente!")
    except Exception as e:
        print(f"Error durante la separación: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


# =====================================================
# 4️) USO COMO LIBRERÍA
# =====================================================
def separate_guitar(input_audio, output_folder, model_path="./guitarnet_model.pth"):
    """
    Función simple para usar como librería
    
    Ejemplo:
        from inference import separate_guitar
        
        guitar, others = separate_guitar(
            "my_song.wav",
            "output/",
            model_path="my_model.pth"
        )
    """
    separator = GuitarSeparator(model_path)
    return separator.separate(input_audio, output_folder)


if __name__ == "__main__":
    main()