import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logoapp-1.png"; // ⬅️ ajusta si tu ruta es otra

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link
      to={to}
      className={`text-white text-base transition-opacity ${
        isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  return (
    <header className="sticky top-6 z-50 w-full flex justify-center">
      {/* PILL negro con logo a la izquierda, links al centro y botón a la derecha */}
      <div
        className="w-full max-w-[1065px] h-[60px]
                   bg-black/95 rounded-[27px] px-6
                   flex items-center justify-between
                   shadow-[0_10px_25px_rgba(0,0,0,0.35)] ring-1 ring-white/5"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Melody Unmix"
            className="w-[80px] h-[68px] object-contain"
            draggable="false"
          />
        </div>

        {/* Links centrados */}
        <nav
          aria-label="Primary"
          className="flex items-center gap-16"
        >
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>

        {/* Sign In / Sign up (a la derecha dentro del pill) */}
        <Link
          to="/signin"
          className="rounded-full px-4 py-1.5
                     bg-[#08D9D6] hover:bg-[#08c9c6] active:scale-[0.99]
                     text-[#0E0E0E] font-semibold"
        >
          Sign In/Sign up
        </Link>
      </div>
    </header>
  );
}
