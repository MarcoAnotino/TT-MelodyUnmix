// src/pages/DeleteAccount.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { deleteAccount, logout } from "../lib/api";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (currentPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (phrase.trim().toLowerCase() !== "eliminar cuenta") {
      setError('Debes escribir exactamente: "eliminar cuenta".');
      return;
    }

    try {
      setSaving(true);
      await deleteAccount({
        current_password: currentPassword,
        confirm_password: confirmPassword,
        phrase,
      });

      // Limpia sesión en frontend
      logout();
      setDone(true);

      // Redirige al home tras un pequeño delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        "No se pudo eliminar la cuenta. Revisa tu contraseña e intenta de nuevo.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(51,60,78,1)_3%,rgba(37,42,52,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      <Header variant="home" />
      <div className="pt-8 sm:pt-10" />

      <main className="max-w-xl mx-auto px-6 pt-12 sm:pt-16 pb-24">
        <h1 className="text-[clamp(22px,6vw,34px)] font-mazzard-h-medium text-red-300">
          Eliminar cuenta
        </h1>
        <p className="mt-3 text-sm sm:text-base text-white/70">
          Esta acción es{" "}
          <span className="font-semibold">irreversible</span>. Se eliminarán tus
          datos de acceso y todos los recursos asociados a tu cuenta en Melody
          Unmix.
        </p>

        <div className="mt-6 rounded-2xl bg-black/50 border border-red-500/40 p-5 sm:p-6 backdrop-blur-sm">
          <p className="text-xs sm:text-sm text-red-200 mb-4">
            ⚠ Por seguridad, necesitamos que confirmes tu identidad y que
            confirmes explícitamente que deseas eliminar tu cuenta.
          </p>

          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm text-white/80">
              Contraseña actual
              <input
                type="password"
                className="mt-2 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400/70"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <label className="block text-sm text-white/80">
              Repite tu contraseña
              <input
                type="password"
                className="mt-2 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400/70"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <label className="block text-sm text-white/80">
              Escribe{" "}
              <span className="font-semibold">eliminar cuenta</span> para
              confirmar
              <input
                type="text"
                className="mt-2 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400/70"
                placeholder="eliminar cuenta"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                required
              />
            </label>

            {error && (
              <p className="text-sm text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {done && (
              <p className="text-sm text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-2">
                Tu cuenta ha sido eliminada. Te estamos redirigiendo…
              </p>
            )}

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-red-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? "Eliminando..." : "Eliminar cuenta definitivamente"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="text-sm text-white/70 hover:text-white underline underline-offset-4 text-left"
              >
                Cancelar y volver al perfil
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
