// src/pages/SignIn.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { loginEmail, me } from "../lib/api";
import AlertCard from "../components/AlertCard";
import PasswordToggleButton from "../components/PasswordToggleButton";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // estado de errores
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // si hay un error de auth, resaltamos inputs e icono
  const isAuthError = errOpen; // puedes refinarlo si luego distingues tipos de error

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await loginEmail({ email, password, remember });
      await me();
      navigate("/app");
    } catch (err) {
      setErrMsg("Correo o contraseña inválidos.");
      setErrOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-signin text-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-28">
        {/* título */}
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-semibold">Melody Unmix</h1>
          <p className="mt-3 text-lg opacity-90">
            Inicia sesión para continuar
          </p>
        </div>

        {/* card */}
        <div className="mx-auto w-full max-w-md bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm opacity-90">
                Correo
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={isAuthError}
                className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none
                           focus:ring-2 focus:ring-[#C625D1]/70
                           ${
                             isAuthError ? "border-rose-400" : "border-white/10"
                           }`}
                placeholder="tucorreo@dominio.com"
              />
            </div>

            {/* Password con botón ver/ocultar */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm opacity-90">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={isAuthError}
                  className={`w-full h-12 rounded-xl bg-black/55 border pr-12 pl-4 focus:outline-none
                             focus:ring-2 focus:ring-[#C625D1]/70
                             ${
                               isAuthError
                                 ? "border-rose-400"
                                 : "border-white/10"
                             }`}
                  placeholder="••••••••"
                />

                {/* Botón ojo que cambia de color con error */}
                <PasswordToggleButton
                  visible={showPass}
                  onToggle={() => setShowPass((s) => !s)}
                  disabled={submitting}
                  error={isAuthError}
                  className="absolute inset-y-0 right-0 px-3"
                />
              </div>
            </div>

            {/* Recordarme + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  className="
                    relative h-5 w-5 rounded border border-white/20 bg-black/60
                    grid place-items-center
                    peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#08D9D6]
                    before:content-[''] before:absolute before:h-[12px] before:w-[7px]
                    before:border-b-[3px] before:border-r-[3px] before:border-[#08D9D6]
                    before:rotate-45 before:opacity-0 before:transition
                    before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-[58%]
                    peer-checked:before:opacity-100
                  "
                  aria-hidden
                />
                Recordarme
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-white/80 hover:text-white underline underline-offset-4"
              >
                Olvidé mi contraseña
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-[#08D9D6] text-[#0e0e0e] font-semibold
                         hover:bg-[#08c9c6] active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-white/80 pt-1">
              ¿No tienes cuenta?{" "}
              <Link
                to="/signup"
                className="text-[#08D9D6] hover:opacity-90 underline underline-offset-4"
              >
                Regístrate
              </Link>
            </p>
          </form>

          <AlertCard
            open={errOpen}
            title="No pudimos iniciar sesión"
            description={errMsg}
            onClose={() => setErrOpen(false)}
          />
        </div>
      </main>
    </div>
  );
}
