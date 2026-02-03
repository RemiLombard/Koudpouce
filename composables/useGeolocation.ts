// composable pour gérer la géolocalisation de l'utilisateur
// utilise l'API Geolocation du navigateur

export type GeoStatus =
  | "idle"
  | "pending"
  | "granted"
  | "denied"
  | "unavailable";

export interface GeoPosition {
  lat: number;
  lng: number;
}

// clé pour stocker le consentement en localStorage
const STORAGE_KEY = "koudpouce_geoloc_consent";

// états partagés (réactifs)
const status = ref<GeoStatus>("idle");
const position = ref<GeoPosition | null>(null);
const error = ref<string | null>(null);

export function useGeolocation() {
  function isAvailable(): boolean {
    return typeof navigator !== "undefined" && "geolocation" in navigator;
  }

  function restoreConsent(): void {
    if (!import.meta.client) return;

    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "granted") {
      requestPosition();
    } else if (stored === "denied") {
      status.value = "denied";
    } else {
      status.value = "idle";
    }
  }

  async function requestPosition(): Promise<GeoPosition | null> {
    if (!isAvailable()) {
      status.value = "unavailable";
      error.value =
        "La géolocalisation n'est pas disponible sur votre appareil.";
      return null;
    }

    status.value = "pending";
    error.value = null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          position.value = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          status.value = "granted";
          localStorage.setItem(STORAGE_KEY, "granted");
          resolve(position.value);
        },
        (err) => {
          status.value = "denied";
          localStorage.setItem(STORAGE_KEY, "denied");

          if (err.code === err.PERMISSION_DENIED) {
            error.value = "Vous avez refusé la géolocalisation.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            error.value = "Votre position n'est pas disponible.";
          } else {
            error.value = "Impossible de récupérer votre position.";
          }

          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        },
      );
    });
  }

  function resetConsent(): void {
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY);
    }
    status.value = "idle";
    position.value = null;
    error.value = null;
  }

  return {
    status: readonly(status),
    position: readonly(position),
    error: readonly(error),

    isAvailable,
    restoreConsent,
    requestPosition,
    resetConsent,
  };
}
