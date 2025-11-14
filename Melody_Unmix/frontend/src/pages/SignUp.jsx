// src/pages/SignUp.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { register } from "../lib/api";
import AlertCard from "../components/AlertCard";
import { parseDRFError } from "../lib/parseErrors";
import PasswordToggleButton from "../components/PasswordToggleButton";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Reglas de la contraseña
const PWD_RULES = {
  length: { test: (v) => v.length >= 8, label: "Mínimo 8 caracteres" },
  upper: { test: (v) => /[A-Z]/.test(v), label: "Al menos 1 mayúscula (A-Z)" },
  number: { test: (v) => /[0-9]/.test(v), label: "Al menos 1 número (0-9)" },
  special: {
    test: (v) => /[^A-Za-z0-9]/.test(v),
    label: "Al menos 1 caracter especial",
  },
};

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

  // Mostrar/ocultar contraseñas
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // ====== Validaciones en tiempo real ======
  const pwdChecks = useMemo(() => {
    const v = form.contrasena || "";
    return {
      length: PWD_RULES.length.test(v),
      upper: PWD_RULES.upper.test(v),
      number: PWD_RULES.number.test(v),
      special: PWD_RULES.special.test(v),
    };
  }, [form.contrasena]);

  const isPwdValid =
    pwdChecks.length &&
    pwdChecks.upper &&
    pwdChecks.number &&
    pwdChecks.special;
  const passwordsMatch =
    form.contrasena.length > 0 && form.confirmarContrasena.length > 0
      ? form.contrasena === form.confirmarContrasena
      : true; // no marcar error hasta que haya input en confirmación

  const fail = (msg) => {
    setErrMsg(msg);
    setErrOpen(true);
    return false;
  };

  const validateSubmit = () => {
    const nombres = form.nombres.trim();
    const apellidos = form.apellidos.trim();
    const username = form.username.trim();
    const correo = form.correo.trim();
    const pass = form.contrasena;
    const pass2 = form.confirmarContrasena;

    if (!nombres) return fail("El campo Nombre(s) es obligatorio.");
    if (!apellidos) return fail("El campo Apellidos es obligatorio.");
    if (!username) return fail("El nombre de usuario es obligatorio.");
    if (!correo) return fail("El correo es obligatorio.");
    if (!emailRegex.test(correo)) return fail("Ingresa un correo válido.");
    if (!isPwdValid) return fail("La contraseña no cumple con los requisitos.");
    if (pass !== pass2) return fail("Las contraseñas no coinciden.");

    return { nombres, apellidos, username, correo, pass, pass2 };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validateSubmit();
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

      // Éxito: esperar a que el usuario cierre
      setOkMsg(
        "Cuenta creada correctamente. Presiona cerrar para ir a Iniciar sesión."
      );
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

  // Señales visuales
  const showPwdErrorBorder =
    (form.contrasena.length > 0 && !isPwdValid) || fieldErrors.password;
  const showConfirmErrorBorder =
    form.confirmarContrasena.length > 0 && !passwordsMatch;

  // evita pegar en confirmar y copiar/cortar del campo contraseña
  const [confirmPasteWarn, setConfirmPasteWarn] = useState(false);

  const handleConfirmPaste = (e) => {
    e.preventDefault();
    setConfirmPasteWarn(true);
    // Oculta el aviso después de 3s (opcional)
    setTimeout(() => setConfirmPasteWarn(false), 3000);
  };

  const blockEvent = (e) => e.preventDefault(); // útil para onCopy/onCut/onDrop

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-signup text-white">
      {/* Overlay de carga */}
      {submitting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/70 border border-white/10">
            <svg
              className="animate-spin h-5 w-5"
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
            <span>Procesando…</span>
          </div>
        </div>
      )}

      <Header />
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-28">
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-semibold">Crear cuenta</h1>
          <p className="mt-3 text-lg opacity-90">
            Únete a Melody Unmix en segundos
          </p>
        </div>

        <div
          className={`mx-auto w-full max-w-3xl bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.35)] ${
            submitting ? "pointer-events-none opacity-90" : ""
          }`}
        >
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Nombre(s) y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="nombres">
                  Nombre(s)
                </label>
                <input
                  id="nombres"
                  value={form.nombres}
                  onChange={set("nombres")}
                  autoComplete="given-name"
                  required
                  aria-invalid={!!fieldErrors.first_name}
                  className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${
                    fieldErrors.first_name
                      ? "border-rose-400"
                      : "border-white/10"
                  }`}
                />
                {fieldErrors.first_name && (
                  <p className="mt-1 text-sm text-rose-300">
                    {fieldErrors.first_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="apellidos">
                  Apellidos
                </label>
                <input
                  id="apellidos"
                  value={form.apellidos}
                  onChange={set("apellidos")}
                  autoComplete="family-name"
                  required
                  aria-invalid={!!fieldErrors.last_name}
                  className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${
                    fieldErrors.last_name
                      ? "border-rose-400"
                      : "border-white/10"
                  }`}
                  placeholder="Ej. Paterno Materno"
                />
                {fieldErrors.last_name && (
                  <p className="mt-1 text-sm text-rose-300">
                    {fieldErrors.last_name}
                  </p>
                )}
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
                  autoComplete="username"
                  required
                  aria-invalid={!!fieldErrors.username}
                  className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${
                    fieldErrors.username ? "border-rose-400" : "border-white/10"
                  }`}
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-sm text-rose-300">
                    {fieldErrors.username}
                  </p>
                )}
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
                  aria-invalid={!!fieldErrors.email}
                  className={`w-full h-12 rounded-xl bg-black/55 border px-4 focus:outline-none focus:ring-2 focus:ring-[#A87D06]/70 ${
                    fieldErrors.email ? "border-rose-400" : "border-white/10"
                  }`}
                  placeholder="tucorreo@dominio.com"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-rose-300">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Passwords con ojito + validación en vivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contraseña */}
              <div className="space-y-2">
                <label className="text-sm opacity-90" htmlFor="contrasena">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="contrasena"
                    type={showPass1 ? "text" : "password"}
                    value={form.contrasena}
                    onChange={set("contrasena")}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    aria-invalid={showPwdErrorBorder}
                    className={`w-full h-12 rounded-xl bg-black/55 border pr-12 pl-4 focus:outline-none
                                focus:ring-2 focus:ring-[#A87D06]/70
                                ${
                                  showPwdErrorBorder
                                    ? "border-rose-400"
                                    : "border-white/10"
                                }`}
                    placeholder="••••••••"
                    aria-describedby="pwd-req"
                    // 👇 bloquea copiar/cortar/arrastrar
                    onCopy={blockEvent}
                    onCut={blockEvent}
                    onDragStart={blockEvent}
                    onDrop={blockEvent}
                  />
                  <PasswordToggleButton
                    visible={showPass1}
                    onToggle={() => setShowPass1((s) => !s)}
                    disabled={submitting}
                    error={showPwdErrorBorder}
                    className="absolute inset-y-0 right-0 px-3"
                  />
                </div>

                {/* Checklist de requisitos (aria-live para feedback accesible) */}
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

                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-rose-300">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <label
                  className="text-sm opacity-90"
                  htmlFor="confirmarContrasena"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmarContrasena"
                    type={showPass2 ? "text" : "password"}
                    value={form.confirmarContrasena}
                    onChange={set("confirmarContrasena")}
                    autoComplete="new-password"
                    required
                    aria-invalid={showConfirmErrorBorder}
                    className={`w-full h-12 rounded-xl bg-black/55 border pr-12 pl-4 focus:outline-none
                                focus:ring-2 focus:ring-[#A87D06]/70
                                ${
                                  showConfirmErrorBorder
                                    ? "border-rose-400"
                                    : "border-white/10"
                                }`}
                    placeholder="••••••••"
                    // 👇 bloquea pegar, copiar/cortar y drop
                    onPaste={handleConfirmPaste}
                    onDrop={blockEvent}
                    onCopy={blockEvent}
                    onCut={blockEvent}
                  />
                  {/* Aviso accesible cuando intenta pegar */}
                  {confirmPasteWarn && (
                    <p
                      className="mt-1 text-sm text-amber-300"
                      role="status"
                      aria-live="polite"
                    >
                      Por seguridad, no puedes pegar en “Confirmar contraseña”.
                      Escríbela manualmente.
                    </p>
                  )}
                  <PasswordToggleButton
                    visible={showPass2}
                    onToggle={() => setShowPass2((s) => !s)}
                    disabled={submitting}
                    error={showConfirmErrorBorder}
                    className="absolute inset-y-0 right-0 px-3"
                  />
                </div>
                {!passwordsMatch && form.confirmarContrasena.length > 0 && (
                  <p className="mt-1 text-sm text-rose-300" aria-live="polite">
                    Las contraseñas no coinciden.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !isPwdValid || !passwordsMatch}
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

          {/* Card de Éxito: navega a /signin al cerrar */}
          <AlertCard
            open={okOpen}
            title="¡Listo!"
            description={okMsg}
            onClose={() => {
              setOkOpen(false);
              navigate("/signin", {
                replace: true,
                state: { registered: true },
              });
            }}
            type="success"
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
