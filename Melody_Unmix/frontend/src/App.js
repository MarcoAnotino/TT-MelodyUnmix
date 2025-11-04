// src/App.js
import React, { useLayoutEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollReveal from "scrollreveal";

// Páginas
import Home from "./pages/Home";
import UserScreen from "./pages/UserScreen";
import UploadedScreen from "./pages/UploadedScreen";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";

/**
 * AppLayout:
 * - Inicializa ScrollReveal una sola vez (a prueba de doble render de React 18)
 * - Aplica animaciones globales a header/main/section en cualquier página
 * - Sincroniza en cambios de ruta sin re-registrar
 *
 * ➜ Recuerda añadir en tu CSS global un fallback:
 *   html:not(.sr-ready) main, html:not(.sr-ready) section, html:not(.sr-ready) header.sticky {
 *     opacity: 1 !important; transform: none !important; visibility: visible !important;
 *   }
 */
// App.js (solo el AppLayout)
function AppLayout({ children }) {
  const { pathname } = useLocation();
  const initedRef = useRef(false);
  const srRef = useRef(null);

  useLayoutEffect(() => {
    // Marca listo para que el fail-safe permita ver contenido aun si SR falla
    document.documentElement.classList.add("sr-ready");
  
    // Respeta reduce motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  
    if (!initedRef.current) {
      try {
        srRef.current = ScrollReveal({
          distance: "16px",
          duration: 500,
          easing: "ease-out",
          reset: false,
          mobile: true,
          // Revela aunque apenas toque viewport y considera el header sticky
          viewFactor: 0,
          viewOffset: { top: 80, bottom: 0 },
        });
  
        const sr = srRef.current;
        sr.reveal("header.sticky", { distance: "0px", duration: 300 });
        sr.reveal("main, section", { origin: "bottom", interval: 80 });
  
        // Fuerza un primer sync para que se apliquen inmediatamente
        sr.sync();
        initedRef.current = true;
      } catch (e) {
        console.error("ScrollReveal init error:", e);
      }
    } else {
      // En cada cambio de ruta vuelve a sincronizar
      srRef.current?.sync();
    }
  }, [pathname]);
  return children;
}


export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Área autenticada */}
          <Route path="/app" element={<UserScreen />} />

          {/* Ruta canónica para detalle/descargas */}
          <Route path="/tracks/:id" element={<UploadedScreen />} />

          {/* Compatibilidad con nombre anterior */}
          <Route path="/UploadedScreen/:id" element={<UploadedScreen />} />
          <Route path="/UploadedScreen" element={<Navigate to="/app" replace />} />

          {/* Auth */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
