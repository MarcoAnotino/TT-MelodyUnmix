// src/pages/UserScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api, me } from "../lib/api";
import { validateAudioFile } from "../utils/fileValidation";
import AlertCard from "../components/AlertCard";
import { useTheme } from "../context/ThemeContext";

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
  const { themeValues, isLight } = useTheme();

  const timersRef = useRef({});
  const [rows, setRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);

  const [uploadErrorOpen, setUploadErrorOpen] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

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
          // Metadatos
          artista: x.artist || "Desconocido",
          album: x.album || "Desconocido",
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

  // Verifica si hay alguna canción en proceso
  const hasProcessingAudio = () => {
    return rows.some(
      (r) =>
        r.estatus === "Procesando…" ||
        r.estatus === "Subiendo…" ||
        r.estatus === "Error al subir"
    );
  };

  const handleUploadClick = () => {
    if (hasProcessingAudio() || uploading) {
      return;
    }
    fileInputRef.current?.click();
  };

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
          prev.map((r) =>
            r.id === audioId
              ? {
                ...r,
                estatus: label,
                tamano_mb:
                  data.tamano_mb !== undefined && data.tamano_mb !== null
                    ? data.tamano_mb
                    : r.tamano_mb,
                duracion:
                  data.duracion !== undefined && data.duracion !== null
                    ? data.duracion
                    : r.duracion,
                fecha_procesamiento:
                  data.fecha_procesamiento ?? r.fecha_procesamiento,
                pistas_count:
                  data.pistas_count !== undefined &&
                    data.pistas_count !== null
                    ? data.pistas_count
                    : r.pistas_count,
                // Metadatos
                artista: data.artist || r.artista || "Desconocido",
                album: data.album || r.album || "Desconocido",
              }
              : r
          )
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

    // Verificar si ya hay una canción en proceso
    if (hasProcessingAudio() || uploading) {
      setUploadErrorMsg(
        "Ya tienes una canción en proceso. Por favor espera a que termine antes de subir otra."
      );
      setUploadErrorOpen(true);
      return;
    }

    const validation = validateAudioFile(file);
    if (!validation.ok) {
      setUploadErrorMsg(validation.message);
      setUploadErrorOpen(true);
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
        tamano_mb: tamanoMB,
        pistas_count: 0,
        fecha_procesamiento: null,
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
      setUploadErrorMsg(
        "Error subiendo el archivo. Verifica tu conexión y vuelve a intentar."
      );
      setUploadErrorOpen(true);
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
    if (hasProcessingAudio() || uploading) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    if (hasProcessingAudio() || uploading) {
      return;
    }
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
    if (hasProcessingAudio() || uploading) {
      return;
    }
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    await handleFiles(files);
  };

  async function handleDelete(audioId) {
    if (!audioId) return;

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

  function requestDelete(audioId, title, isCancel = false) {
    if (!audioId) return;
    setPendingDelete({
      id: audioId,
      title,
      mode: isCancel ? "cancel" : "delete",
    });
    setConfirmDeleteOpen(true);
  }

  function handleGoToDownload(audioId, title) {
    if (!audioId) return;
    navigate(`/tracks/${audioId}`, { state: { title } });
  }

  const totalPistas = rows.reduce((acc, r) => acc + (r.pistas_count || 0), 0);

  const ultimoProcesado = rows[0]?.fecha_procesamiento;

  const isProcessing = hasProcessingAudio() || uploading;

  // Estilos para el dropzone según estado y tema
  const getDropZoneStyle = () => {
    let bg = themeValues.cardBg;
    let border = themeValues.border;

    if (isProcessing) {
      bg = isLight ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.35)";
    } else if (isDragging) {
      bg = isLight ? "rgba(8,217,214,0.06)" : "rgba(255,255,255,0.06)";
      border = "#08D9D6";
    }

    return {
      backgroundColor: bg,
      borderColor: border,
    };
  };

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300"
      style={{
        background: themeValues.background,
        color: themeValues.textPrimary,
      }}
    >
      <Header />

      {/* Hero de subida con drag & drop */}
      <section className="w-full flex flex-col items-center mt-20 sm:mt-24 px-4">
        <h1
          className="font-semibold text-[clamp(24px,5vw,32px)] text-center"
          style={{ color: themeValues.textPrimary }}
        >
          Comienza a probar nuestra IA
        </h1>
        <p
          className="text-[clamp(16px,4.5vw,22px)] mt-1 text-center"
          style={{ color: themeValues.textSecondary }}
        >
          Sube tu archivo ahora
        </p>

        <div
          className={[
            "mt-8 w-full max-w-xl rounded-3xl border-2 border-dashed px-4 py-6 sm:px-6 sm:py-8 flex flex-col items-center justify-center text-center transition-all",
            isProcessing
              ? "opacity-60 cursor-not-allowed"
              : isDragging
                ? ""
                : "hover:shadow-lg",
          ].join(" ")}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            ...getDropZoneStyle(),
          }}
        >
          <button
            onClick={handleUploadClick}
            disabled={isProcessing}
            className="w-full sm:w-[205px] h-[46px] sm:h-[49px] flex items-center justify-center rounded-[18px] sm:rounded-[20px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#3e4070",
              color: "#ffffff",
            }}
          >
            <span className="text-base sm:text-xl">
              {uploading
                ? "Subiendo..."
                : isProcessing
                  ? "Procesando..."
                  : "Subir archivo"}
            </span>
          </button>

          <p
            className="mt-4 text-xs sm:text-sm"
            style={{ color: themeValues.textSecondary }}
          >
            {isProcessing
              ? "Espera a que termine el procesamiento actual"
              : "o arrastra y suelta aquí un archivo de audio (.mp3, .wav)"}
          </p>
        </div>

        {/* Mensaje de retención/eliminación automática */}
        <p
          className="mt-3 text-[11px] sm:text-xs max-w-xl text-center leading-relaxed"
          style={{ color: themeValues.textSecondary }}
        >
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
          disabled={isProcessing}
        />
        <AlertCard
          open={uploadErrorOpen}
          title="No pudimos subir tu archivo"
          description={uploadErrorMsg}
          onClose={() => setUploadErrorOpen(false)}
        />
      </section>

      {/* Dashboard + lista */}
      <section className="w-full flex justify-center mt-16 sm:mt-20 pb-24 px-4">
        <div className="w-full max-w-[1117px] space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: themeValues.cardBg,
                borderColor: themeValues.border,
              }}
            >
              <p
                className="text-xs sm:text-sm"
                style={{ color: themeValues.textSecondary }}
              >
                Archivos subidos
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold">
                {rows.length}
              </p>
            </div>
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: themeValues.cardBg,
                borderColor: themeValues.border,
              }}
            >
              <p
                className="text-xs sm:text-sm"
                style={{ color: themeValues.textSecondary }}
              >
                Pistas generadas
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold">
                {totalPistas}
              </p>
            </div>
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: themeValues.cardBg,
                borderColor: themeValues.border,
              }}
            >
              <p
                className="text-xs sm:text-sm"
                style={{ color: themeValues.textSecondary }}
              >
                Último procesamiento
              </p>
              <p className="mt-2 text-sm sm:text-lg">
                {ultimoProcesado ? formatDateTime(ultimoProcesado) : "—"}
              </p>
            </div>
          </div>

          {/* Encabezado lista (solo desktop) */}
          <div
            className="hidden sm:grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] text-xs sm:text-sm uppercase tracking-wide px-4 py-2"
            role="row"
            style={{ color: themeValues.textSecondary }}
          >
            <div>Canción</div>
            <div>Artista / Álbum</div>
            <div>Duración / Tamaño</div>
            <div>Procesado</div>
            <div className="text-right">Acciones</div>
          </div>

          {/* Lista */}
          <div className="space-y-3">
            {rows.length === 0 ? (
              <div
                className="px-4 py-8 text-center text-sm sm:text-base rounded-2xl border border-dashed"
                style={{
                  backgroundColor: themeValues.cardBg,
                  borderColor: themeValues.border,
                  color: themeValues.textSecondary,
                }}
              >
                Aún no has subido archivos. Sube tu primera canción para ver
                aquí el historial.
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id ?? `${row.titulo}-${row.estatus}`}
                  className="flex flex-col sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 sm:gap-4 items-stretch sm:items-center px-4 py-4 rounded-2xl border transition-colors hover:shadow-md"
                  role="row"
                  style={{
                    backgroundColor: themeValues.cardBg,
                    borderColor: themeValues.border,
                  }}
                >
                  {/* Título + fecha */}
                  <div className="w-full">
                    <p className="truncate text-base sm:text-lg font-medium">
                      {row.titulo}
                    </p>
                    <p
                      className="text-[11px] sm:text-xs mt-1"
                      style={{ color: themeValues.textSecondary }}
                    >
                      Procesado: {formatDateTime(row.fecha_procesamiento)}
                    </p>
                  </div>

                  {/* Artista / Álbum */}
                  <div className="w-full text-sm">
                    <p className="font-medium">{row.artista}</p>
                    <p
                      className="text-[11px] sm:text-xs"
                      style={{ color: themeValues.textSecondary }}
                    >
                      {row.album}
                    </p>
                  </div>

                  {/* Duración / tamaño */}
                  <div className="w-full text-sm">
                    <p>{formatSecondsToMSS(row.duracion)}</p>
                    <p
                      className="text-[11px] sm:text-xs"
                      style={{ color: themeValues.textSecondary }}
                    >
                      {formatMB(row.tamano_mb)}
                    </p>
                  </div>

                  {/* Estatus + #pistas */}
                  <div className="w-full flex flex-col items-start gap-1">
                    <span
                      className={
                        "inline-flex items-center px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium " +
                        (row.estatus === "Procesado"
                          ? "bg-emerald-500/20 text-emerald-600"
                          : row.estatus === "Error"
                            ? "bg-rose-500/20 text-rose-600"
                            : "bg-yellow-500/20 text-yellow-700")
                      }
                    >
                      {row.estatus}
                    </span>
                    <span
                      className="text-[11px] sm:text-xs"
                      style={{ color: themeValues.textSecondary }}
                    >
                      Pistas generadas: {row.pistas_count ?? 0}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="w-full flex flex-col sm:flex-row sm:justify-end gap-2">
                    {/* Ver pistas solo cuando ya está procesado */}
                    {row.estatus === "Procesado" && (
                      <button
                        onClick={() =>
                          handleGoToDownload(row.id, row.titulo)
                        }
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs sm:text-sm hover:bg-emerald-500/30 w-full sm:w-auto"
                        style={{
                          backgroundColor: "rgba(16,185,129,0.18)",
                          color: isLight ? "#065f46" : "#bbf7d0",
                        }}
                      >
                        Ver pistas
                      </button>
                    )}

                    {/* Eliminar / Cancelar disponible SIEMPRE que haya id */}
                    <button
                      onClick={() =>
                        requestDelete(
                          row.id,
                          row.titulo,
                          row.estatus === "Procesando…" // <- si está procesando, es cancelar
                        )
                      }
                      disabled={!row.id || deletingIds.has(row.id)}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs sm:text-sm hover:bg-rose-600/30 disabled:opacity-50 w-full sm:w-auto"
                      style={{
                        backgroundColor: "rgba(248,113,113,0.2)",
                        color: isLight ? "#b91c1c" : "#fecaca",
                      }}
                    >
                      {row.estatus === "Procesando…" ? "Cancelar" : "Eliminar"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl"
            style={{
              backgroundColor: themeValues.cardBg,
              borderColor: themeValues.border,
              color: themeValues.textPrimary,
            }}
          >
            {(() => {
              const isCancel = pendingDelete?.mode === "cancel";
              const title = pendingDelete?.title || "esta canción";

              return (
                <>
                  <h2 className="text-lg font-semibold mb-2">
                    {isCancel
                      ? "¿Cancelar procesamiento?"
                      : "¿Eliminar archivo?"}
                  </h2>
                  <p
                    className="text-sm mb-4"
                    style={{ color: themeValues.textSecondary }}
                  >
                    {isCancel ? (
                      <>
                        ¿Seguro que quieres cancelar el procesamiento de{" "}
                        <span
                          className="font-medium"
                          style={{ color: themeValues.textPrimary }}
                        >
                          “{title}”
                        </span>
                        ? El archivo se eliminará de tu historial y podrás
                        volver a subirlo cuando quieras.
                      </>
                    ) : (
                      <>
                        ¿Seguro que quieres eliminar{" "}
                        <span
                          className="font-medium"
                          style={{ color: themeValues.textPrimary }}
                        >
                          “{title}”
                        </span>
                        ? Esta acción no se puede deshacer.
                      </>
                    )}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setConfirmDeleteOpen(false);
                        setPendingDelete(null);
                      }}
                      className="px-4 py-2 rounded-xl text-sm"
                      style={{
                        backgroundColor: themeValues.inputBg,
                        color: themeValues.textPrimary,
                      }}
                    >
                      Volver
                    </button>
                    <button
                      onClick={async () => {
                        const id = pendingDelete?.id;
                        setConfirmDeleteOpen(false);
                        setPendingDelete(null);
                        if (id) await handleDelete(id); // misma lógica para ambos
                      }}
                      className="px-4 py-2 rounded-xl text-sm font-medium"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                      }}
                    >
                      {pendingDelete?.mode === "cancel"
                        ? "Sí, cancelar"
                        : "Eliminar"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
