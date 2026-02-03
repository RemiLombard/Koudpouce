// Configuration principale de Nuxt 3 - Koudpouce
export default defineNuxtConfig({
  // Modules utilisés : Tailwind pour le CSS et Google Fonts pour les polices
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/google-fonts"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Preset Netlify pour le déploiement
  nitro: {
    preset: "netlify",
  },

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

  // Configuration runtime - Supabase + Resend
  runtimeConfig: {
    // Variables privées (côté serveur uniquement)
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
    resendApiKey: process.env.RESEND_API_KEY ?? "",

    // Variables publiques (côté client aussi)
    public: {
      supabaseUrl: process.env.SUPABASE_URL ?? "",
    },
  },
});
