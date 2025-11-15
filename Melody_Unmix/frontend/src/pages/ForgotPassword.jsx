// src/pages/ForgotPassword.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AlertCard from "../components/AlertCard";
import { requestPasswordReset } from "../lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.dataset.page = "forgot";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  // feedback
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [okOpen, setOkOpen] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || sending) return;

    setSending(true);
    setErrOpen(false);
    setOkOpen(false);

    try {
      const data = await requestPasswordReset(email.trim());

      if (data?.found === true || data?.status === "sent") {
        setOkMsg(
          "Te enviamos un código de verificación. Continúa para validarlo."
        );
        setOkOpen(true);
        setTimeout(() => {
          navigate("/reset-verify", {
            replace: true,
            state: { email: email.trim() },
          });
        }, 700);
      } else {
        setOkMsg(
          "Si el correo existe, te enviamos un código de verificación."
        );
        setOkOpen(true);
        setTimeout(() => {
          navigate("/reset-verify", {
            replace: true,
            state: { email: email.trim() },
          });
        }, 700);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setErrMsg("Ese correo no se encuentra registrado.");
      } else {
        const detail =
          err?.response?.data?.detail ||
          err?.message ||
          "No pudimos enviar el código. Intenta de nuevo.";
        setErrMsg(detail);
      }
      setErrOpen(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-forgot-password text-white">
      {/* Overlay loading */}
      {sending && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/70 border border-white/10 text-sm sm:text-base">
            <svg
              className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              ></circle>
              <path
                d="M4 12a8 8 0 0 1 8-8"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-90"
              ></path>
            </svg>
            <span>Enviando…</span>
          </div>
        </div>
      )}

      <Header />
      <div className="pt-4 sm:pt-8" />

      <main className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-20 sm:pb-28">
        <header className="text-center mb-8 sm:mb-10 px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-white/80">
            Te enviaremos un código para restablecerla.
          </p>
        </header>

        <section
          className={[
            "bg-black/40 backdrop-blur-md rounded-2xl border border-white/10",
            "shadow-[0_18px_60px_rgba(0,0,0,.45)]",
            "p-5 sm:p-7",
          ].join(" ")}
        >
          <form
            onSubmit={onSubmit}
            className={`space-y-4 sm:space-y-5 ${
              sending ? "pointer-events-none opacity-90" : ""
            }`}
          >
            <label
              htmlFor="fp-email"
              className="block text-xs sm:text-sm uppercase tracking-widest text-white/70"
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
              autoComplete="email"
              className="
                w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl
                bg-white/10 text-sm sm:text-base text-white
                outline-none ring-0 border border-white/10
                focus:border-teal-300/60 focus:bg-white/12
                placeholder:text-white/40 transition
              "
            />

            <button
              type="submit"
              disabled={sending || !email}
              className="
                mt-2 inline-flex items-center justify-center
                w-full h-11 sm:h-12 rounded-xl
                bg-[#08D9D6] text-[#141516] font-semibold
                text-sm sm:text-base
                hover:brightness-110
                disabled:opacity-60 disabled:cursor-not-allowed
                transition
              "
            >
              {sending ? "Enviando..." : "Enviar código"}
            </button>
          </form>

          {/* Feedback */}
          <AlertCard
            open={okOpen}
            title="Revisa tu correo"
            description={okMsg}
            onClose={() => setOkOpen(false)}
            type="success"
          />
          <AlertCard
            open={errOpen}
            title="No pudimos enviar el código"
            description={errMsg}
            onClose={() => setErrOpen(false)}
          />

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
            <Link
              to="/signin"
              className="text-white/80 hover:text-white transition"
            >
              Volver a iniciar sesión
            </Link>
            <Link
              to="/signup"
              className="text-white/80 hover:text-white transition"
            >
              Crear cuenta
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
