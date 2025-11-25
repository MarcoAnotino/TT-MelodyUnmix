// src/App.js
import React, {
  useLayoutEffect,
  useRef,
  useEffect,
  useState,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import ScrollReveal from "scrollreveal";

// Páginas públicas
import Home from "./pages/Home";
import About from "./pages/About";
// Páginas autenticadas
import UserScreen from "./pages/UserScreen";
import UploadedScreen from "./pages/UploadedScreen";
import Profile from "./pages/Profile";
// Páginas de autenticación
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetDone from "./pages/ResetDone";
import ResetVerify from "./pages/ResetVerify";
import DeleteAccount from "./pages/DeleteAccount";

// ---------- Guard de ruta protegida ----------
function isAuthed() {
  // Revisa sessionStorage primero (puede tener el access refrescado),
  // luego localStorage (persistente).
  const access =
    sessionStorage.getItem("access") ?? localStorage.getItem("access");
  return Boolean(access);
}

function ProtectedRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/signin" replace />;
}

/**
 * AppLayout con ScrollReveal + fade global
 */
function AppLayout({ children }) {
  const { pathname } = useLocation();
  const initedRef = useRef(false);
  const srRef = useRef(null);

  // Para el fade-in global por ruta
  const [visible, setVisible] = useState(false);

  // ScrollReveal (solo movimiento, sin ocultar contenido)
  useLayoutEffect(() => {
    document.documentElement.classList.add("sr-ready");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Crear instancia solo una vez
    if (!initedRef.current) {
      const sr = ScrollReveal({
        distance: "24px", // movimiento un poco más notorio
        duration: 900, // animación más lenta
        easing: "cubic-bezier(0.22,0.61,0.36,1)",
        reset: false,
        mobile: true,
        viewFactor: 0.05,
        viewOffset: { top: 80, bottom: 0 },
      });

      srRef.current = sr;
      initedRef.current = true;
    }

    const sr = srRef.current;
    if (!sr) return;

    // Limpiar reveals anteriores para poder reanimar en cada ruta
    sr.clean("header.sticky");
    sr.clean("main, section");

    // Header: sin fade raro
    sr.reveal("header.sticky", {
      distance: "0px",
      duration: 400,
      opacity: 1,
    });

    // Contenido principal: solo movimiento, SIN dejar opacity en 0
    sr.reveal("main, section", {
      origin: "bottom",
      interval: 120,
      opacity: 1, // importante: nunca los deja invisibles
    });

    // Recalcular elementos
    sr.sync();
    // Forzar un "scroll" para que procese lo que ya está en pantalla
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("scroll"));
    });
  }, [pathname]);

  // Fade global por ruta (controlado por React, no por ScrollReveal)
  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      className={`transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Auth */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Petición + confirmación de reseteo */}
          <Route path="/reset-verify" element={<ResetVerify />} />
          <Route
            path="/reset-password/:uid/:token"
            element={<ResetPassword />}
          />
          <Route path="/reset-done" element={<ResetDone />} />

          <Route path="/delete-account" element={<DeleteAccount />} />

          {/* Área autenticada */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <UserScreen />
              </ProtectedRoute>
            }
          />

          {/* Detalle/descargas */}
          <Route path="/tracks/:id" element={<UploadedScreen />} />

          {/* Compatibilidad nombre anterior */}
          <Route path="/UploadedScreen/:id" element={<UploadedScreen />} />
          <Route
            path="/UploadedScreen"
            element={<Navigate to="/app" replace />}
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
