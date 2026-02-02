// Liste des types de services disponibles

export default defineEventHandler(() => {
  const serviceTypes = [
    { id: "garde_enfants", label: "Garde d'enfants", icon: "👶" },
    { id: "aide_seniors", label: "Aide aux seniors", icon: "👴" },
    { id: "bricolage", label: "Bricolage", icon: "🔧" },
    { id: "jardinage", label: "Jardinage", icon: "🌱" },
    { id: "courses", label: "Courses", icon: "🛒" },
    { id: "menage", label: "Ménage", icon: "🧹" },
    { id: "transport", label: "Transport / Covoiturage", icon: "🚗" },
    { id: "cuisine", label: "Cuisine / Repas", icon: "🍳" },
    { id: "soutien_scolaire", label: "Soutien scolaire", icon: "📚" },
    { id: "animaux", label: "Garde d'animaux", icon: "🐕" },
    { id: "informatique", label: "Aide informatique", icon: "💻" },
    { id: "demenagement", label: "Aide au déménagement", icon: "📦" },
    { id: "autre", label: "Autre", icon: "✨" },
  ];

  return { serviceTypes };
});
