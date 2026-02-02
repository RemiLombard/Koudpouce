/**
 * Référentiel des types de service.
 * Liste courte, fonctionnelle, non "sociale" — validée en phase 3.
 */

export interface ServiceTypeDefinition {
  id: string;
  label: string;
}

/**
 * Liste des types de service autorisés.
 * ID contractuel : ne pas modifier sans migration.
 */
export const SERVICE_TYPES: ServiceTypeDefinition[] = [
  { id: "PORTAGE_AIDE", label: "Porter / déplacer / petit coup de main" },
  { id: "COURSES", label: "Courses / dépôt / récupération" },
  { id: "PLANTES_ANIMAUX", label: "Plantes / garde courte / visite" },
  { id: "ADMINISTRATIF", label: "Aide administrative" },
  { id: "CV_LETTRE", label: "CV / lettre / démarches d'emploi" },
  { id: "INFORMATIQUE_SIMPLE", label: "Informatique simple" },
  { id: "BRICOLAGE_LEGER", label: "Petit bricolage léger" },
  { id: "AUTRE", label: "Autre" },
];

/** Set des IDs valides pour validation rapide. */
export const SERVICE_TYPE_IDS = new Set(SERVICE_TYPES.map((st) => st.id));

/**
 * Vérifie si un ID de type de service est valide.
 */
export function isValidServiceTypeId(id: string): boolean {
  return SERVICE_TYPE_IDS.has(id);
}
