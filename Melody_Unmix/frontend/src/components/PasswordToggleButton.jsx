// src/components/PasswordToggleButton.jsx
import React from "react";

export default function PasswordToggleButton({
  visible,
  onToggle,
  disabled = false,
  error = false,
  className = "",
}) {
  const label = visible ? "Ocultar contraseña" : "Mostrar contraseña";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => !disabled && onToggle?.()}
      disabled={disabled}
      className={`
        grid place-items-center
        ${error ? "text-rose-300 hover:text-rose-200" : "text-white/80 hover:text-white"}
        ${className}
      `}
    >
      {visible ? (
        // 👁️ ojo abierto
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 5c-5 0-8.5 4.2-9.5 6.1a1.5 1.5 0 0 0 0 1.8C3.5 14.8 7 19 12 19s8.5-4.2 9.5-6.1a1.5 1.5 0 0 0 0-1.8C20.5 9.2 17 5 12 5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle
            cx="12"
            cy="12"
            r="3.2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      ) : (
        // 👁️ ojo tachado
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M3 3l18 18"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M10.6 6.2A8.9 8.9 0 0 1 12 6c5 0 8.5 4.2 9.5 6.1a1.5 1.5 0 0 1 0 1.8c-.57 1.02-2 2.8-4.1 4.2M6.7 8.6C4.8 9.9 3.6 11.5 3 12.1a1.5 1.5 0 0 0 0 1.8C4 15.8 7.5 20 12.5 20c.5 0 1-.03 1.5-.1"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M9.5 12a2.5 2.5 0 0 0 4.2 1.8"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      )}
    </button>
  );
}
