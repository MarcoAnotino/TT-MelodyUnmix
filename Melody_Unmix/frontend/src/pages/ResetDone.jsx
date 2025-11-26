// src/pages/ResetDone.jsx
import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function ResetDone() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,rgba(59,13,83,1)_3%,rgba(12,25,48,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      <Header variant="home" />
      <div className="pt-8" />

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-28">
        <section className="mx-auto w-full max-w-md text-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,.45)] px-6 py-10 sm:px-8">
          {/* Iconito de éxito */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/40">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                className="stroke-emerald-300"
                strokeWidth="1.6"
              />
              <path
                d="M8.3 12.4 10.5 14.5 15.7 9.5"
                stroke="rgb(167 243 208)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-[clamp(22px,6vw,32px)] font-mazzard-h-medium">
            ¡Contraseña actualizada!
          </h1>
          <p className="mt-3 text-[clamp(14px,4vw,16px)] text-white/80">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>

          <Link
            to="/signin"
            className="mt-8 inline-flex w-full sm:w-auto justify-center items-center rounded-xl bg-[#08D9D6] text-[#141516] font-mazzard-m-semi-bold text-base sm:text-lg px-6 py-3 hover:brightness-110 active:scale-[0.99] transition"
          >
            Ir a iniciar sesión
          </Link>
        </section>
      </main>
    </div>
  );
}
