// Service de géocodage pour Nuxt server

export interface GeocodingResult {
  lat: number;
  lng: number;
  cityName: string;
  postalCode: string;
  departmentCode: string;
  inseeCode: string;
}

function roundCoord(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export async function geocodeAddress(addressRaw: string): Promise<GeocodingResult | null> {
  try {
    const query = encodeURIComponent(addressRaw.trim());
    const url = `https://api-adresse.data.gouv.fr/search/?q=${query}&limit=1`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    const props = feature.properties;
    const coords = feature.geometry?.coordinates;

    if (!coords || coords.length < 2) return null;

    const postalCode: string = props.postcode ?? "";
    const inseeCode: string = props.citycode ?? "";
    const departmentCode = extractDepartmentCode(postalCode, inseeCode);

    if (!departmentCode) return null;

    return {
      lat: roundCoord(coords[1]),
      lng: roundCoord(coords[0]),
      cityName: props.city ?? props.label ?? "",
      postalCode,
      departmentCode,
      inseeCode,
    };
  } catch {
    return null;
  }
}

function extractDepartmentCode(postalCode: string, inseeCode: string): string | null {
  const code = inseeCode || postalCode;
  if (!code || code.length < 2) return null;

  if (code.startsWith("20")) {
    const third = code.charAt(2);
    if (third === "0" || third === "1" || third === "2") return "2A";
    return "2B";
  }

  if (code.startsWith("97") || code.startsWith("98")) {
    return code.substring(0, 3);
  }

  return code.substring(0, 2);
}

export function validateManualFallback(
  fallback: unknown
): { valid: true; cityName: string; departmentCode: string; postalCode?: string } | { valid: false; message: string } {
  if (!fallback || typeof fallback !== "object") {
    return { valid: false, message: "Informations de localisation manquantes." };
  }

  const fb = fallback as Record<string, unknown>;

  if (typeof fb.cityName !== "string" || !fb.cityName.trim()) {
    return { valid: false, message: "Merci de renseigner le nom de la ville." };
  }

  if (typeof fb.departmentCode !== "string" || !fb.departmentCode.trim()) {
    return { valid: false, message: "Merci de renseigner le code du département." };
  }

  const departmentCode = fb.departmentCode.trim();

  if (!/^[0-9]{2,3}[AB]?$/i.test(departmentCode)) {
    return { valid: false, message: "Le code département ne semble pas valide." };
  }

  return {
    valid: true,
    cityName: fb.cityName.trim(),
    departmentCode: departmentCode.toUpperCase(),
    postalCode: typeof fb.postalCode === "string" ? fb.postalCode.trim() : undefined,
  };
}
