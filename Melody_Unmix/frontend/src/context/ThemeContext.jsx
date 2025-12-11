// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const ThemeContext = createContext();

// Definición de los temas con sus colores
export const THEMES = {
    system: {
        label: "Usar tema del sistema",
        background: "linear-gradient(180deg, rgba(51,60,78,1) 3%, rgba(37,42,52,1) 49%, rgba(21,21,22,1) 95%)",
        cardBg: "rgba(0,0,0,0.4)",
        navBg: "rgba(0,0,0,0.9)",
        navBgAlt: "rgba(0,0,0,0.95)",
        border: "rgba(255,255,255,0.1)",
        textPrimary: "#ffffff",
        textSecondary: "rgba(255,255,255,0.7)",
        inputBg: "rgba(255,255,255,0.1)",
    },
    light: {
        label: "Claro",
        background: "linear-gradient(180deg, #f0f4f8 3%, #e2e8f0 49%, #cbd5e1 95%)",
        cardBg: "rgba(255,255,255,0.85)",
        navBg: "rgba(255,255,255,0.95)",
        navBgAlt: "rgba(255,255,255,0.98)",
        border: "rgba(0,0,0,0.1)",
        textPrimary: "#1a202c",
        textSecondary: "rgba(26,32,44,0.7)",
        inputBg: "rgba(0,0,0,0.05)",
    },
    dark: {
        label: "Oscuro",
        background: "linear-gradient(180deg, rgba(51,60,78,1) 3%, rgba(37,42,52,1) 49%, rgba(21,21,22,1) 95%)",
        cardBg: "rgba(0,0,0,0.4)",
        navBg: "rgba(0,0,0,0.9)",
        navBgAlt: "rgba(0,0,0,0.95)",
        border: "rgba(255,255,255,0.1)",
        textPrimary: "#ffffff",
        textSecondary: "rgba(255,255,255,0.7)",
        inputBg: "rgba(255,255,255,0.1)",
    },
};

// Helper: check if user has a valid access token
function hasAccessToken() {
    return !!sessionStorage.getItem("access") || !!localStorage.getItem("access");
}

// Helper: get user-specific localStorage key for theme cache
function getThemeCacheKey() {
    try {
        const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
        if (raw) {
            const user = JSON.parse(raw);
            if (user?.username) {
                return `melody_unmix_theme_${user.username}`;
            }
        }
    } catch {
        // ignore parse errors
    }
    return null;
}

// Helper: read cached theme for current user (or null)
function readCachedTheme() {
    const key = getThemeCacheKey();
    if (!key) return null;
    const saved = localStorage.getItem(key);
    return saved && THEMES[saved] ? saved : null;
}

// Helper: save theme to user-specific cache
function saveCachedTheme(theme) {
    const key = getThemeCacheKey();
    if (key && THEMES[theme]) {
        localStorage.setItem(key, theme);
    }
}

// Helper: clear theme cache (on logout)
function clearThemeCache() {
    // Remove all melody_unmix_theme_* keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("melody_unmix_theme_")) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Also remove the old global key if it exists
    localStorage.removeItem("melody_unmix_theme");
}

export function ThemeProvider({ children }) {
    // Track if user is authenticated
    const [isAuthenticated, setIsAuthenticated] = useState(() => hasAccessToken());

    // Theme state: default to dark for unauthenticated, cached value for authenticated
    const [theme, setThemeState] = useState(() => {
        if (!hasAccessToken()) {
            return "dark"; // Unauthenticated users always get dark
        }
        // Try to read from cache for faster initial render
        return readCachedTheme() || "system";
    });

    // Flag to track if we've initialized from user data
    const initializedFromUser = useRef(false);

    // Function to set theme and update cache
    const setTheme = useCallback((newTheme) => {
        if (THEMES[newTheme]) {
            setThemeState(newTheme);
            if (isAuthenticated) {
                saveCachedTheme(newTheme);
            }
        }
    }, [isAuthenticated]);

    // Function to initialize theme from user data (called after me() succeeds)
    const initializeFromUser = useCallback((themePreference) => {
        if (themePreference && THEMES[themePreference]) {
            setThemeState(themePreference);
            saveCachedTheme(themePreference);
            initializedFromUser.current = true;
        }
    }, []);

    // Listen for logout events to reset to dark theme
    useEffect(() => {
        const onLogout = () => {
            setIsAuthenticated(false);
            setThemeState("dark");
            clearThemeCache();
            initializedFromUser.current = false;
        };

        window.addEventListener("app:logout", onLogout);
        return () => window.removeEventListener("app:logout", onLogout);
    }, []);

    // Listen for login/auth changes (storage events)
    useEffect(() => {
        const onStorage = (e) => {
            if (!["access", "user"].includes(e.key)) return;

            const hasToken = hasAccessToken();
            setIsAuthenticated(hasToken);

            if (!hasToken) {
                // Lost auth: reset to dark
                setThemeState("dark");
                initializedFromUser.current = false;
            } else if (!initializedFromUser.current) {
                // Gained auth: try to read from cache
                const cached = readCachedTheme();
                if (cached) {
                    setThemeState(cached);
                }
            }
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Listen for user:updated events (after login or profile update)
    useEffect(() => {
        const onUserUpdated = (e) => {
            const userData = e.detail;
            if (userData?.theme_preference && THEMES[userData.theme_preference]) {
                setThemeState(userData.theme_preference);
                saveCachedTheme(userData.theme_preference);
                initializedFromUser.current = true;
            }
            setIsAuthenticated(true);
        };

        window.addEventListener("user:updated", onUserUpdated);
        return () => window.removeEventListener("user:updated", onUserUpdated);
    }, []);

    // Obtiene el tema efectivo (resuelve "system" al tema real)
    const getEffectiveTheme = () => {
        // Check token directly to avoid race condition with isAuthenticated state
        const hasToken = hasAccessToken();

        // Unauthenticated users always get dark
        if (!hasToken) {
            return "dark";
        }

        if (theme === "system") {
            // Detectar preferencia del sistema
            if (typeof window !== "undefined" && window.matchMedia) {
                return window.matchMedia("(prefers-color-scheme: light)").matches
                    ? "light"
                    : "dark";
            }
            return "dark";
        }
        return theme;
    };

    const effectiveTheme = getEffectiveTheme();
    const themeValues = THEMES[effectiveTheme];

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                effectiveTheme,
                themeValues,
                isLight: effectiveTheme === "light",
                isAuthenticated,
                initializeFromUser,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme debe usarse dentro de un ThemeProvider");
    }
    return context;
}
