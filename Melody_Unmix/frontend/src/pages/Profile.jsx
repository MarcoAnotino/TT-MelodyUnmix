// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { me } from "../lib/api";

export default function Profile() {
  const [name, setName] = useState("Usuario");
  const [email, setEmail] = useState("");
  const [theme, setTheme] = useState("system"); // system | light | dark

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // "ok" | "error" | null

  // 👇 Nuevo: manejo de avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null); // URL para mostrar

  // Cargar datos reales del usuario al montar
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const u = await me();
        if (!mounted) return;

        const fullName =
          (u.first_name || u.last_name)
            ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
            : (u.username || "Usuario");

        setName(fullName);
        setEmail(u.email || "");

        // Si en el backend luego expones algo como "avatar_url", lo usas aquí:
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

  // Cuando el usuario selecciona una nueva imagen
  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    // Creamos un preview local (data URL)
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      // TODO: cuando tengas endpoint real, algo así:
      // const formData = new FormData();
      // formData.append("name", name);
      // formData.append("theme", theme);
      // if (avatarFile) formData.append("avatar", avatarFile);
      // await api.patch("/api/users/me/", formData, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });

      // Por ahora solo simulamos:
      await new Promise((r) => setTimeout(r, 600));

      setStatus("ok");
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(51,60,78,1)_3%,rgba(37,42,52,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      <Header variant="home" />
      <div className="pt-8" />

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <h1 className="text-[clamp(24px,7vw,40px)] font-mazzard-h-medium">
          Tu perfil
        </h1>

        {initialLoading ? (
          <p className="mt-6 text-white/70">Cargando perfil…</p>
        ) : (
          <section className="mt-8 grid gap-6">
            {/* Bloque: Foto de perfil + datos */}
            <div className="rounded-2xl bg-black/30 border border-white/10 p-6 space-y-6">
              {/* Foto de perfil */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-white/60 text-center px-2">
                      Sin foto
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-white/80">Foto de perfil</p>
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10">
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
                  <p className="text-xs text-white/60">
                    JPG o PNG, máx. 2&nbsp;MB.
                  </p>
                </div>
              </div>

              {/* Datos */}
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block text-sm text-white/80">
                  Nombre
                  <input
                    className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="block text-sm text-white/80">
                  Correo
                  <input
                    className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none opacity-70"
                    value={email}
                    disabled
                  />
                </label>
              </div>
            </div>

            {/* Preferencias */}
            <div className="rounded-2xl bg-black/30 border border-white/10 p-6">
              <h2 className="text-xl mb-4">Preferencias</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block text-sm text-white/80">
                  Tema
                  <select
                    className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 outline-none"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="system">Sistema</option>
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Botón de guardado */}
            <div className="flex items-center gap-3">
              <button
                onClick={onSave}
                disabled={saving}
                className="rounded-xl bg-[#08D9D6] text-[#141516] px-6 py-3 font-semibold hover:brightness-110 disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              {status === "ok" && (
                <span className="text-emerald-300">Guardado ✓</span>
              )}
              {status === "error" && (
                <span className="text-rose-300">No se pudo guardar</span>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
