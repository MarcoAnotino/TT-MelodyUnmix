import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { loginEmail, me } from "../lib/api";
import AlertCard from "../components/AlertCard";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await loginEmail({ email, password, remember });

      await me();
      navigate("/app");
    } catch (err) {
      setErrMsg("Correo o contraseña inválidos.");
      setErrOpen(true)
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
                className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4
                           focus:outline-none focus:ring-2 focus:ring-[#C625D1]/70"
                placeholder="tucorreo@dominio.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm opacity-90">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4
                           focus:outline-none focus:ring-2 focus:ring-[#C625D1]/70"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                {/* input real accesible */}
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                {/* caja custom */}
                <span
                  className="
                  relative h-5 w-5 rounded border border-white/20 bg-black/60
                  grid place-items-center
                  peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#08D9D6]

                  /* palomita con ::before (oculta por defecto) */
                  before:content-[''] before:absolute
                  before:h-[12px] before:w-[7px]
                  before:border-b-[3px] before:border-r-[3px] before:border-[#08D9D6]
                  before:rotate-45
                  before:opacity-0 before:transition

                  /* centrar (ligeramente arriba para compensar la rotación) */
                  before:top-1/2 before:left-1/2
                  before:-translate-x-1/2 before:-translate-y-[58%]

                  /* mostrar palomita al marcar */
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-[#08D9D6] text-[#0e0e0e] font-semibold
                         hover:bg-[#08c9c6] active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>

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
