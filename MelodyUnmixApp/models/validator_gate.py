# validator_gate.py
from pathlib import Path
import numpy as np
import torch
import torchaudio

# === Ajusta si quieres ===
N_FFT = 2048
HOP = 512
WIN = 2048
AUDIO_EXTS = {".wav", ".flac", ".mp3", ".m4a", ".ogg", ".aac"}

def sigmoid(z):
    z = np.clip(z, -30, 30)
    return 1.0 / (1.0 + np.exp(-z))

def load_audio_mono(path: Path, target_sr: int = 44100, max_seconds: float = 30.0):
    wav, sr = torchaudio.load(str(path))
    if wav.shape[0] > 1:
        wav = wav.mean(dim=0, keepdim=True)
    if sr != target_sr:
        wav = torchaudio.functional.resample(wav, sr, target_sr)
        sr = target_sr
    max_len = int(sr * max_seconds)
    wav = wav[:, :max_len]
    return wav.squeeze(0), sr

def stft_mag(x: torch.Tensor, n_fft=N_FFT, hop=HOP, win_length=WIN):
    window = torch.hann_window(win_length, device=x.device)
    X = torch.stft(
        x, n_fft=n_fft, hop_length=hop, win_length=win_length,
        window=window, center=True, return_complex=True
    )
    return torch.abs(X)

def audio_metrics(x: torch.Tensor, sr: int):
    eps = 1e-9
    x_np = x.detach().cpu().numpy()

    rms = float(np.sqrt(np.mean(x_np**2) + eps))
    peak = float(np.max(np.abs(x_np)) + eps)
    crest = float(peak / (rms + eps))
    zcr = float(np.mean(np.abs(np.diff(np.sign(x_np))) > 0))

    mag = stft_mag(x).cpu().numpy() + eps
    freqs = np.linspace(0, sr / 2, mag.shape[0], dtype=np.float64)

    spec = mag / (np.sum(mag, axis=0, keepdims=True) + eps)
    centroid = float(np.mean(np.sum(spec * freqs[:, None], axis=0)))

    cumsum = np.cumsum(spec, axis=0)
    idx = np.argmax(cumsum >= 0.85, axis=0)
    rolloff = float(np.mean(freqs[idx]))

    geom = np.exp(np.mean(np.log(mag), axis=0))
    arith = np.mean(mag, axis=0)
    flatness = float(np.mean(geom / (arith + eps)))

    spec2 = mag / (np.sum(mag, axis=0, keepdims=True) + eps)
    if spec2.shape[1] > 1:
        diff = spec2[:, 1:] - spec2[:, :-1]
        flux = float(np.mean(np.sqrt(np.sum(diff * diff, axis=0) + eps)))
    else:
        flux = 0.0

    def band_ratio(M, f_lo, f_hi):
        idxb = (freqs >= f_lo) & (freqs < f_hi)
        num = float(np.sum(M[idxb, :]))
        den = float(np.sum(M))
        return num / (den + eps)

    low = band_ratio(mag, 0, 250)
    mid = band_ratio(mag, 250, 2000)
    high = band_ratio(mag, 2000, 8000)
    air = band_ratio(mag, 8000, 20000)

    frame_rms = np.sqrt(np.mean((mag ** 2), axis=0) + eps)
    frame_rms_var = float(np.var(frame_rms))

    # Harmonicity: 3s más energético (robusto)
    seg_len = int(sr * 3.0)
    x_c = x_np - np.mean(x_np)

    if len(x_c) <= seg_len:
        x0 = x_c
    else:
        frame_len = max(1, int(sr * 0.05))
        frames = len(x_c) // frame_len
        if frames <= 1:
            x0 = x_c[:seg_len]
        else:
            rms_frames = np.array(
                [np.sqrt(np.mean(x_c[i*frame_len:(i+1)*frame_len]**2) + 1e-12) for i in range(frames)],
                dtype=np.float64
            )
            best = int(np.argmax(rms_frames))
            start = best * frame_len
            start = max(0, min(start - seg_len // 2, len(x_c) - seg_len))
            x0 = x_c[start:start + seg_len]

    if len(x0) < sr * 0.5:
        harmonicity = 0.0
    else:
        ac = np.correlate(x0, x0, mode="full")
        ac = ac[len(ac)//2:]
        ac0 = ac[0] + eps
        lag_min = int(sr / 500)
        lag_max = min(int(sr / 50), len(ac) - 1)
        if lag_max <= lag_min + 2:
            harmonicity = 0.0
        else:
            harmonicity = float(np.max(ac[lag_min:lag_max]) / ac0)

    peakiness = float(np.mean((np.max(mag, axis=0)) / (np.mean(mag, axis=0) + eps)))

    return {
        "flatness": flatness,
        "spectral_flux": flux,
        "centroid_hz": centroid,
        "rolloff85_hz": rolloff,
        "zcr": zcr,
        "band_high_2k_8k": high,
        "band_air_8k_20k": air,
        "frame_rms_var": frame_rms_var,
        "harmonicity": harmonicity,
        "peakiness": peakiness,
        "crest": crest,
        # extras por si quieres loggear
        "rms": rms,
        "peak": peak,
        "band_low_0_250": low,
        "band_mid_250_2k": mid,
    }

def load_validator(npz_path: Path):
    d = np.load(Path(npz_path), allow_pickle=True)
    return {
        "w": d["w"].astype(np.float64),
        "b": float(d["b"][0]),
        "mu": d["mu"].astype(np.float64),
        "sd": d["sd"].astype(np.float64),
        "thr": float(d["thr"][0]),
        "feat_cols": list(d["feat_cols"]),
        "version": str(d["version"][0]) if "version" in d else "v1",
    }

def should_apply_model(others_audio_path: str, validator_npz: str, sr: int = 44100, max_seconds: float = 30.0):
    V = load_validator(validator_npz)

    wav, _ = load_audio_mono(Path(others_audio_path), target_sr=sr, max_seconds=max_seconds)
    feats = audio_metrics(wav, sr)

    x = np.array([feats[c] for c in V["feat_cols"]], dtype=np.float64)
    x = (x - V["mu"]) / V["sd"]

    score = float(sigmoid(x @ V["w"] + V["b"]))
    rec = bool(score >= V["thr"])  # True => aplicar modelo

    return rec, score, V["thr"], feats
