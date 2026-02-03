import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * Configuration Tailwind CSS pour Koudpouce
 *
 * Approche 100% Tailwind :
 * - Tous les design tokens (couleurs, fonts, shadows) sont ici
 * - Les styles de base (html, body, headings) via addBase()
 * - Quelques utilitaires custom impossibles à faire autrement (.glass, .bg-gradient-warm)
 * - Les composants Vue (BaseCard, BaseInput, etc.) gèrent leurs propres styles
 */
export default {
  content: [
    "./components/**/*.{vue,ts,js}",
    "./pages/**/*.{vue,ts,js}",
    "./layouts/**/*.{vue,ts,js}",
    "./composables/**/*.{ts,js}",
    "./app.vue",
  ],

  theme: {
    extend: {
      // === COULEURS ===
      colors: {
        // Couleur primaire - Orange chaleureux
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
        },
        // Couleur secondaire - Ambre doré
        secondary: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        // Couleur d'accent - Terracotta (pour les demandes)
        accent: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        // Couleur de fond crème
        background: "#fffbf5",
        surface: "#ffffff",
      },

      // === TYPOGRAPHIE ===
      fontFamily: {
        // Police pour les textes courants - Lato
        sans: [
          "Lato",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        // Police pour les titres - Rubik
        display: [
          "Rubik",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },

      // === BORDER RADIUS ===
      borderRadius: {
        "4xl": "2rem",
      },

      // === OMBRES DOUCES ===
      boxShadow: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
        soft: "0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "soft-md":
          "0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)",
        "soft-lg":
          "0 8px 24px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.04)",
        "soft-xl":
          "0 16px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04)",
        "soft-2xl": "0 24px 60px rgba(0, 0, 0, 0.12)",
        // Ombres colorées (glow)
        "glow-primary": "0 8px 24px rgba(249, 115, 22, 0.2)",
        "glow-accent": "0 8px 24px rgba(239, 68, 68, 0.2)",
      },

      // === ANIMATIONS ===
      animation: {
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "bounce-small":
          "bounce-small 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bounce-small": {
          "0%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-6px)" },
          "60%": { transform: "translateY(-3px)" },
        },
      },

      // === TRANSITIONS ===
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },

  plugins: [
    plugin(function ({ addBase, addUtilities }) {
      // === STYLES DE BASE ===
      addBase({
        // Document
        html: {
          fontFamily:
            'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: "1.5",
          color: "#292524", // stone-800
          backgroundColor: "#fffbf5", // background
          "-webkit-font-smoothing": "antialiased",
          "-moz-osx-font-smoothing": "grayscale",
        },
        body: {
          minHeight: "100vh",
        },
        // Titres avec police display
        "h1, h2, h3, h4, h5, h6": {
          fontFamily:
            'Rubik, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: "700",
          lineHeight: "1.2",
          color: "#1c1917", // stone-900
        },
        // Focus visible
        ":focus-visible": {
          outline: "2px solid #f97316", // primary-500
          outlineOffset: "2px",
        },
        // Scrollbar personnalisée (Webkit)
        "::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "::-webkit-scrollbar-track": {
          background: "#f5f5f4", // stone-100
          borderRadius: "9999px",
        },
        "::-webkit-scrollbar-thumb": {
          background: "#d6d3d1", // stone-300
          borderRadius: "9999px",
        },
        "::-webkit-scrollbar-thumb:hover": {
          background: "#a8a29e", // stone-400
        },
      });

      // === UTILITAIRES CUSTOM ===
      // Uniquement pour les effets impossibles à faire avec les classes Tailwind standard
      addUtilities({
        // Gradient de fond warm
        ".bg-gradient-warm": {
          background:
            "linear-gradient(135deg, #fff7ed 0%, #fffbeb 50%, #fff9f0 100%)",
        },
        // Gradient de texte
        ".text-gradient-primary": {
          background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        // Glassmorphism
        ".glass": {
          background: "rgba(255, 255, 255, 0.8)",
          "backdrop-filter": "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
        },
        ".glass-strong": {
          background: "rgba(255, 255, 255, 0.95)",
          "backdrop-filter": "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
        },
        // Bloquer le scroll (pour modals/menus)
        ".no-scroll": {
          overflow: "hidden !important",
          height: "100% !important",
        },
      });
    }),
  ],
} satisfies Config;
