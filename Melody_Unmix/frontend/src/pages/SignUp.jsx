// src/pages/SignUp.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { register } from "../lib/api";
import AlertCard from "../components/AlertCard";
import { parseDRFError } from "../lib/parseErrors";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    username: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Errores
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Éxito
  const [okOpen, setOkOpen] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const fail = (msg) => { setErrMsg(msg); setErrOpen(true); return false; };

  const validate = () => {
    const nombres   = form.nombres.trim();
    const apellidos = form.apellidos.trim();
    const username  = form.username.trim();
    const correo    = form.correo.trim();
    const pass      = form.contrasena;
    const pass2     = form.confirmarContrasena;

    if (!nombres)   return fail("El campo Nombre(s) es obligatorio.");
    if (!apellidos) return fail("El campo Apellidos es obligatorio.");
    if (!username)  return fail("El nombre de usuario es obligatorio.");
    if (!correo)    return fail("El correo es obligatorio.");
    if (!emailRegex.test(correo)) return fail("Ingresa un correo válido.");
    if (!pass || pass.length < 8) return fail("La contraseña debe tener al menos 8 caracteres.");
    if (pass !== pass2) return fail("Las contraseñas no coinciden.");

    return { nombres, apellidos, username, correo, pass, pass2 };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (!v) return;

    setSubmitting(true);
    setErrOpen(false);
    setErrMsg("");
    setFieldErrors({});
    setOkOpen(false);
    setOkMsg("");

    try {
      await register({
        username: v.username,
        email: v.correo,
        password: v.pass,
        password2: v.pass2,
        rol: "USER",
        first_name: v.nombres,
        last_name: v.apellidos,
      });

      // ✅ Mostrar card de éxito y esperar a que el usuario la cierre
      setOkMsg("Cuenta creada correctamente. Presiona cerrar para ir a Iniciar sesión.");
      setOkOpen(true);
    } catch (err) {
      const { fieldErrors: fe, general } = parseDRFError(err);
      setFieldErrors(fe);
      setErrMsg(general || "Revisa los campos marcados.");
      setErrOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-signup text-white">
      {/* Overlay de carga */}
      {submitting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/70 border border-white/10">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" className="opacity-90"></path>
            </svg>
            <span>Procesando…</span>
          </div>
        </div>
      )}

      <Header />
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-28">
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-semibold">Crear cuenta</h1>
          <p className="mt-3 text-lg opacity-90">Únete a Melody Unmix en segundos</p>
        </div>

        <div className={`mx-auto w-full max-w-3xl bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.35)] ${submitting ? "pointer-events-none opacity-90" : ""}`}>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Nombre(s) y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="nombres">Nombre(s)</label>
                <input
                  id="nombres"
                  value={form.nombres}
                  onChange={set("nombres")}
                  autoComplete="given-name"
                  required
                  aria-invalid={!!fieldErrors.first_name}
                  className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${fieldErrors.first_name ? "border-rose-400" : "border-white/10"}`}
                />
                {fieldErrors.first_name && <p className="mt-1 text-sm text-rose-300">{fieldErrors.first_name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="apellidos">Apellidos</label>
                <input
                  id="apellidos"
                  value={form.apellidos}
                  onChange={set("apellidos")}
                  autoComplete="family-name"
                  required
                  aria-invalid={!!fieldErrors.last_name}
                  className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${fieldErrors.last_name ? "border-rose-400" : "border-white/10"}`}
                  placeholder="Ej. Paterno Materno"
                />
                {fieldErrors.last_name && <p className="mt-1 text-sm text-rose-300">{fieldErrors.last_name}</p>}
              </div>
            </div>

            {/* Usuario & correo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="username">Usuario</label>
                <input
                  id="username"
                  value={form.username}
                  onChange={set("username")}
                  autoComplete="username"
                  required
                  aria-invalid={!!fieldErrors.username}
                  className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${fieldErrors.username ? "border-rose-400" : "border-white/10"}`}
                />
                {fieldErrors.username && <p className="mt-1 text-sm text-rose-300">{fieldErrors.username}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="correo">Correo</label>
                <input
                  id="correo"
                  type="email"
                  value={form.correo}
                  onChange={set("correo")}
                  autoComplete="email"
                  required
                  aria-invalid={!!fieldErrors.email}
                  className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${fieldErrors.email ? "border-rose-400" : "border-white/10"}`}
                  placeholder="tucorreo@dominio.com"
                />
                {fieldErrors.email && <p className="mt-1 text-sm text-rose-300">{fieldErrors.email}</p>}
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="contrasena">Contraseña</label>
                <input
                  id="contrasena"
                  type="password"
                  value={form.contrasena}
                  onChange={set("contrasena")}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  aria-invalid={!!fieldErrors.password || /password/i.test(errMsg)}
                  className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${fieldErrors.password || /password/i.test(errMsg) ? "border-rose-400" : "border-white/10"}`}
                  placeholder="••••••••"
                  aria-describedby="pwd-req"
                />
                <p id="pwd-req" className="text-xs text-white/70">
                  Mínimo 8 caracteres, incluye mayúscula, número y carácter especial.
                </p>
                {fieldErrors.password && <p className="mt-1 text-sm text-rose-300">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="confirmarContrasena">Confirmar contraseña</label>
                <input
                  id="confirmarContrasena"
                  type="password"
                  value={form.confirmarContrasena}
                  onChange={set("confirmarContrasena")}
                  autoComplete="new-password"
                  required
                  className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-56 h-12 rounded-xl bg-[#08D9D6] text-[#0e0e0e] font-semibold hover:bg-[#08c9c6] active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "Creando cuenta..." : "Registrarse"}
            </button>

            <p className="text-center text-sm text-white/80">
              ¿Ya tienes cuenta?{" "}
              <Link to="/signin" className="text-[#08D9D6] hover:opacity-90 underline underline-offset-4">
                Inicia sesión
              </Link>
            </p>
          </form>

          {/* Card de Éxito: navega a /signin al cerrar */}
          <AlertCard
            open={okOpen}
            title="¡Listo!"
            description={okMsg}
            onClose={() => {
              setOkOpen(false);
              navigate("/signin", {
                replace: true,
                state: { registered: true }, // opcional: muestra banner en SignIn
              });
            }}
            type="success" // si tu componente soporta variantes
          />

          {/* Card de Error */}
          <AlertCard
            open={errOpen}
            title="No pudimos crear tu cuenta"
            description={errMsg}
            onClose={() => setErrOpen(false)}
          />
        </div>
      </main>
    </div>
  );
}
