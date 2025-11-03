// src/pages/Profile.jsx
import React, { useState } from "react";
import Header from "../components/Header";

export default function Profile() {
  const [name, setName] = useState("Usuario");
  const [email] = useState("usuario@dominio.com"); // solo lectura
  const [theme, setTheme] = useState("system"); // system | light | dark
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const onSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      // TODO: POST/PATCH /api/me
      await new Promise(r => setTimeout(r, 600));
      setStatus("ok");
    } catch {
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
        <h1 className="text-[clamp(24px,7vw,40px)] font-mazzard-h-medium">Tu perfil</h1>

        <section className="mt-8 grid gap-6">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-6">
            <h2 className="text-xl mb-4">Datos</h2>
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

          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-[#08D9D6] text-[#141516] px-6 py-3 font-semibold hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            {status === "ok" && <span className="text-emerald-300">Guardado ✓</span>}
            {status === "error" && <span className="text-rose-300">No se pudo guardar</span>}
          </div>
        </section>
      </main>
    </div>
  );
}
