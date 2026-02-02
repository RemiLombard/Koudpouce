// Configuration principale de Nuxt 3
export default defineNuxtConfig({
  // Modules utilisés : Tailwind pour le CSS et Google Fonts pour les polices
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/google-fonts"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Fichier CSS global avec nos variables et classes custom
  css: ["~/assets/css/main.css"],

  // Config des polices : Rubik pour les titres, Lato pour le texte
  googleFonts: {
    families: {
      Rubik: [500, 600, 700],
      Lato: [400, 700],
    },
    display: "swap",
    prefetch: true,
    preconnect: true,
  },

  // URL du backend (peut être changée via variable d'environnement)
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "http://localhost:3001",
    },
  },

  // On met le code source dans app/ pour mieux organiser
  srcDir: "app/",

  dir: {
    public: "../public",
  },

  // Proxy pour éviter les problèmes CORS en développement
  nitro: {
    devProxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
