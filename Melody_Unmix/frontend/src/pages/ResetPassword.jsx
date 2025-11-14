// src/pages/ResetPassword.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import PasswordToggleButton from "../components/PasswordToggleButton";
import { resetPasswordConfirm } from "../lib/api";

// Reglas de la contraseña (mismas que SignUp)
const PWD_RULES = {
  length: { test: (v) => v.length >= 8, label: "Mínimo 8 caracteres" },
  upper: { test: (v) => /[A-Z]/.test(v), label: "Al menos 1 mayúscula (A-Z)" },
  number: { test: (v) => /[0-9]/.test(v), label: "Al menos 1 número (0-9)" },
  special: {
    test: (v) => /[^A-Za-z0-9]/.test(v),
    label: "Al menos 1 caracter especial",
  },
};

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // "ok" | "error" | null
  const [msg, setMsg] = useState("");

  // uid + token deben existir
  const uidOk = useMemo(() => !!uid && !!token, [uid, token]);

  // Validaciones de contraseña (igual que en SignUp)
  const pwdChecks = useMemo(() => {
    const v = pw1 || "";
    return {
      length: PWD_RULES.length.test(v),
      upper: PWD_RULES.upper.test(v),
      number: PWD_RULES.number.test(v),
      special: PWD_RULES.special.test(v),
    };
  }, [pw1]);

  const isPwdValid =
    pwdChecks.length &&
    pwdChecks.upper &&
    pwdChecks.number &&
    pwdChecks.special;

  const passwordsMatch = pw1.length > 0 && pw2.length > 0 ? pw1 === pw2 : true;

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!uidOk) {
      setStatus("error");
      setMsg("El enlace es inválido o ha expirado. Solicita un nuevo código.");
      return;
    }

    if (!isPwdValid) {
      setStatus("error");
      setMsg("La contraseña no cumple con los requisitos.");
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
      const data = await resetPasswordConfirm({
        uid,
        token,
        new_password: pw1,
        re_new_password: pw2,
      });

      if (!data?.ok) {
        throw new Error(
          data?.message || "No pudimos restablecer tu contraseña."
        );
      }

      setStatus("ok");
      setMsg("¡Listo! Tu contraseña fue actualizada.");
      // OJO: aquí navegamos a /reset-done (coincide con App.js)
      setTimeout(() => navigate("/reset-done", { replace: true }), 1200);
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
            El enlace es inválido o ha expirado. Solicita un nuevo código.
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
                <PasswordToggleButton
                  visible={showPw}
                  onToggle={() => setShowPw((s) => !s)}
                  disabled={sending}
                  error={false}
                  className="ml-3"
                />
              </div>
            </label>

            {/* Checklist de requisitos */}
            <div className="mt-2 space-y-1 text-xs" aria-live="polite">
              {Object.entries(PWD_RULES).map(([key, rule]) => {
                const ok = pwdChecks[key];
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 ${
                      ok ? "text-green-300" : "text-white/70"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${
                        ok ? "bg-green-300" : "bg-white/30"
                      }`}
                    ></span>
                    <span>{rule.label}</span>
                  </div>
                );
              })}
            </div>

            <label className="block text-sm text-white/90">
              Confirmar contraseña
              <input
                type={showPw ? "text" : "password"}
                className={`mt-2 w-full rounded-xl bg-white/10 border px-3 py-2 text-base md:text-lg outline-none placeholder:text-white/40 focus:ring-2 focus:ring-teal-300/50 ${
                  !passwordsMatch && pw2.length > 0
                    ? "border-rose-400"
                    : "border-white/10"
                }`}
                placeholder="••••••••"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                minLength={8}
                required
              />
              {!passwordsMatch && pw2.length > 0 && (
                <p className="mt-1 text-sm text-rose-300" aria-live="polite">
                  Las contraseñas no coinciden.
                </p>
              )}
            </label>

            <button
              type="submit"
              disabled={!uidOk || sending || !isPwdValid || !passwordsMatch}
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
        </section>
      </main>
    </div>
  );
}
