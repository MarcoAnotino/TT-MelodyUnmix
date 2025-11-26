export const ACCEPTED_MIME = ["audio/wav","audio/x-wav","audio/mpeg","audio/mp3"];
export const ACCEPTED_EXT = [".wav", ".mp3"];
export const SIZE_LIMIT_MB = 50;
export const SIZE_LIMIT_BYTES = SIZE_LIMIT_MB * 1024 * 1024;

export function validateAudioFile(file) {
  if (!file) return { ok: false, reason: "empty", message: "No seleccionaste archivo." };

  const lower = file.name.toLowerCase();
  const hasValidExt = ACCEPTED_EXT.some(ext => lower.endsWith(ext));
  const hasValidMime = ACCEPTED_MIME.includes(file.type);

  if (!hasValidExt && !hasValidMime) {
    return {
      ok: false,
      reason: "type",
      message: "Los únicos formatos aceptados son WAV y MP3.",
    };
  }

  if (file.size > SIZE_LIMIT_BYTES) {
    return {
      ok: false,
      reason: "size",
      message: `El límite permitido es de ${SIZE_LIMIT_MB} MB.`,
    };
  }

  return { ok: true };
}
