import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function SignIn() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Para conectar el api
      // await api.login({ email, password, remember });
      console.log("login", { email, password, remember });
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
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/60"
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
        </div>
      </main>
    </div>
  );
}
