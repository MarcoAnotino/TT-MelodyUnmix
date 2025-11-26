/** @type {import('tailwindcss').Config} */
module.exports = {
  // Incluye también public/index.html para que el JIT vea todas las clases
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {

      screens: {
        xs: "480px", // se activa a partir de 480px de ancho
      },
      // Gradiente global para poder usar: className="bg-app-gradient"
      backgroundImage: {
        'app-gradient':
          "linear-gradient(180deg, rgba(51,60,78,1) 3%, rgba(37,42,52,1) 49%, rgba(21,21,22,1) 95%)",
      },

      // Contenedor “cápsula” de la navbar
      maxWidth: {
        container: "1065px",
      },
      borderRadius: {
        pill: "27px",
      },

      // Sombra suave usada en cápsulas y tarjetas
      boxShadow: {
        elevated: "0 10px 25px rgba(0,0,0,.35)",
      },

      // Paleta mínima que usamos
      colors: {
        brand: {
          teal: "#08d9d6",
        },
      },

      // Fuentes Mazzard
      fontFamily: {
        // por si quieres setearla como default en <body>
        sans: [
          "Mazzard-MLight",
          "Mazzard-MRegular",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        "mazzard-m": ["Mazzard-MRegular", "sans-serif"],
        "mazzard-m-medium": ["Mazzard-MMedium", "sans-serif"],
        "mazzard-m-semi-bold": ["Mazzard-MSemiBold", "sans-serif"],
        "mazzard-m-light": ["Mazzard-MLight", "sans-serif"],
        "mazzard-h-medium": ["Mazzard-HMedium", "sans-serif"],
      },

      // Animaciones que ya usamos (fade, marquee, shimmer)
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        shimmer: {
          "0%, 90%, 100%": {
            backgroundPosition: "calc(-100% - var(--shimmer-width)) 0",
          },
          "30%, 60%": {
            backgroundPosition: "calc(100% + var(--shimmer-width)) 0",
          },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(calc(-100% - var(--gap)))" },
        },
      },
      animation: {
        "fade-in": "fadeIn 1s ease forwards",
        "fade-up": "fadeUp 1s ease forwards",
        shimmer: "shimmer 8s infinite",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
      },
    },
  },
  plugins: [],
};
