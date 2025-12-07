// src/lib/api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

// Cliente con interceptores y credenciales (cookies)
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

// Cliente "base" sin interceptores (para refresh, evita loops)
const base = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

// ---------- Helpers de storage (Recordarme on/off) ----------
const getStore = () =>
  localStorage.getItem("persist") === "1" ? localStorage : sessionStorage;

export function setTokens({ access, persist }) {
  // Solo guardamos access. El refresh va en cookie invisible.
  localStorage.removeItem("access");
  sessionStorage.removeItem("access");

  // Flag para elegir storage persistente o de sesión
  localStorage.setItem("persist", persist ? "1" : "0");

  const store = persist ? localStorage : sessionStorage;
  store.setItem("access", access);
}

export function clearTokens() {
  localStorage.removeItem("persist");
  localStorage.removeItem("access");
  sessionStorage.removeItem("access");
}

function readToken(key) {
  // solo leemos 'access'
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

// ---------- Logout global: limpia y avisa a la app ----------
export async function logout() {
  try {
    // Llamar al backend para borrar cookie
    await base.post("/api/users/auth/logout/");
  } catch (e) {
    console.error("Logout error", e);
  } finally {
    clearTokens();
    window.dispatchEvent(new Event("app:logout"));
  }
}

// ---------- Interceptor: pega access en cada request ----------
api.interceptors.request.use((config) => {
  const access = readToken("access");
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// ---------- Interceptor: refresh único con cola ----------
let refreshing = null;
let waiters = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    // Evita intentar refresh en endpoints de auth para no ciclar
    const isAuthEndpoint =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/login-email") ||
      original?.url?.includes("/auth/logout") || // Importante
      original?.url?.includes("/auth/refresh");

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      if (!refreshing) {
        refreshing = (async () => {
          // Ya no necesitamos leer "refresh" del storage, va en cookie
          // Usa el cliente base SIN interceptores, y con credenciales
          const r = await base.post("/api/users/auth/refresh/");
          const store = getStore();
          store.setItem("access", r.data.access);
          return r.data.access;
        })()
          .then((access) => {
            waiters.forEach((w) => w.resolve(access));
            waiters = [];
            return access;
          })
          .catch((e) => {
            waiters.forEach((w) => w.reject(e));
            waiters = [];
            logout(); // emite evento y limpia
            throw e;
          })
          .finally(() => {
            refreshing = null;
          });
      }

      // Espera a que el refresh termine
      const token = await new Promise((resolve, reject) =>
        waiters.push({ resolve, reject })
      );
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }

    return Promise.reject(error);
  }
);

// ---------- Endpoints de autenticación ----------
export async function loginEmail({ email, password, remember }) {
  const { data } = await api.post("/api/users/auth/login-email/", {
    email,
    password,
  });
  // Data solo trae "access" y "user", el refresh está en cookie.
  setTokens({ access: data.access, persist: remember });
  return data;
}

export async function register(payload) {
  const { data } = await api.post("/api/users/auth/register/", payload);
  return data;
}

export async function me() {
  const { data } = await api.get("/api/users/me/");
  return data;
}

export async function updateProfile(formData) {
  const { data } = await api.patch("/api/users/me/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

// ---------- Endpoints de verificación de email ----------
// Enviar (o reenviar) código de verificación de email
export async function sendEmailVerificationCode(email) {
  const { data } = await api.post("/api/users/auth/email-verify/send/", { email });
  return data;
}

// Verificar código de verificación de email
export async function verifyEmailCode({ email, code }) {
  const { data } = await api.post("/api/users/auth/email-verify/verify/", { email, code });
  return data;
}

// ---------- Endpoints de Reseteo de contraseña ----------
// Solicitar envío del código (ya lo llamas en ForgotPassword)
export async function requestPasswordReset(email) {
  const { data } = await api.post("/api/users/auth/password-reset/", { email });
  return data; // { found: true, status: "message" } 
}

// Verificar el código de 6 bloques: retorna uid y token
export async function verifyResetCode({ email, code }) {
  const { data } = await api.post("/api/users/auth/password-reset/verify/", { email, code });
  return data; // { uid, token }
}

// Confirmar reseteo con uid + token + nueva contraseña
export async function resetPasswordConfirm({ uid, token, new_password, re_new_password }) {
  const { data } = await api.post("/api/users/auth/password-reset/confirm/", {
    uid, token, new_password, re_new_password
  });
  return data; // { ok: true, message: ... }
}

export async function deleteAccount(payload) {
  // payload: { current_password, confirm_password, phrase }
  const { data } = await api.post("/api/users/delete-account/", payload);
  return data;
}
