// src/pages/ResetDone.jsx
import React from "react";
import Header from "../components/Header";

export default function ResetDone() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,rgba(59,13,83,1)_3%,rgba(12,25,48,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      <Header variant="home" />
      <div className="pt-8" />

      <main className="max-w-xl mx-auto px-6 pt-24 pb-28 text-center">
        <h1 className="text-[clamp(24px,7vw,40px)] font-mazzard-h-medium">
          ¡Contraseña actualizada!
        </h1>
        <p className="mt-3 text-white/80">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <a
          href="/signin"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#08D9D6] text-[#141516] font-mazzard-m-semi-bold text-lg px-6 py-3 hover:brightness-110"
        >
          Ir a iniciar sesión
        </a>
      </main>
    </div>
  );
}
