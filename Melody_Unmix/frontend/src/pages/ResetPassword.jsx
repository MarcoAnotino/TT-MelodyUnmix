// src/pages/ResetPassword.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";

const API = process.env.REACT_APP_API_BASE_URL || "";

const isValidUID = (u) => /^[0-9]{6}$/.test(u || "");
const validatePassword = (pw) => {
  const ok = !!pw && pw.length >= 8 && /\d/.test(pw) && /[A-Za-z]/.test(pw);
  return { ok, message: "Mínimo 8 caracteres, incluye letras y números." };
};

export default function ResetPassword() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // "ok" | "error" | null
  const [msg, setMsg] = useState("");

  const uidOk = useMemo(() => isValidUID(uid), [uid]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!uidOk) {
      setStatus("error");
      setMsg("Enlace inválido o expirado. Solicita un nuevo correo.");
      return;
    }
    const v = validatePassword(pw1);
    if (!v.ok) {
      setStatus("error");
      setMsg(v.message);
      return;
    }
    if (pw1 !== pw2) {
      setStatus("error");
      setMsg("Las contraseñas no coinciden.");
      return;
    }

    setSending(true);
    setStatus(null);
    setMsg("");

    try {
      // Ajusta este endpoint a tu backend (PATCH/POST según tu API)
      const res = await fetch(`${API}/api/auth/password-reset/${uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw1 }),
      });

      if (!res.ok) {
        let message = "No pudimos restablecer tu contraseña.";
        try {
          const data = await res.json();
          message = data?.detail || data?.message || message;
        } catch {}
        throw new Error(message);
      }

      setStatus("ok");
      setMsg("¡Listo! Tu contraseña fue actualizada.");
      // Redirige tras 1.2s
      setTimeout(() => navigate("/reset-success", { replace: true }), 1200);
    } catch (err) {
      setStatus("error");
      setMsg(err?.message || "Error inesperado. Inténtalo más tarde.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,rgba(59,13,83,1)_3%,rgba(12,25,48,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      <Header variant="home" />
      <div className="pt-8" />

      <main className="relative z-10 max-w-xl mx-auto px-6 pt-20 pb-28">
        <header className="text-center mb-8">
          <h1 className="text-[clamp(24px,7vw,40px)] font-mazzard-h-medium">
            Restablece tu contraseña
          </h1>
          <p className="mt-2 text-[clamp(14px,4vw,18px)] text-white/80">
            Ingresa una nueva contraseña para tu cuenta.
          </p>
        </header>

        {!uidOk && (
          <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-rose-200">
            El enlace es inválido o ha expirado. Solicita un nuevo correo.
          </div>
        )}

        <section className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,.45)] p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block text-sm text-white/90">
              Nueva contraseña
              <div className="mt-2 flex items-center rounded-xl bg-white/10 border border-white/10 px-3 py-2 focus-within:ring-2 focus-within:ring-teal-300/50">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full bg-transparent text-base md:text-lg outline-none placeholder:text-white/40"
                  placeholder="••••••••"
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="ml-3 text-white/75 hover:text-white text-sm"
                >
                  {showPw ? "Ocultar" : "Ver"}
                </button>
              </div>
              <span className="mt-1 block text-xs text-white/60">
                Mínimo 8 caracteres, incluye letras y números.
              </span>
            </label>

            <label className="block text-sm text-white/90">
              Confirmar contraseña
              <input
                type={showPw ? "text" : "password"}
                className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-base md:text-lg outline-none placeholder:text-white/40 focus:ring-2 focus:ring-teal-300/50"
                placeholder="••••••••"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                minLength={8}
                required
              />
            </label>

            <button
              type="submit"
              disabled={!uidOk || sending}
              className="mt-2 inline-flex items-center justify-center w-full h-12 rounded-xl bg-[#08D9D6] text-[#141516] font-mazzard-m-semi-bold text-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {sending ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>

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

          <div className="mt-6 flex items-center justify-between text-sm">
            <a href="/signin" className="text-white/80 hover:text-white transition">
              Volver a iniciar sesión
            </a>
            <a href="/forgot-password" className="text-white/80 hover:text-white transition">
              Reenviar enlace
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
