import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// Assets 
import image1 from "../assets/images/image-1.png"; // Voz
import image2 from "../assets/images/image-2.png"; // Bateria
import image3 from "../assets/images/image-3.png"; // Guitarra
import image4 from "../assets/images/image-4.png"; // Bajo
import image7 from "../assets/images/image-7.png"; // Otros
import image6 from "../assets/images/image-6.png"; // Download All
import logo from "../assets/images/logoapp-1.png";

const STEMS = [
  { key: "vocals",  label: "Voz",       img: image1 },
  { key: "drums",   label: "Bateria",   img: image2 },
  { key: "guitar",  label: "Guitarra",  img: image3 },
  { key: "bass",    label: "Bajo",      img: image4 },
  { key: "other",   label: "Otros",     img: image7 },
];

const API = process.env.REACT_APP_API_BASE_URL || "";

export default function UploadedScreen() {
  const { id } = useParams();                 // /tracks/:id
  const location = useLocation();
  const navigate = useNavigate();

  // Si vienes desde la tabla puedes mandar { state: { title } }
  // Todavia esto esta en desarrollo es mero ejemplo
  const initialTitle = location.state?.title || "Tu canción";
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState("running"); // queued | running | processed | error
  const [loading, setLoading] = useState(false);
  const isReady = status === "processed";

  const statusBadge = useMemo(() => {
    const base = "px-3 py-1 rounded-full text-sm";
    if (status === "processed") return <span className={`${base} bg-emerald-500/20 text-emerald-300`}>Listo</span>;
    if (status === "running" || status === "queued") return <span className={`${base} bg-yellow-500/20 text-yellow-300`}>Procesando…</span>;
    return <span className={`${base} bg-rose-500/20 text-rose-300`}>Error</span>;
  }, [status]);

  // Polling simple del estado
  useEffect(() => {
    let timer;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API}/api/audios/${id}/status`);
        if (!res.ok) throw new Error("status http");
        const data = await res.json();
        setStatus(data.status || "running");
        if (data.title) setTitle(data.title);
      } catch (_) {
        // si falla, deja el estado actual pero reintenta
      } finally {
        timer = setTimeout(fetchStatus, 3000);
      }
    };
    fetchStatus();
    return () => clearTimeout(timer);
  }, [id]);

  const handleDownload = async (stemKey) => {
    setLoading(true);
    try {
      // Abrir en la misma pestaña fuerza descarga del navegador si el header está bien
      window.location.href = `${API}/api/audios/${id}/download/${stemKey}`;
    } finally {
      setTimeout(() => setLoading(false), 600); // feedback rápido
    }
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(51,60,78,1)_3%,rgba(37,42,52,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      {/* Top bar */}
      <header className="w-full flex justify-center pt-6">
        <div className="w-full max-w-[1065px] h-[60px] bg-black rounded-[27px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="logo" className="w-[45px] h-[37px]" />
          </div>
          <nav className="hidden sm:flex items-center gap-16">
            <button onClick={() => navigate("/")} className="text-white text-lg">Home</button>
            <a href="/about" className="text-white text-lg">About</a>
          </nav>
          <div className="bg-[#0c0c0c] rounded-full px-4 py-2 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" fill="#9AE6B4"/>
            </svg>
            <span className="text-sm sm:text-base">Hola, Usuario!</span>
          </div>
        </div>
      </header>

      {/* Título */}
      <section className="max-w-5xl mx-auto mt-16 px-6">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-3xl sm:text-5xl">{title}</h1>
          {statusBadge}
        </div>
        <p className="text-[#e7e7e7] text-xl sm:text-2xl mt-3">
          Tu cancion esta lista, elige que quieres descargar.
        </p>
      </section>

      {/* Grid de descargas */}
      <main className="max-w-5xl mx-auto mt-12 px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-14 place-items-center">
          {STEMS.map((s) => (
            <div key={s.key} className="flex flex-col items-center">
              <button
                disabled={!isReady || loading}
                onClick={() => handleDownload(s.key)}
                className={`rounded-full p-2 transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Descargar ${s.label}`}
                title={isReady ? `Descargar ${s.label}` : "Procesando..."}
              >
                <img src={s.img} alt={s.label} className="w-[196px] h-[196px] object-cover" />
              </button>
              <span className="mt-4 text-2xl">{s.label}</span>
            </div>
          ))}

          {/* Download All */}
          <div className="flex flex-col items-center">
            <button
              disabled={!isReady || loading}
              onClick={() => handleDownload("all")}
              className="rounded-full p-2 transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Descargar todos"
              title={isReady ? "Descargar todos" : "Procesando..."}
            >
              <img src={image6} alt="Download All" className="w-[196px] h-[196px] object-cover" />
            </button>
            <span className="mt-4 text-2xl">Download All</span>
          </div>
        </div>

        {/* Acciones secundarias */}
        <div className="mt-16 flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15"
          >
            Regresar
          </button>
          <button
            onClick={() => navigate("/app")}
            className="px-5 py-2 rounded-xl bg-[#3e4070] hover:bg-[#4a4d8a]"
          >
            Ir a mis archivos
          </button>
        </div>
      </main>
    </div>
  );
}
