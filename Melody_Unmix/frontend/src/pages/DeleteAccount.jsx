// src/pages/DeleteAccount.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { deleteAccount, logout } from "../lib/api";
import { useTheme } from "../context/ThemeContext";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const { themeValues, isLight } = useTheme();

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
      await logout();
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
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        background: themeValues.background,
        color: themeValues.textPrimary,
      }}
    >
      <Header variant="home" />
      <div className="pt-8 sm:pt-10" />

      <main className="max-w-xl mx-auto px-6 pt-12 sm:pt-16 pb-24">
        <h1
          className="text-[clamp(22px,6vw,34px)] font-mazzard-h-medium"
          style={{ color: "#fca5a5" }} // rojo suave
        >
          Eliminar cuenta
        </h1>
        <p
          className="mt-3 text-sm sm:text-base"
          style={{ color: themeValues.textSecondary }}
        >
          Esta acción es{" "}
          <span className="font-semibold">irreversible</span>. Se eliminarán tus
          datos de acceso y todos los recursos asociados a tu cuenta en Melody
          Unmix.
        </p>

        <div
          className="mt-6 rounded-2xl p-5 sm:p-6 backdrop-blur-sm border"
          style={{
            backgroundColor: isLight
              ? "rgba(248,113,113,0.06)"
              : "rgba(0,0,0,0.55)",
            borderColor: "rgba(248,113,113,0.5)",
          }}
        >
          <p
            className="text-xs sm:text-sm mb-4"
            style={{ color: isLight ? "#991b1b" : "#fecaca" }}
          >
            ⚠ Por seguridad, necesitamos que confirmes tu identidad y que
            confirmes explícitamente que deseas eliminar tu cuenta.
          </p>

          <form className="space-y-4" onSubmit={onSubmit}>
            <label
              className="block text-sm"
              style={{ color: themeValues.textSecondary }}
            >
              Contraseña actual
              <input
                type="password"
                className="mt-2 w-full rounded-xl px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-red-400/70 border"
                style={{
                  backgroundColor: themeValues.inputBg,
                  borderColor: themeValues.border,
                  color: themeValues.textPrimary,
                }}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <label
              className="block text-sm"
              style={{ color: themeValues.textSecondary }}
            >
              Repite tu contraseña
              <input
                type="password"
                className="mt-2 w-full rounded-xl px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-red-400/70 border"
                style={{
                  backgroundColor: themeValues.inputBg,
                  borderColor: themeValues.border,
                  color: themeValues.textPrimary,
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <label
              className="block text-sm"
              style={{ color: themeValues.textSecondary }}
            >
              Escribe{" "}
              <span className="font-semibold">eliminar cuenta</span> para
              confirmar
              <input
                type="text"
                className="mt-2 w-full rounded-xl px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-red-400/70 border"
                style={{
                  backgroundColor: themeValues.inputBg,
                  borderColor: themeValues.border,
                  color: themeValues.textPrimary,
                }}
                placeholder="eliminar cuenta"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                required
              />
            </label>

            {error && (
              <p
                className="text-sm rounded-xl px-3 py-2 border"
                style={{
                  backgroundColor: "rgba(248,113,113,0.12)",
                  color: isLight ? "#b91c1c" : "#fecaca",
                  borderColor: "rgba(248,113,113,0.5)",
                }}
              >
                {error}
              </p>
            )}

            {done && (
              <p
                className="text-sm rounded-xl px-3 py-2 border"
                style={{
                  backgroundColor: "rgba(16,185,129,0.12)",
                  color: isLight ? "#047857" : "#bbf7d0",
                  borderColor: "rgba(16,185,129,0.5)",
                }}
              >
                Tu cuenta ha sido eliminada. Te estamos redirigiendo…
              </p>
            )}

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
                style={{
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                }}
              >
                {saving ? "Eliminando..." : "Eliminar cuenta definitivamente"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="text-sm underline underline-offset-4 text-left"
                style={{ color: themeValues.textSecondary }}
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
