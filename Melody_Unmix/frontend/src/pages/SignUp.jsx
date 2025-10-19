import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function SignUp() {
  const [form, setForm] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    username: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.contrasena !== form.confirmarContrasena) {
      alert("Las contraseñas no coinciden");
      return;
    }
    setSubmitting(true);
    try {
      // Aqui se conectaria con el API para registrar al usuario
      console.log("signup", form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-signup text-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-28">
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-semibold">Crear cuenta</h1>
          <p className="mt-3 text-lg opacity-90">
            Únete a Melody Unmix en segundos
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Nombres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="nombre">
                  Nombre
                </label>
                <input
                  id="nombre"
                  value={form.nombre}
                  onChange={set("nombre")}
                  required
                  className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4
                             focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="apellidoPaterno">
                  Apellido paterno
                </label>
                <input
                  id="apellidoPaterno"
                  value={form.apellidoPaterno}
                  onChange={set("apellidoPaterno")}
                  required
                  className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4
                             focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm opacity-90" htmlFor="apellidoMaterno">
                  Apellido materno
                </label>
                <input
                  id="apellidoMaterno"
                  value={form.apellidoMaterno}
                  onChange={set("apellidoMaterno")}
                  required
                  className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4
                             focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70"
                />
              </div>
            </div>

            {/* Usuario & correo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="username">
                  Usuario
                </label>
                <input
                  id="username"
                  value={form.username}
                  onChange={set("username")}
                  required
                  className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4
                             focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="correo">
                  Correo
                </label>
                <input
                  id="correo"
                  type="email"
                  value={form.correo}
                  onChange={set("correo")}
                  autoComplete="email"
                  required
                  className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4
                             focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70"
                  placeholder="tucorreo@dominio.com"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="contrasena">
                  Contraseña
                </label>
                <input
                  id="contrasena"
                  type="password"
                  value={form.contrasena}
                  onChange={set("contrasena")}
                  required
                  minLength={8}
                  className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4
                             focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70"
                  placeholder="••••••••"
                  aria-describedby="pwd-req"
                />
                <p id="pwd-req" className="text-xs text-white/70">
                  Mínimo 8 caracteres, incluye mayúscula, número y carácter especial.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="confirmarContrasena">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmarContrasena"
                  type="password"
                  value={form.confirmarContrasena}
                  onChange={set("confirmarContrasena")}
                  required
                  className="w-full h-12 rounded-xl bg-black/55 border border-white/10 px-4
                             focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-56 h-12 rounded-xl bg-[#08D9D6] text-[#0e0e0e] font-semibold
                         hover:bg-[#08c9c6] active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "Creando cuenta..." : "Registrarse"}
            </button>

            <p className="text-center text-sm text-white/80">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/signin"
                className="text-[#08D9D6] hover:opacity-90 underline underline-offset-4"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
