// src/pages/UserScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api, me } from "../lib/api";

/** Formatea segundos a M:SS */
function formatSecondsToMSS(sec) {
  if (!Number.isFinite(sec)) return "—";
  const total = Math.max(0, Math.round(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Obtiene duración del audio con <audio> + ObjectURL */
function getAudioDuration(file) {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      audio.preload = "metadata";
      audio.src = url;
      const cleanup = () => URL.revokeObjectURL(url);
      const ok = () => {
        const d = audio.duration;
        cleanup();
        resolve(Number.isFinite(d) ? d : null);
      };
      const err = () => {
        cleanup();
        resolve(null);
      };
      audio.addEventListener("loadedmetadata", ok, { once: true });
      audio.addEventListener("error", err, { once: true });
    } catch {
      resolve(null);
    }
  });
}

export default function UserScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // timersRef guardará objetos { stop: fn } por audioId
  const timersRef = useRef({});
  const [rows, setRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Detener polling si hay logout global
  useEffect(() => {
    const onLogout = () => {
      Object.values(timersRef.current).forEach((t) => t?.stop?.());
      timersRef.current = {};
    };
    window.addEventListener("app:logout", onLogout);
    return () => window.removeEventListener("app:logout", onLogout);
  }, []);

  // Precargar subidas del usuario y arrancar polling en las no procesadas
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/audios/mine/");
        const rowsLoaded = (data?.results || []).map((x) => ({
          id: x.audio_id,
          titulo: x.nombre_audio,
          duracion: x.duracion,
          estatus:
            String(x.estado || "").toLowerCase() === "procesado"
              ? "Procesado"
              : String(x.estado || "") === "error"
              ? "Error"
              : "Procesando…",
        }));
        setRows(rowsLoaded);
        rowsLoaded
          .filter((r) => r.estatus !== "Procesado" && r.estatus !== "Error")
          .forEach((r) => startPolling(r.id));
      } catch {
        // si falla, presentamos vacío sin romper UI
      }
    })();
  }, []);

  // (opcional) Verifica sesión válida al montar
  useEffect(() => {
    (async () => {
      try {
        await me();
      } catch {
        // ignore
      }
    })();
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((t) => t?.stop?.());
      timersRef.current = {};
    };
  }, []);

  const handleUploadClick = () => fileInputRef.current?.click();

  // Polling inteligente con pausa y backoff
  const startPolling = (audioId) => {
    if (timersRef.current[audioId]) return;

    let alive = true;
    let delay = 3000;
    let timer = null;

    const loop = async () => {
      if (!alive) return;
      // pausa si la pestaña no está visible
      if (document.hidden) {
        timer = setTimeout(loop, delay);
        return;
      }

      try {
        const { data } = await api.get(`/api/audios/${audioId}/status`);
        const raw = String(data?.status || "").toLowerCase();
        const label =
          raw === "procesado" || raw === "processed"
            ? "Procesado"
            : raw === "error"
            ? "Error"
            : "Procesando…";

        setRows((prev) =>
          prev.map((r) => (r.id === audioId ? { ...r, estatus: label } : r))
        );

        if (label === "Procesado" || label === "Error") {
          stop();
          return;
        }

        // si respondió OK, reset del backoff
        delay = 3000;
      } catch (err) {
        if (err?.response?.status === 401) {
          // si no hay sesión, corta el polling de este id
          stop();
          return;
        }
        // backoff hasta 15s
        delay = Math.min(delay + 3000, 15000);
      } finally {
        timer = setTimeout(loop, delay);
      }
    };

    const stop = () => {
      alive = false;
      if (timer) clearTimeout(timer);
      delete timersRef.current[audioId];
    };

    timersRef.current[audioId] = { stop };
    loop();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name || "";
    const ext = name.split(".").pop()?.toLowerCase();
    const mime = file.type;
    const isMp3 = ext === "mp3" || mime === "audio/mpeg";
    const isWav = ext === "wav" || mime === "audio/wav" || mime === "audio/x-wav";
    if (!isMp3 && !isWav) {
      alert("Solo se permiten archivos MP3 o WAV.");
      return;
    }

    setUploading(true);
    const durationSec = await getAudioDuration(file);
    const tamanoMB = +(file.size / (1024 * 1024)).toFixed(2);

    const tempKey = `temp-${Date.now()}`;
    setRows((prev) => [
      { id: tempKey, titulo: name, duracion: durationSec, estatus: "Subiendo…" },
      ...prev,
    ]);

    try {
      const form = new FormData();
      form.append("archivo", file);
      if (durationSec != null)
        form.append("duracion", Math.round(durationSec).toString());
      form.append("tamano_mb", tamanoMB.toString());

      const { data } = await api.post("/api/audios/upload/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const audioId = data?.audio_id_postgres;
      setRows((prev) =>
        prev.map((r) =>
          r.id === tempKey
            ? {
                ...r,
                id: audioId ?? tempKey,
                estatus: audioId ? "Procesando…" : "Procesado",
              }
            : r
        )
      );
      if (audioId) startPolling(audioId);
    } catch {
      setRows((prev) =>
        prev.map((r) =>
          r.id === tempKey ? { ...r, estatus: "Error al subir" } : r
        )
      );
      alert("Error subiendo el archivo. Verifica autenticación y backend.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  async function handleDelete(audioId) {
    if (!audioId) return;
    if (!window.confirm("¿Eliminar este audio definitivamente?")) return;

    setDeletingIds((prev) => new Set(prev).add(audioId));

    // Detén polling de este id si está activo
    if (timersRef.current[audioId]) {
      timersRef.current[audioId].stop?.();
    }

    try {
      await api.delete(`/api/audios/${audioId}/`);
      setRows((prev) => prev.filter((r) => r.id !== audioId));
    } catch {
      alert("No se pudo eliminar. Reintenta más tarde.");
    } finally {
      setDeletingIds((prev) => {
        const n = new Set(prev);
        n.delete(audioId);
        return n;
      });
    }
  }

  // Ir a la pantalla de descargas
  function handleGoToDownload(audioId, title) {
    if (!audioId) return;
    // ajusta a tu ruta real: /tracks/:id o /UploadedScreen/:id
    navigate(`/tracks/${audioId}`, { state: { title } });
  }

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(51,60,78,1)_3%,rgba(37,42,52,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      <Header />

      <section className="w-full flex flex-col items-center mt-24 px-4">
        <h1 className="font-semibold text-3xl sm:text-4xl">
          Comienza a probar nuestra IA
        </h1>
        <p className="text-[#e7e7e7] text-2xl mt-1">Sube tu archivo ahora</p>

        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="mt-8 w-[205px] h-[49px] flex items-center justify-center bg-[#3e4070] rounded-[20px] hover:bg-[#4a4d8a] transition-colors disabled:opacity-60"
        >
          <span className="text-xl">
            {uploading ? "Subiendo..." : "Subir archivo"}
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </section>

      <section className="w-full flex justify-center mt-20 pb-24 px-4">
        <div className="w-full max-w-[1117px]">
          <div
            className="grid grid-cols-3 text-[#e3dddd] text-xl sm:text-2xl px-3 py-2"
            role="row"
          >
            <div>Título</div>
            <div>Duración</div>
            <div className="text-right">Estatus</div>
          </div>

          <div className="divide-y divide-white/10">
            {rows.length === 0 ? (
              <div className="px-3 py-6 text-white/70">
                Aún no has subido archivos.
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id ?? `${row.titulo}-${row.estatus}`}
                  className="grid grid-cols-3 items-center px-3 py-5 text-[#c5c5c5] text-xl"
                  role="row"
                >
                  <div className="truncate">{row.titulo}</div>
                  <div>{formatSecondsToMSS(row.duracion)}</div>

                  <div className="text-right flex items-center justify-end gap-2 sm:gap-3">
                    <span className="mr-1">{row.estatus}</span>

                    {row.estatus === "Procesado" && (
                      <button
                        onClick={() => handleGoToDownload(row.id, row.titulo)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        title="Ver y descargar pistas"
                        aria-label={`Descargar ${row.titulo}`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={!row.id || deletingIds.has(row.id)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 disabled:opacity-50"
                      title="Eliminar"
                      aria-label={`Eliminar ${row.titulo}`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
