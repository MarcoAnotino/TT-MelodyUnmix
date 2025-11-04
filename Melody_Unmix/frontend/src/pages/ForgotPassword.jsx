// src/pages/ForgotPassword.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

const API = process.env.REACT_APP_API_BASE_URL || ""; // p.ej. http://localhost:8000

export default function ForgotPassword() {
  // (opcional) marcar el body para estilos “scoped” por página
  useEffect(() => {
    document.body.dataset.page = "forgot";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // "ok" | "error" | null
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || sending) return;

    setSending(true);
    setStatus(null);
    setMsg("");

    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json().catch(() => ({}));
      setStatus("ok");
      setMsg(
        data?.message ||
          "Si el correo existe, te enviamos un enlace para restablecer tu contraseña."
      );
    } catch (err) {
      setStatus("error");
      setMsg("No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-forgot-password">
      {/* Glows fijos (mismo patrón que Home) */}
      <div className="glow glow-top" />
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      {/* Navbar “Home / About / Sign in | up” */}
      <Header variant="home" />

      {/* separador para no tapar el hero con la navbar */}
      <div className="pt-8" />

      <main className="relative z-10 max-w-xl mx-auto px-6 pt-24 pb-28 text-white">
        {/* Título */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-mazzard-h-medium">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="mt-3 text-lg text-white/80">
            Te enviaremos un enlace para restablecerla.
          </p>
        </header>

        {/* Card del formulario */}
        <section
          className="
            bg-black/40 backdrop-blur-md rounded-2xl border border-white/10
            shadow-[0_18px_60px_rgba(0,0,0,.45)] p-6 sm:p-8
          "
        >
          <form onSubmit={onSubmit} className="space-y-5">
            <label
              htmlFor="fp-email"
              className="block text-sm uppercase tracking-widest text-white/70"
            >
              Correo electrónico
            </label>
            <input
              id="fp-email"
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full h-12 px-4 rounded-xl bg-white/10 text-white
                outline-none ring-0 border border-white/10
                focus:border-teal-300/60 focus:bg-white/12
                placeholder:text-white/40 transition
              "
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={sending}
              className="
                mt-2 inline-flex items-center justify-center w-full h-12
                rounded-xl bg-[#08D9D6] text-[#141516] font-mazzard-m-semi-bold text-lg
                hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed
                transition
              "
            >
              {sending ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>

          {/* Mensajes de estado */}
          {status && (
            <div className="mt-5">
              {status === "ok" ? (
                <p className="px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
                  {msg}
                </p>
              ) : (
                <p className="px-4 py-2 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-400/20">
                  {msg}
                </p>
              )}
            </div>
          )}

          {/* Enlaces secundarios (SPA, sin recargar) */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/signin" className="text-white/80 hover:text-white transition">
              Volver a iniciar sesión
            </Link>
            <Link to="/signup" className="text-white/80 hover:text-white transition">
              Crear cuenta
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
