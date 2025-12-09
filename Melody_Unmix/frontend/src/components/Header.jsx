import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoDark from "../assets/images/logoapp-1.png";
import logoLight from "../assets/images/logoMU_Black.png";
import { me, logout } from "../lib/api";
import { useTheme } from "../context/ThemeContext";

function NavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block whitespace-nowrap text-sm sm:text-base transition-opacity ${isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
        }`}
    >
      {children}
    </Link>
  );
}

function hasAccessToken() {
  return !!sessionStorage.getItem("access") || !!localStorage.getItem("access");
}

function readStoredUser() {
  // Si no hay token válido, ignoramos cualquier "user" guardado
  if (!hasAccessToken()) return null;

  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Header({ variant = "default" }) {
  const navigate = useNavigate();
  const { themeValues, isLight, initializeFromUser } = useTheme();

  const [user, setUser] = useState(() => {
    // Limpieza defensiva: si no hay access, borra cualquier user colgado
    if (!hasAccessToken()) {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      return null;
    }
    return readStoredUser();
  });

  const [menuOpen, setMenuOpen] = useState(false); // menú del avatar
  const [mobileNavOpen, setMobileNavOpen] = useState(false); // menú hamburguesa
  const menuRef = useRef(null);

  // 🔹 Estado: ¿estamos en desktop? (>= sm ≈ 640px)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 640;
  });

  // 🔹 Solo desktop: control de "estoy arriba"
  const [isAtTop, setIsAtTop] = useState(true);

  // Listener de resize para actualizar isDesktop
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sólo aplicamos la animación de scroll en desktop
  useEffect(() => {
    if (!isDesktop) {
      // en móvil: siempre visible
      setIsAtTop(true);
      return;
    }

    const onScroll = () => setIsAtTop(window.scrollY <= 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDesktop]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
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
        if (mounted) {
          setUser(u);

          // Initialize theme from user's preference
          if (u.theme_preference) {
            initializeFromUser(u.theme_preference);
          }

          const storage = localStorage.getItem("access")
            ? localStorage
            : sessionStorage;
          storage.setItem(
            "user",
            JSON.stringify({
              username: u.username,
              email: u.email,
              first_name: u.first_name,
              last_name: u.last_name,
              avatar_url: u.avatar_url || null,
              theme_preference: u.theme_preference || "system",
            })
          );
        }
      } catch {
        if (mounted) setUser(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initializeFromUser]);

  useEffect(() => {
    const handler = (e) => {
      const updated = e.detail;
      if (!updated) return;

      setUser((prev) => ({
        ...(prev || {}),
        ...updated,
      }));

      const storage = localStorage.getItem("access")
        ? localStorage
        : sessionStorage;
      storage.setItem("user", JSON.stringify(updated));
    };

    window.addEventListener("user:updated", handler);
    return () => window.removeEventListener("user:updated", handler);
  }, []);

  // 🔹 Listener para LOGOUT (para limpiar estado inmediatamente)
  useEffect(() => {
    const onLogoutEvent = () => {
      setUser(null);

      // Asegurar limpieza visual de menús
      setMenuOpen(false);
      setMobileNavOpen(false);

      // Limpieza extra por si acaso
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
    };

    window.addEventListener("app:logout", onLogoutEvent);
    return () => window.removeEventListener("app:logout", onLogoutEvent);
  }, []);

  const onLogout = async () => {
    await logout();
    // La función logout() ya dispara "app:logout",
    // pero por redundancia limpiamos aquí también para UX instantánea.
    setUser(null);
    setMenuOpen(false);
    setMobileNavOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const onStorage = (e) => {
      // Solo nos interesan cambios en access, user o persist
      if (!["access", "user", "persist"].includes(e.key)) return;

      if (!hasAccessToken()) {
        // Ya no hay token => considerar usuario deslogueado
        setUser(null);
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
        setMenuOpen(false);
        setMobileNavOpen(false);
      } else {
        // Hay token => reintenta leer user del storage
        const stored = readStoredUser();
        setUser(stored);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Use theme-aware background colors
  const pillBg = variant === "home" ? themeValues.navBg : themeValues.navBgAlt;
  const logoSrc = isLight ? logoLight : logoDark;

  const closeMobileAndGo = (path) => {
    setMobileNavOpen(false);
    navigate(path);
  };

  // 🔹 Clases del header: animación SOLO en desktop
  const headerClasses = [
    "sticky top-3 sm:top-6 z-50 w-full flex justify-center transition-all duration-300",
  ];

  if (isDesktop) {
    headerClasses.push(
      isAtTop
        ? "opacity-100 translate-y-0 pointer-events-auto"
        : "opacity-0 -translate-y-4 pointer-events-none"
    );
  } else {
    // móvil: siempre visible
    headerClasses.push("opacity-100 translate-y-0 pointer-events-auto");
  }

  return (
    <header className={headerClasses.join(" ")}>
      <div
        className={[
          "relative",
          "w-full max-w-[1065px] h-[56px] sm:h-[60px]",
          "rounded-[24px] sm:rounded-[27px]",
          "px-4 sm:px-6 mx-3 sm:mx-4",
          "flex items-center justify-between gap-3",
          "shadow-[0_10px_25px_rgba(0,0,0,0.35)]",
          "backdrop-blur-md",
          "transition-colors duration-300",
        ].join(" ")}
        style={{
          backgroundColor: pillBg,
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: themeValues.border,
          color: themeValues.textPrimary,
        }}
      >
        {/* Izquierda: logo + botón móvil */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => closeMobileAndGo("/")}
            className="flex items-center gap-2"
          >
            <img
              src={logoSrc}
              alt="Melody Unmix"
              className="w-12 h-10 sm:w-[80px] sm:h-[68px] object-contain"
              draggable="false"
            />
          </button>

          {/* Botón hamburguesa solo en móvil */}
          <button
            type="button"
            className="flex sm:hidden flex-col items-center justify-center w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 gap-[3px]"
            onClick={() => setMobileNavOpen((s) => !s)}
            aria-label="Abrir menú de navegación"
            style={{
              backgroundColor: themeValues.cardBg,
            }}
          >
            <span
              className="block w-4 h-[2px] rounded-full"
              style={{ backgroundColor: themeValues.textPrimary }}
            />
            <span
              className="block w-4 h-[2px] rounded-full"
              style={{ backgroundColor: themeValues.textPrimary }}
            />
            <span
              className="block w-4 h-[2px] rounded-full"
              style={{ backgroundColor: themeValues.textPrimary }}
            />
          </button>
        </div>

        {/* Navegación central: solo desktop/tablet (>= sm) */}
        <nav
          aria-label="Primary"
          className="
            hidden sm:flex
            items-center justify-center
            gap-6 md:gap-10 lg:gap-16
            text-sm sm:text-base
            overflow-x-auto
          "
        >
          {!user && <NavLink to="/">Inicio</NavLink>}
          {!user && <NavLink to="/about">Nosotros</NavLink>}
          {user && <NavLink to="/app">Mis archivos</NavLink>}
          {user && <NavLink to="/profile">Mi perfil</NavLink>}
        </nav>

        {/* Derecha */}
        {!user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/signin"
              className="
                rounded-full px-3 py-1.5 sm:px-4 sm:py-1.5
                bg-[#08D9D6] hover:bg-[#08c9c6] active:scale-[0.99]
                text-[#0E0E0E] text-xs sm:text-sm font-semibold
                whitespace-nowrap
              "
            >
              Inicia sesión
            </Link>
            <Link
              to="/signup"
              className="
                rounded-full px-3 py-1.5 sm:px-4 sm:py-1.5
                bg-white/10 hover:bg-white/15 active:scale-[0.99]
                text-white text-xs sm:text-sm font-semibold
                ring-1 ring-white/10
                whitespace-nowrap
              "
              style={{
                backgroundColor: themeValues.inputBg,
                color: themeValues.textPrimary,
                borderColor: themeValues.border,
              }}
            >
              Regístrate
            </Link>
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="
                rounded-full pl-2 pr-2 py-1.5 sm:py-2
                flex items-center gap-2
                transition-colors
              "
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              style={{
                backgroundColor: themeValues.cardBg,
                color: themeValues.textPrimary,
                border: `1px solid ${themeValues.border}`,
              }}
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username || "Avatar"}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/20"
                  draggable="false"
                />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
                    fill="#08D9D6"
                  />
                </svg>
              )}

              <span className="max-w-[120px] sm:max-w-none truncate text-xs sm:text-sm">
                Hola, {user.username || "Usuario"}
              </span>

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className={`transition ${menuOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M7 10l5 5 5-5"
                  fill="none"
                  stroke={themeValues.textPrimary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="
                  absolute right-0 mt-2 w-40 sm:w-44
                  rounded-xl shadow-xl overflow-hidden
                  text-sm
                "
                style={{
                  backgroundColor: themeValues.navBgAlt,
                  border: `1px solid ${themeValues.border}`,
                  color: themeValues.textPrimary,
                }}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5"
                  role="menuitem"
                  style={{ color: themeValues.textPrimary }}
                >
                  Perfil
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/app");
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5"
                  role="menuitem"
                  style={{ color: themeValues.textPrimary }}
                >
                  Mis archivos
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5"
                  role="menuitem"
                  style={{ color: "#fecaca" }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}

        {/* Panel de navegación móvil */}
        {mobileNavOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 sm:hidden">
            <div
              className="mx-3 rounded-2xl border shadow-xl p-4 space-y-3 text-sm"
              style={{
                backgroundColor: themeValues.navBgAlt,
                borderColor: themeValues.border,
                color: themeValues.textPrimary,
              }}
            >
              {!user && (
                <>
                  <NavLink to="/" onClick={() => setMobileNavOpen(false)}>
                    Inicio
                  </NavLink>
                  <NavLink to="/about" onClick={() => setMobileNavOpen(false)}>
                    Nosotros
                  </NavLink>
                </>
              )}
              {user && (
                <>
                  <NavLink to="/app" onClick={() => setMobileNavOpen(false)}>
                    Mis archivos
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Mi perfil
                  </NavLink>
                </>
              )}

              <div className="border-t pt-3 mt-2 flex flex-col gap-2" style={{ borderColor: themeValues.border }}>
                {!user ? (
                  <>
                    <button
                      onClick={() => closeMobileAndGo("/signin")}
                      className="w-full rounded-xl py-2 font-semibold"
                      style={{
                        backgroundColor: "#08D9D6",
                        color: "#0e0e0e",
                      }}
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => closeMobileAndGo("/signup")}
                      className="w-full rounded-xl py-2 font-semibold"
                      style={{
                        backgroundColor: themeValues.inputBg,
                        color: themeValues.textPrimary,
                      }}
                    >
                      Crear cuenta
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onLogout}
                    className="w-full rounded-xl py-2 font-semibold"
                    style={{
                      backgroundColor: "rgba(248,113,113,0.15)",
                      color: "#fecaca",
                    }}
                  >
                    Cerrar sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
