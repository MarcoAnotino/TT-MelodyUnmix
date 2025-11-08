import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logoapp-1.png";
import { me, logout } from "../lib/api";

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

function hasAccessToken() {
  return !!sessionStorage.getItem("access") || !!localStorage.getItem("access");
}

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 👇 NUEVO: visible solo cuando estás arriba
  const [isAtTop, setIsAtTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setIsAtTop(window.scrollY <= 0);
    onScroll(); // estado inicial por si ya entras scrolleado
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!hasAccessToken()) {
        if (mounted) setUser(null);
        return;
      }
      try {
        const u = await me();
        if (mounted) setUser(u);
      } catch {
        if (mounted) setUser(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onLogout = async () => {
    logout();
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header
      className={[
        "sticky top-6 z-50 w-full flex justify-center transition-all duration-300",
        // 👇 oculto cuando NO está arriba
        isAtTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"
      ].join(" ")}
      aria-hidden={!isAtTop}
    >
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

        {/* Links */}
        <nav aria-label="Primary" className="flex items-center gap-16">
          {!user && <NavLink to="/">Home</NavLink>}
          <NavLink to="/about">About</NavLink>
          {user && <NavLink to="/app">Mis archivos</NavLink>}
        </nav>

        {/* Derecha */}
        {!user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="rounded-full px-4 py-1.5
                         bg-[#08D9D6] hover:bg-[#08c9c6] active:scale-[0.99]
                         text-[#0E0E0E] font-semibold"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full px-4 py-1.5
                         bg-white/10 hover:bg-white/15 active:scale-[0.99]
                         text-white font-semibold ring-1 ring-white/10"
            >
              Sign up
            </Link>
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="bg-[#0c0c0c] rounded-full pl-3 pr-2 py-2 flex items-center gap-2 hover:bg-[#131313]"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" fill="#9AE6B4"/>
              </svg>
              <span className="text-sm sm:text-base text-white/90">
                Hola, {user.username || "Usuario"}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" className={`transition ${menuOpen ? "rotate-180" : ""}`}>
                <path d="M7 10l5 5 5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-44 rounded-xl bg-[#0c0c0c] ring-1 ring-white/10 shadow-xl overflow-hidden"
              >
                <button
                  onClick={() => { setMenuOpen(false); navigate("/app"); }}
                  className="w-full text-left px-4 py-2.5 text-white/90 hover:bg-white/5"
                  role="menuitem"
                >
                  Mis archivos
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2.5 text-red-300 hover:bg-white/5"
                  role="menuitem"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
