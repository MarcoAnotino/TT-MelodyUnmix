// src/App.js
import React, { useLayoutEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
  const access = sessionStorage.getItem("access") ?? localStorage.getItem("access");
  return Boolean(access);
}

function ProtectedRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/signin" replace />;
}

/**
 * AppLayout con ScrollReveal
 */
function AppLayout({ children }) {
  const { pathname } = useLocation();
  const initedRef = useRef(false);
  const srRef = useRef(null);

  useLayoutEffect(() => {
    document.documentElement.classList.add("sr-ready");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (!initedRef.current) {
      try {
        srRef.current = ScrollReveal({
          distance: "16px",
          duration: 500,
          easing: "ease-out",
          reset: false,
          mobile: true,
          viewFactor: 0,
          viewOffset: { top: 80, bottom: 0 },
        });

        const sr = srRef.current;
        sr.reveal("header.sticky", { distance: "0px", duration: 300 });
        sr.reveal("main, section", { origin: "bottom", interval: 80 });

        sr.sync();
        initedRef.current = true;
      } catch (e) {
        console.error("ScrollReveal init error:", e);
      }
    } else {
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
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Auth */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Petición + confirmación de reseteo */}
          <Route path="/reset-verify" element={<ResetVerify />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
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

          {/* Detalle/descargas (puede ser pública o protegida, tú decides).
              Si debe ser privada, envuélvela en <ProtectedRoute> igual que /app */}
          <Route path="/tracks/:id" element={<UploadedScreen />} />

          {/* Compatibilidad nombre anterior */}
          <Route path="/UploadedScreen/:id" element={<UploadedScreen />} />
          <Route path="/UploadedScreen" element={<Navigate to="/app" replace />} />

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
