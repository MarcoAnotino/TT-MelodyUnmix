// src/pages/UploadedScreen.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../lib/api";

// Assets
import image1 from "../assets/images/image-1.png"; // Voz
import image2 from "../assets/images/image-2.png"; // Batería
import image3 from "../assets/images/image-3.png"; // Guitarra
import image4 from "../assets/images/image-4.png"; // Bajo
import image7 from "../assets/images/image-7.png"; // Otros
import image6 from "../assets/images/image-6.png"; // Download All

/** Quita la extensión de un nombre de archivo */
function stripExtension(name = "") {
  return name.replace(/\.[^/.]+$/, "");
}

const STEMS = [
  { key: "vocals", label: "Voz", img: image1 },
  { key: "drums",  label: "Batería", img: image2 },
  { key: "guitar", label: "Guitarra", img: image3 },
  { key: "bass",   label: "Bajo", img: image4 },
  { key: "other",  label: "Otros", img: image7 },
];

const normalizeStatus = (raw) => {
  const s = String(raw || "").toLowerCase();
  if (s.includes("procesado") || s === "processed") return "procesado";
  if (s.includes("error")) return "error";
  return "procesando";
};

export default function UploadedScreen() {
  const { id } = useParams(); // /tracks/:id
  const location = useLocation();
  const navigate = useNavigate();

  const initialTitle = stripExtension(location.state?.title || "Tu canción");
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState("procesando"); // procesando | procesado | error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isReady = status === "procesado";

  const statusBadge = useMemo(() => {
    const base =
      "px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2";
    if (status === "procesado")
      return (
        <span className={`${base} bg-emerald-500/20 text-emerald-300`}>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-300" />
          Listo
        </span>
      );
    if (status === "procesando")
      return (
        <span className={`${base} bg-yellow-500/20 text-yellow-300`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300" />
          </span>
          Procesando…
        </span>
      );
    return (
      <span className={`${base} bg-rose-500/20 text-rose-300`}>
        <span className="inline-block w-2 h-2 rounded-full bg-rose-300" />
        Error
      </span>
    );
  }, [status]);

  // Redirige si falta id
  useEffect(() => {
    if (!id) navigate("/app", { replace: true });
  }, [id, navigate]);

  // Polling inteligente; se detiene en listo/error/401/404
  useEffect(() => {
    if (!id) return;
    let alive = true;
    let delay = 3000;
    let timer;

    const tick = async () => {
      if (!alive) return;
      if (document.hidden) {
        timer = setTimeout(tick, delay);
        return;
      }
      try {
        const { data } = await api.get(`/api/audios/${id}/status`);
        const norm = normalizeStatus(data?.status);
        setStatus(norm);
        if (data?.title) setTitle(stripExtension(data.title));
        setError("");

        if (norm === "procesado" || norm === "error") {
          alive = false;
          return;
        }
        delay = 3000;
      } catch (e) {
        const code = e?.response?.status;
        if (code === 401) {
          setError("Tu sesión expiró. Inicia sesión de nuevo.");
          alive = false;
          return;
        }
        if (code === 404) {
          setError("No encontramos este audio o no te pertenece.");
          alive = false;
          return;
        }
        delay = Math.min(delay + 3000, 15000);
      } finally {
        if (alive) timer = setTimeout(tick, delay);
      }
    };

    tick();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [id]);

  // Descarga usando api (incluye Authorization)
  const handleDownload = async (stemKey) => {
    if (!id || !isReady || loading) return;
  
    setLoading(true);
  
    try {
      const res = await api.get(`/api/audios/${id}/download/${stemKey}`, {
        responseType: "blob",
        // Acepta 404 dentro del try para poder dar mensaje específico
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 404,
      });
  
      if (res.status === 404) {
        alert("No hay pistas disponibles para este audio.");
        return;
      }
  
      const dispo = res.headers["content-disposition"] || "";
      let filename;
      const m = dispo.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
      if (m) {
        filename = decodeURIComponent(m[1] || m[2]);
      } else {
        const ct = (res.headers["content-type"] || "").toLowerCase();
        const isZip = ct.includes("zip") || stemKey === "all";
        const ext = isZip ? "zip" : "wav";
        filename = `${(title || "audio").replace(/\s+/g, "_")}-${stemKey}.${ext}`;
      }
  
      const blobUrl = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error descargando stem:", err);
      const status = err?.response?.status;
      if (status === 401) {
        // En teoría el interceptor ya hizo refresh y reintento;
        // si aún así caemos aquí, es que ya no hay sesión válida.
        alert("Tu sesión expiró. Inicia sesión nuevamente.");
      } else {
        alert("No se pudo descargar este archivo. Verifica que está disponible.");
      }
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };
  


  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(51,60,78,1)_3%,rgba(37,42,52,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      <Header />

      {/* Encabezado canción */}
      <section className="max-w-5xl mx-auto mt-20 sm:mt-16 px-4 sm:px-6">
        <p className="text-[11px] sm:text-sm uppercase tracking-[0.15em] text-white/50 text-center sm:text-left">
          Resultado del procesamiento
        </p>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className="text-[clamp(24px,6vw,40px)] font-semibold text-center sm:text-left">
            {title}
          </h1>
          <div className="flex justify-center sm:justify-start">{statusBadge}</div>
        </div>
        <p className="text-[#e7e7e7] text-[clamp(14px,4.5vw,20px)] mt-4 text-center sm:text-left">
          {isReady
            ? "Tu canción está lista. Descarga las pistas individuales o el paquete completo."
            : "Estamos separando tu canción en stems con nuestra IA. Esto puede tardar unos instantes…"}
        </p>

        {!isReady && !error && (
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 text-xs sm:text-sm text-white/60">
            <div className="w-full sm:w-52 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-white/40 animate-[pulse_1.8s_ease-in-out_infinite]" />
            </div>
            <span>Procesando audio…</span>
          </div>
        )}
      </section>

      <main className="max-w-5xl mx-auto mt-10 sm:mt-12 px-4 sm:px-6 pb-24">
        {/* Grid de stems (circulares) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 sm:gap-x-16 gap-y-10 sm:gap-y-14 place-items-center">
          {STEMS.map((s) => (
            <div key={s.key} className="flex flex-col items-center">
              <button
                disabled={!isReady || loading}
                onClick={() => handleDownload(s.key)}
                className={
                  "rounded-full p-1 sm:p-2 transition-transform " +
                  (isReady && !loading
                    ? "hover:scale-[1.03]"
                    : "opacity-60 grayscale cursor-not-allowed")
                }
                aria-label={`Descargar ${s.label}`}
                title={isReady ? `Descargar ${s.label}` : "Procesando..."}
              >
                <div className="rounded-full bg-black/20 p-2 sm:p-3 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                  <img
                    src={s.img}
                    alt={s.label}
                    className="w-[150px] h-[150px] sm:w-[196px] sm:h-[196px] object-cover rounded-full"
                  />
                </div>
              </button>
              <span className="mt-3 sm:mt-4 text-xl sm:text-2xl font-medium">
                {s.label}
              </span>
              <span className="mt-1 text-xs sm:text-sm text-white/60">
                {isReady ? "Listo para descargar" : "Aún procesando"}
              </span>
            </div>
          ))}

          {/* Download All como un item más del grid */}
          <div className="flex flex-col items-center">
            <button
              disabled={!isReady || loading}
              onClick={() => handleDownload("all")}
              className={
                "relative rounded-full p-1 sm:p-2 transition-transform " +
                (isReady && !loading
                  ? "hover:scale-[1.04]"
                  : "opacity-60 grayscale cursor-not-allowed")
              }
              aria-label="Descargar todos"
              title={isReady ? "Descargar todos" : "Procesando..."}
            >
              <div className="rounded-full bg-black/30 p-2 sm:p-3 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/15">
                <img
                  src={image6}
                  alt="Download All"
                  className="w-[150px] h-[150px] sm:w-[196px] sm:h-[196px] object-cover rounded-full"
                />
              </div>
              {isReady && (
                <span className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-[10px] sm:text-xs bg-emerald-500 text-black font-semibold shadow-lg">
                  ZIP
                </span>
              )}
            </button>
            <span className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold">
              Download All
            </span>
            <span className="mt-1 text-xs sm:text-sm text-white/60 text-center max-w-xs">
              Descarga todas las pistas en un solo archivo .zip
            </span>
          </div>
        </div>

        {/* Botones inferiores */}
        <div className="mt-14 sm:mt-16 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm sm:text-base text-center"
          >
            Regresar
          </button>
          <button
            onClick={() => navigate("/app")}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#3e4070] hover:bg-[#4a4d8a] text-sm sm:text-base text-center"
          >
            Ir a mis archivos
          </button>
        </div>

        {error && (
          <div className="max-w-5xl mx-auto mt-6">
            <div className="px-4 py-3 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-400/20 text-sm sm:text-base">
              {error}{" "}
              <button
                className="underline ml-1"
                onClick={() => navigate("/app")}
              >
                Volver a mis archivos
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
