/**
 * Service de géocodage.
 * Intègre api-adresse.data.gouv.fr et geo.api.gouv.fr.
 *
 * Règles :
 * - Arrondi lat/lng à 3 décimales (≈110m)
 * - Non bloquant : retourne null si échec
 */

/** Résultat du géocodage. */
export interface GeocodingResult {
  /** Latitude arrondie à 3 décimales. */
  lat: number;
  /** Longitude arrondie à 3 décimales. */
  lng: number;
  /** Nom de la commune. */
  cityName: string;
  /** Code postal. */
  postalCode: string;
  /** Code département (ex: "70"). */
  departmentCode: string;
  /** Code INSEE de la commune. */
  inseeCode: string;
}

/**
 * Arrondit une coordonnée à 3 décimales.
 */
function roundCoord(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Géocode une adresse via api-adresse.data.gouv.fr.
 * @param addressRaw Adresse saisie par l'utilisateur.
 * @returns Résultat du géocodage ou null si échec.
 */
export async function geocodeAddress(
  addressRaw: string,
): Promise<GeocodingResult | null> {
  try {
    const query = encodeURIComponent(addressRaw.trim());
    const url = `https://api-adresse.data.gouv.fr/search/?q=${query}&limit=1`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const props = feature.properties;
    const coords = feature.geometry?.coordinates;

    if (!coords || coords.length < 2) {
      return null;
    }

    // Extraire le code département depuis le code postal ou le code INSEE
    const postalCode: string = props.postcode ?? "";
    const inseeCode: string = props.citycode ?? "";
    const departmentCode = extractDepartmentCode(postalCode, inseeCode);

    if (!departmentCode) {
      return null;
    }

    return {
      lat: roundCoord(coords[1]),
      lng: roundCoord(coords[0]),
      cityName: props.city ?? props.label ?? "",
      postalCode,
      departmentCode,
      inseeCode,
    };
  } catch {
    // Erreur réseau ou parsing — on retourne null (non bloquant)
    return null;
  }
}

/**
 * Extrait le code département depuis le code postal ou INSEE.
 * Gère les cas spéciaux (Corse, DOM-TOM).
 */
function extractDepartmentCode(
  postalCode: string,
  inseeCode: string,
): string | null {
  // Utiliser le code INSEE en priorité (plus fiable)
  const code = inseeCode || postalCode;

  if (!code || code.length < 2) {
    return null;
  }

  // Corse : 2A, 2B
  if (code.startsWith("20")) {
    const third = code.charAt(2);
    if (third === "0" || third === "1" || third === "2") {
      return "2A";
    }
    return "2B";
  }

  // DOM-TOM : 3 premiers chiffres
  if (code.startsWith("97") || code.startsWith("98")) {
    return code.substring(0, 3);
  }

  // Métropole : 2 premiers chiffres
  return code.substring(0, 2);
}

/**
 * Valide un fallback manuel de localisation.
 * Vérifie que cityName et departmentCode sont fournis et valides.
 */
export function validateManualFallback(
  fallback: unknown,
):
  | {
      valid: true;
      cityName: string;
      departmentCode: string;
      postalCode?: string;
    }
  | { valid: false; message: string } {
  if (!fallback || typeof fallback !== "object") {
    return {
      valid: false,
      message: "Informations de localisation manquantes.",
    };
  }

  const fb = fallback as Record<string, unknown>;

  if (typeof fb.cityName !== "string" || !fb.cityName.trim()) {
    return { valid: false, message: "Merci de renseigner le nom de la ville." };
  }

  if (typeof fb.departmentCode !== "string" || !fb.departmentCode.trim()) {
    return {
      valid: false,
      message: "Merci de renseigner le code du département.",
    };
  }

  const departmentCode = fb.departmentCode.trim();

  // Validation basique du format département (2-3 caractères)
  if (!/^[0-9]{2,3}[AB]?$/i.test(departmentCode)) {
    return {
      valid: false,
      message: "Le code département ne semble pas valide.",
    };
  }

  return {
    valid: true,
    cityName: fb.cityName.trim(),
    departmentCode: departmentCode.toUpperCase(),
    postalCode:
      typeof fb.postalCode === "string" ? fb.postalCode.trim() : undefined,
  };
}
