// src/pages/UserScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api, me } from "../lib/api";
import { validateAudioFile } from "../utils/fileValidation";

/** Formatea segundos a M:SS */
function formatSecondsToMSS(sec) {
  if (!Number.isFinite(sec)) return "—";
  const total = Math.max(0, Math.round(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Quita la extensión de un nombre de archivo */
function stripExtension(name = "") {
  return name.replace(/\.[^/.]+$/, "");
}

/** Formatea fecha a algo legible */
function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formatea MB a cadena corta */
function formatMB(mb) {
  if (mb == null) return "—";
  const num = typeof mb === "number" ? mb : Number(mb);
  if (!Number.isFinite(num)) return "—";
  return `${num.toFixed(2)} MB`;
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

  const timersRef = useRef({});
  const [rows, setRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);

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
          titulo: stripExtension(x.nombre_audio || ""),
          duracion: x.duracion,
          estatus:
            String(x.estado || "").toLowerCase() === "procesado"
              ? "Procesado"
              : String(x.estado || "").toLowerCase() === "error"
              ? "Error"
              : "Procesando…",
          tamano_mb: x.tamano_mb,
          pistas_count: x.pistas_count ?? 0,
          fecha_procesamiento: x.fecha_procesamiento,
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

  // Verifica sesión válida al montar
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

        delay = 3000;
      } catch (err) {
        if (err?.response?.status === 401) {
          stop();
          return;
        }
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

  // Helper reutilizable (input + drag&drop)
  const handleFiles = async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    const validation = validateAudioFile(file);
    if (!validation.ok) {
      alert(validation.message);
      return;
    }

    const fileName = file.name || "";
    setUploading(true);

    const durationSec = await getAudioDuration(file);
    const tamanoMB = +(file.size / (1024 * 1024)).toFixed(2);
    const baseTitle = stripExtension(fileName);

    const tempKey = `temp-${Date.now()}`;
    setRows((prev) => [
      {
        id: tempKey,
        titulo: baseTitle,
        duracion: durationSec,
        estatus: "Subiendo…",
      },
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
    }
  };

  // Input clásico
  const handleFileChange = async (e) => {
    await handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    await handleFiles(files);
  };

  async function handleDelete(audioId) {
    if (!audioId) return;
    if (!window.confirm("¿Eliminar este audio definitivamente?")) return;

    setDeletingIds((prev) => new Set(prev).add(audioId));

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

  function handleGoToDownload(audioId, title) {
    if (!audioId) return;
    navigate(`/tracks/${audioId}`, { state: { title } });
  }

  const totalPistas = rows.reduce(
    (acc, r) => acc + (r.pistas_count || 0),
    0
  );

  const ultimoProcesado = rows[0]?.fecha_procesamiento;

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(51,60,78,1)_3%,rgba(37,42,52,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      <Header />

      {/* Hero de subida con drag & drop */}
      <section className="w-full flex flex-col items-center mt-20 sm:mt-24 px-4">
        <h1 className="font-semibold text-[clamp(24px,5vw,32px)] text-center">
          Comienza a probar nuestra IA
        </h1>
        <p className="text-[#e7e7e7] text-[clamp(16px,4.5vw,22px)] mt-1 text-center">
          Sube tu archivo ahora
        </p>

        <div
          className={[
            "mt-8 w-full max-w-xl rounded-3xl border-2 border-dashed px-4 py-6 sm:px-6 sm:py-8 flex flex-col items-center justify-center text-center transition-all",
            isDragging
              ? "border-[#08D9D6] bg-white/10"
              : "border-white/20 bg-black/20 hover:bg-black/30",
          ].join(" ")}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full sm:w-[205px] h-[46px] sm:h-[49px] flex items-center justify-center bg-[#3e4070] rounded-[18px] sm:rounded-[20px] hover:bg-[#4a4d8a] transition-colors disabled:opacity-60"
          >
            <span className="text-base sm:text-xl">
              {uploading ? "Subiendo..." : "Subir archivo"}
            </span>
          </button>

          <p className="mt-4 text-xs sm:text-sm text-white/70">
            o arrastra y suelta aquí un archivo de audio (.mp3, .wav)
          </p>
        </div>

        {/* Mensaje de retención/eliminación automática */}
        <p className="mt-3 text-[11px] sm:text-xs text-white/60 max-w-xl text-center leading-relaxed">
          Por seguridad, los archivos originales y las pistas generadas se
          eliminan automáticamente de nuestros servidores entre 24 y 72 horas
          después del procesamiento.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </section>

      {/* Dashboard + lista */}
      <section className="w-full flex justify-center mt-16 sm:mt-20 pb-24 px-4">
        <div className="w-full max-w-[1117px] space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs sm:text-sm text-white/60">
                Archivos subidos
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold">
                {rows.length}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs sm:text-sm text-white/60">
                Pistas generadas
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold">
                {totalPistas}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs sm:text-sm text-white/60">
                Último procesamiento
              </p>
              <p className="mt-2 text-sm sm:text-lg">
                {ultimoProcesado ? formatDateTime(ultimoProcesado) : "—"}
              </p>
            </div>
          </div>

          {/* Encabezado lista (solo desktop) */}
          <div
            className="hidden sm:grid grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_auto] text-[#e3dddd] text-xs sm:text-sm uppercase tracking-wide px-4 py-2"
            role="row"
          >
            <div>Canción</div>
            <div>Duración / Tamaño</div>
            <div>Procesado</div>
            <div className="text-right">Acciones</div>
          </div>

          {/* Lista */}
          <div className="space-y-3">
            {rows.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/70 rounded-2xl border border-dashed border-white/10 text-sm sm:text-base">
                Aún no has subido archivos. Sube tu primera canción para ver aquí
                el historial.
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id ?? `${row.titulo}-${row.estatus}`}
                  className="flex flex-col sm:grid sm:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_auto] gap-3 sm:gap-4 items-stretch sm:items-center px-4 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                  role="row"
                >
                  {/* Título + fecha */}
                  <div className="w-full">
                    <p className="truncate text-base sm:text-lg font-medium text-white">
                      {row.titulo}
                    </p>
                    <p className="text-[11px] sm:text-xs text-white/50 mt-1">
                      Procesado: {formatDateTime(row.fecha_procesamiento)}
                    </p>
                  </div>

                  {/* Duración / tamaño */}
                  <div className="w-full text-sm text-white/80">
                    <p>{formatSecondsToMSS(row.duracion)}</p>
                    <p className="text-[11px] sm:text-xs text-white/50">
                      {formatMB(row.tamano_mb)}
                    </p>
                  </div>

                  {/* Estatus + #pistas */}
                  <div className="w-full flex flex-col items-start gap-1">
                    <span
                      className={
                        "inline-flex items-center px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium " +
                        (row.estatus === "Procesado"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : row.estatus === "Error"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-yellow-500/20 text-yellow-300")
                      }
                    >
                      {row.estatus}
                    </span>
                    <span className="text-[11px] sm:text-xs text-white/60">
                      Pistas generadas: {row.pistas_count ?? 0}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="w-full flex flex-col sm:flex-row sm:justify-end gap-2">
                    {row.estatus === "Procesado" && (
                      <button
                        onClick={() =>
                          handleGoToDownload(row.id, row.titulo)
                        }
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-200 text-xs sm:text-sm hover:bg-emerald-500/30 w-full sm:w-auto"
                      >
                        Ver pistas
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={!row.id || deletingIds.has(row.id)}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-rose-600/20 text-rose-200 text-xs sm:text-sm hover:bg-rose-600/30 disabled:opacity-50 w-full sm:w-auto"
                    >
                      Eliminar
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
