import React from "react";
import { X } from "lucide-react"; // opcional

const GRADIENTS = {
  // Anima: morado (AudioMessageError / QueryMessageError)
  brand: "bg-[linear-gradient(180deg,rgba(114,3,106,1)_3%,rgba(10,19,35,1)_49%,rgba(21,21,22,1)_95%)]",
  // Anima: rojo (SizeMessageError)
  danger: "bg-[linear-gradient(180deg,rgba(114,3,5,1)_3%,rgba(10,19,35,1)_49%,rgba(21,21,22,1)_95%)]",
};

export default function ErrorModal({
  open,
  title,
  message,
  onClose,
  variant = "brand", // "brand" | "danger"
  width = 500,
  height = 300,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      {/* Card */}
      <div
        className="relative mx-4 w-full max-w-sm rounded-[34px] shadow-[0px_0px_100px_-20px_#d9d9d940]"
        style={{ width, height }}
      >
        <div className={`h-full w-full rounded-[34px] p-6 ${GRADIENTS[variant]}`}>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="mb-2 text-xl font-semibold text-white">{title}</h2>
            <p className="mb-6 px-4 text-sm text-white/80">{message}</p>
            <button
              onClick={onClose}
              className="rounded-full bg-[#23E5DB] px-8 py-2 font-semibold text-[#0C1930] shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#23E5DB]"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
