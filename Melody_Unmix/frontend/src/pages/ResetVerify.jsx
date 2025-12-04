// src/pages/ResetVerify.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import AlertCard from "../components/AlertCard";
import { verifyResetCode } from "../lib/api";

const BLOCKS = 6;

export default function ResetVerify() {
  const navigate = useNavigate();
  const location = useLocation();

  // si vienes de ForgotPassword puedes pasar el correo en state
  const presetEmail = location.state?.email ?? "";

  const [email, setEmail] = useState(presetEmail);
  const [parts, setParts] = useState(Array(BLOCKS).fill(""));
  const [submitting, setSubmitting] = useState(false);

  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [okOpen, setOkOpen] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  const inputsRef = useRef([]);

  // si hay presetEmail lo consideramos "bloqueado" (solo lectura)
  const emailLocked = !!presetEmail;

  useEffect(() => {
    // foco en el primer bloque del código
    inputsRef.current[0]?.focus();
  }, []);

  const sanitize = (s) => s.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  const onChangeBlock = (idx, v) => {
    const val = sanitize(v);
    setParts((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const onKeyDown = (idx, e) => {
    const val = parts[idx] || "";
    if (e.key === "Backspace" && val.length === 0 && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const onInput = (idx, e) => {
    const val = sanitize(e.currentTarget.value);
    // si el usuario pega más de 1 char en un bloque, repartir
    if (val.length > 1) {
      distributeFrom(idx, val);
    } else {
      setParts((prev) => {
        const copy = [...prev];
        copy[idx] = val;
        return copy;
      });
      if (val && idx < BLOCKS - 1) inputsRef.current[idx + 1]?.focus();
    }
  };

  const onPasteBlocks = (idx, e) => {
    e.preventDefault();
    const text = sanitize(e.clipboardData.getData("text"));
    if (!text) return;
    distributeFrom(idx, text);
  };

  const distributeFrom = (idx, text) => {
    const chars = text.split("");
    setParts((prev) => {
      const copy = [...prev];
      let p = idx;
      for (const c of chars) {
        if (p >= BLOCKS) break;
        copy[p] = c;
        p++;
      }
      return copy;
    });
    // mueve foco al siguiente índice razonable
    const nextIdx = Math.min(idx + text.length, BLOCKS - 1);
    inputsRef.current[nextIdx]?.focus();
  };

  const code = parts.join("-"); // formato CANON: X-G-T-Y-D-T, etc.

  const isReady =
    email.trim().length > 3 && parts.every((p) => p && p.length > 0);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isReady) {
      setErrMsg("Completa tu correo y los 6 bloques del código.");
      setErrOpen(true);
      return;
    }

    setSubmitting(true);
    setErrOpen(false);
    setErrMsg("");
    setOkOpen(false);
    setOkMsg("");

    try {
      const data = await verifyResetCode({ email: email.trim(), code });
      // Espera uid + token desde el backend
      if (data?.uid && data?.token) {
        setOkMsg(
          "Código verificado. Redirigiendo para crear nueva contraseña…"
        );
        setOkOpen(true);
        setTimeout(() => {
          navigate(`/reset-password/${data.uid}/${data.token}`, {
            replace: true,
          });
        }, 900);
      } else {
        throw new Error("Código inválido.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.code ||
        err?.message ||
        "No pudimos validar el código. Inténtalo de nuevo.";
      setErrMsg(
        typeof msg === "string" ? msg : "Error al validar el código."
      );
      setErrOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-signup text-white">
      {/* Loading overlay - Mejorado */}
      {submitting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 px-6 py-6 rounded-2xl bg-gradient-to-br from-black/80 to-black/60 border border-white/20 shadow-2xl backdrop-blur-xl">
            {/* Spinner animado con gradiente */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#08D9D6] border-r-[#08D9D6] animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#08D9D6]/20 to-transparent"></div>
            </div>

            {/* Texto */}
            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-1">
                Validando código...
              </p>
              <p className="text-sm text-white/60">
                Esto tomará solo un momento
              </p>
            </div>
          </div>
        </div>
      )}

      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-20 sm:pb-28">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">
            Verificar código
          </h1>
          <p className="mt-3 text-sm sm:text-lg opacity-90 px-2 sm:px-0">
            Ingresa el correo y el código de 6 bloques que te enviamos.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className={`mx-auto w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 sm:p-8 md:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.35)] ${submitting ? "pointer-events-none opacity-90" : ""
            }`}
        >
          {/* Correo */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs sm:text-sm opacity-90">
              Correo
            </label>
            <input
              id="email"
              type="email"
              placeholder="tucorreo@dominio.com"
              autoComplete="email"
              required
              value={email}
              onChange={
                emailLocked
                  ? undefined // no permitir escribir si viene prellenado
                  : (e) => setEmail(e.target.value)
              }
              readOnly={emailLocked}
              className={`w-full h-11 sm:h-12 rounded-xl px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${emailLocked
                  ? "bg-black/40 border border-white/20 cursor-not-allowed text-white/80"
                  : "bg-black/55 border border-white/10"
                }`}
            />
            {emailLocked && (
              <p className="mt-1 text-xs text-white/60">
                Este es el correo al que enviamos el código.
              </p>
            )}
          </div>

          {/* Código */}
          <div className="mt-6">
            <label className="text-xs sm:text-sm opacity-90">
              Código (6 bloques)
            </label>

            {/* Contenedor para controlar el ancho máximo */}
            <div className="mt-2 max-w-xs sm:max-w-sm md:max-w-md mx-auto">
              <div className="grid grid-cols-6 gap-1.5 sm:gap-3">
                {Array.from({ length: BLOCKS }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    inputMode="text"
                    pattern="[A-Za-z0-9]*"
                    maxLength={1}
                    value={parts[i]}
                    onChange={(e) => onChangeBlock(i, e.target.value)}
                    onInput={(e) => onInput(i, e)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    onPaste={(e) => onPasteBlocks(i, e)}
                    className="
            h-10 sm:h-11
            text-sm sm:text-lg
            text-center tracking-[0.2em] sm:tracking-[0.3em]
            rounded-xl bg-black/55 border border-white/10
            focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70
          "
                    placeholder="-"
                    aria-label={`Bloque ${i + 1} del código`}
                  />
                ))}
              </div>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-white/70 text-center">
              Puedes pegar el código completo en cualquier bloque; se rellenará
              automáticamente.
            </p>
          </div>


          <button
            type="submit"
            disabled={!isReady || submitting}
            className="
              mt-6 w-full sm:w-56 h-11 sm:h-12 rounded-xl
              bg-[#08D9D6] text-[#0e0e0e] font-semibold
              text-sm sm:text-base
              hover:bg-[#08c9c6] active:scale-[0.99]
              disabled:opacity-60
            "
          >
            Validar código
          </button>
        </form>

        {/* Feedback */}
        <AlertCard
          open={okOpen}
          title="Código verificado"
          description={okMsg}
          onClose={() => setOkOpen(false)}
          type="success"
        />
        <AlertCard
          open={errOpen}
          title="No pudimos verificar"
          description={errMsg}
          onClose={() => setErrOpen(false)}
        />
      </main>
    </div>
  );
}
