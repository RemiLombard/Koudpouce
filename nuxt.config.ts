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
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
    },
  },

  // SEO global
  app: {
    head: {
      htmlAttrs: { lang: "fr" },
      title: "Koudpouce - Entraide locale entre voisins",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Koudpouce est une plateforme gratuite d'entraide entre voisins. Proposez ou demandez de l'aide près de chez vous : bricolage, jardinage, courses, garde d'animaux et plus.",
        },
        {
          name: "keywords",
          content:
            "entraide, voisins, aide locale, services gratuits, bricolage, jardinage, courses, garde animaux, communauté, solidarité",
        },
        { name: "author", content: "Koudpouce" },
        { name: "robots", content: "index, follow" },
        // Open Graph
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Koudpouce" },
        {
          property: "og:title",
          content: "Koudpouce - Entraide locale entre voisins",
        },
        {
          property: "og:description",
          content:
            "Plateforme gratuite d'entraide entre voisins. Proposez ou demandez de l'aide près de chez vous.",
        },
        { property: "og:image", content: "/og-image.png" },
        { property: "og:locale", content: "fr_FR" },
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Koudpouce - Entraide locale entre voisins",
        },
        {
          name: "twitter:description",
          content:
            "Plateforme gratuite d'entraide entre voisins. Proposez ou demandez de l'aide près de chez vous.",
        },
        // Theme
        { name: "theme-color", content: "#f97316" },
        { name: "msapplication-TileColor", content: "#f97316" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "mask-icon", href: "/favicon.svg", color: "#f97316" },
        { rel: "canonical", href: "https://koudpouce.fr" },
      ],
    },
  },
});
