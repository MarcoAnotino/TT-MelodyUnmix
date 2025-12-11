// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { me, updateProfile } from "../lib/api";
import { useTheme } from "../context/ThemeContext";

export default function Profile() {
  const { theme, setTheme, themeValues, isLight } = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const u = await me();
        if (!mounted) return;

        setFirstName(u.first_name || "");
        setLastName(u.last_name || "");
        setUsername(u.username || "");
        setEmail(u.email || "");

        if (u.avatar_url) {
          setAvatarPreview(u.avatar_url);
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setStatus("error");
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      alert("Solo se permiten archivos de imagen (JPG, PNG, WEBP).");
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setStatus("error");
      alert("La imagen no debe exceder 2 MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarRemoved(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onClearAvatar = () => {
    if (!avatarPreview) return;
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemoved(true);
  };

  const onSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("theme_preference", theme);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (avatarRemoved && !avatarFile) {
        formData.append("clear_avatar", "1");
      }

      const updated = await updateProfile(formData);

      setFirstName(updated.first_name || "");
      setLastName(updated.last_name || "");
      setUsername(updated.username || "");
      setEmail(updated.email || "");

      if (updated.avatar_url) {
        setAvatarPreview(updated.avatar_url);
        setAvatarRemoved(false);
      } else {
        setAvatarPreview(null);
      }

      const storage = localStorage.getItem("access")
        ? localStorage
        : sessionStorage;

      const snapshot = {
        username: updated.username,
        email: updated.email,
        first_name: updated.first_name,
        last_name: updated.last_name,
        avatar_url: updated.avatar_url || null,
        theme_preference: updated.theme_preference || theme,
      };

      storage.setItem("user", JSON.stringify(snapshot));
      window.dispatchEvent(
        new CustomEvent("user:updated", { detail: snapshot })
      );

      setStatus("ok");
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      setStatus("error");
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
      <div className="pt-8" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <header className="flex flex-col gap-2 text-center sm:text-left">
          <h1 className="text-[clamp(24px,6vw,40px)] font-mazzard-h-medium">
            Tu perfil
          </h1>
          <p
            className="text-sm sm:text-base max-w-xl mx-auto sm:mx-0"
            style={{ color: themeValues.textSecondary }}
          >
            Administra tu información básica, tu foto y algunas preferencias
            visuales de Melody Unmix.
          </p>
        </header>

        {initialLoading ? (
          <p
            className="mt-6 text-center sm:text-left"
            style={{ color: themeValues.textSecondary }}
          >
            Cargando perfil…
          </p>
        ) : (
          <section className="mt-8 grid gap-6">
            {/* Bloque: Foto de perfil + datos */}
            <div
              className="rounded-2xl p-5 sm:p-6 space-y-6 backdrop-blur-sm transition-colors duration-300 border"
              style={{
                backgroundColor: themeValues.cardBg,
                borderColor: themeValues.border,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div
                  className="mx-auto sm:mx-0 h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: isLight
                      ? "rgba(0,0,0,0.05)"
                      : "rgba(255,255,255,0.05)",
                    borderColor: themeValues.border,
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="text-xs text-center px-2"
                      style={{ color: themeValues.textSecondary }}
                    >
                      Sin foto
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <p
                    className="text-sm"
                    style={{ color: themeValues.textSecondary }}
                  >
                    Foto de perfil
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                    <label
                      className="inline-flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-xl transition-colors border"
                      style={{
                        backgroundColor: isLight
                          ? "rgba(0,0,0,0.05)"
                          : "rgba(255,255,255,0.1)",
                        borderColor: themeValues.border,
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onAvatarChange}
                      />
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M4 7h3l1.2-2.4A1 1 0 0 1 9.1 4h5.8a1 1 0 0 1 .9.6L17 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <circle
                          cx="12"
                          cy="13"
                          r="3.2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                      </svg>
                      <span>Subir imagen</span>
                    </label>

                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={onClearAvatar}
                        className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-red-400/60 text-red-300 hover:bg-red-500/10"
                      >
                        Eliminar foto actual
                      </button>
                    )}
                  </div>
                  <p
                    className="text-[11px] sm:text-xs"
                    style={{ color: themeValues.textSecondary }}
                  >
                    JPG, PNG o WEBP, máx. 2&nbsp;MB.
                  </p>
                </div>
              </div>

              <div
                className="h-px w-full"
                style={{
                  backgroundColor: isLight
                    ? "rgba(0,0,0,0.08)"
                    : "rgba(255,255,255,0.06)",
                }}
              />

              {/* Datos editables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className="block text-sm"
                  style={{ color: themeValues.textSecondary }}
                >
                  Nombre
                  <input
                    className="mt-2 w-full rounded-xl px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#08D9D6]/60 transition-colors border"
                    style={{
                      backgroundColor: themeValues.inputBg,
                      borderColor: themeValues.border,
                      color: themeValues.textPrimary,
                    }}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Marco Antonio"
                  />
                </label>
                <label
                  className="block text-sm"
                  style={{ color: themeValues.textSecondary }}
                >
                  Apellidos
                  <input
                    className="mt-2 w-full rounded-xl px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#08D9D6]/60 transition-colors border"
                    style={{
                      backgroundColor: themeValues.inputBg,
                      borderColor: themeValues.border,
                      color: themeValues.textPrimary,
                    }}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Jimenez Morales"
                  />
                </label>
                <label
                  className="block text-sm"
                  style={{ color: themeValues.textSecondary }}
                >
                  Usuario
                  <input
                    className="mt-2 w-full rounded-xl px-3 py-2 text-sm sm:text-base outline-none opacity-70 border"
                    style={{
                      backgroundColor: themeValues.inputBg,
                      borderColor: themeValues.border,
                      color: themeValues.textPrimary,
                    }}
                    value={username}
                    disabled
                  />
                </label>
                <label
                  className="block text-sm"
                  style={{ color: themeValues.textSecondary }}
                >
                  Correo
                  <input
                    className="mt-2 w-full rounded-xl px-3 py-2 text-sm sm:text-base outline-none opacity-70 border"
                    style={{
                      backgroundColor: themeValues.inputBg,
                      borderColor: themeValues.border,
                      color: themeValues.textPrimary,
                    }}
                    value={email}
                    disabled
                  />
                </label>
              </div>
            </div>

            {/* Preferencias */}
            <div
              className="rounded-2xl p-5 sm:p-6 backdrop-blur-sm transition-colors duration-300 border"
              style={{
                backgroundColor: themeValues.cardBg,
                borderColor: themeValues.border,
              }}
            >
              <h2 className="text-lg sm:text-xl mb-1 font-mazzard-h-medium text-center sm:text-left">
                Preferencias
              </h2>
              <p
                className="text-xs mb-4 text-center sm:text-left"
                style={{ color: themeValues.textSecondary }}
              >
                Ajusta cómo se ve la interfaz de Melody Unmix en tu dispositivo.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className="block text-sm"
                  style={{ color: themeValues.textSecondary }}
                >
                  Tema
                  <select
                    className="mt-2 w-full rounded-xl px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#08D9D6]/60 transition-colors border"
                    style={{
                      backgroundColor: themeValues.inputBg,
                      borderColor: themeValues.border,
                      color: themeValues.textPrimary,
                    }}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="system">Usar tema del sistema</option>
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Botón de guardado + borrar cuenta */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="w-full sm:w-auto rounded-xl bg-[#08D9D6] text-[#141516] px-6 py-3 font-semibold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm sm:text-base text-center"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                {status === "ok" && (
                  <span className="text-xs sm:text-sm text-emerald-300">
                    Cambios guardados ✓
                  </span>
                )}
                {status === "error" && (
                  <span className="text-xs sm:text-sm text-rose-300">
                    No se pudo guardar, intenta de nuevo
                  </span>
                )}
              </div>

              <div
                className="pt-4 sm:pt-0 sm:pl-6 text-center sm:text-left border-t sm:border-t-0 sm:border-l"
                style={{ borderColor: themeValues.border }}
              >
                <p
                  className="text-[11px] sm:text-xs mb-2"
                  style={{ color: themeValues.textSecondary }}
                >
                  ¿Quieres darte de baja definitivamente?
                </p>
                <Link
                  to="/delete-account"
                  className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-red-300 hover:text-red-200"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Eliminar cuenta
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
