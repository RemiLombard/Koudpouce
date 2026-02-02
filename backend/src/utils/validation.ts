/**
 * Fonctions de validation des entrées utilisateur.
 * Règles simples, messages humains et bienveillants.
 */

import { isValidServiceTypeId } from "../models/ServiceType";

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Valide une adresse email (format basique).
 */
export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== "string" || !email.trim()) {
    return { valid: false, message: "Merci de renseigner une adresse email." };
  }
  // Regex simple pour validation basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      valid: false,
      message: "Cette adresse email ne semble pas valide.",
    };
  }
  return { valid: true };
}

/**
 * Valide un mot de passe (min 6 caractères).
 */
export function validatePassword(password: unknown): ValidationResult {
  if (typeof password !== "string" || !password) {
    return { valid: false, message: "Merci de choisir un mot de passe." };
  }
  if (password.length < 6) {
    return {
      valid: false,
      message: "Le mot de passe doit contenir au moins 6 caractères.",
    };
  }
  return { valid: true };
}

/**
 * Valide un displayName (min 2 caractères, max 50).
 */
export function validateDisplayName(displayName: unknown): ValidationResult {
  if (typeof displayName !== "string" || !displayName.trim()) {
    return {
      valid: false,
      message: "Merci de renseigner un nom ou un prénom.",
    };
  }
  const trimmed = displayName.trim();
  if (trimmed.length < 2) {
    return {
      valid: false,
      message: "Le nom doit contenir au moins 2 caractères.",
    };
  }
  if (trimmed.length > 50) {
    return {
      valid: false,
      message: "Le nom ne doit pas dépasser 50 caractères.",
    };
  }
  return { valid: true };
}

// ============================================================
// VALIDATION ANNONCES
// ============================================================

/**
 * Valide le type d'annonce.
 */
export function validateListingType(type: unknown): ValidationResult {
  if (type !== "demande" && type !== "proposition") {
    return {
      valid: false,
      message: 'Merci de choisir entre "demande" et "proposition".',
    };
  }
  return { valid: true };
}

/**
 * Valide le titre d'une annonce (5-100 caractères).
 */
export function validateListingTitle(title: unknown): ValidationResult {
  if (typeof title !== "string" || !title.trim()) {
    return {
      valid: false,
      message: "Merci de renseigner un titre pour votre annonce.",
    };
  }
  const trimmed = title.trim();
  if (trimmed.length < 5) {
    return {
      valid: false,
      message: "Le titre doit contenir au moins 5 caractères.",
    };
  }
  if (trimmed.length > 100) {
    return {
      valid: false,
      message: "Le titre ne doit pas dépasser 100 caractères.",
    };
  }
  return { valid: true };
}

/**
 * Valide la description d'une annonce (10-2000 caractères).
 */
export function validateListingDescription(
  description: unknown,
): ValidationResult {
  if (typeof description !== "string" || !description.trim()) {
    return {
      valid: false,
      message: "Merci de décrire votre besoin ou votre proposition.",
    };
  }
  const trimmed = description.trim();
  if (trimmed.length < 10) {
    return {
      valid: false,
      message: "La description doit contenir au moins 10 caractères.",
    };
  }
  if (trimmed.length > 2000) {
    return {
      valid: false,
      message: "La description ne doit pas dépasser 2000 caractères.",
    };
  }
  return { valid: true };
}

/**
 * Valide les types de service (min 1, tous valides).
 */
export function validateServiceTypeIds(
  serviceTypeIds: unknown,
): ValidationResult {
  if (!Array.isArray(serviceTypeIds) || serviceTypeIds.length === 0) {
    return {
      valid: false,
      message: "Merci de choisir au moins un type de service.",
    };
  }

  for (const id of serviceTypeIds) {
    if (typeof id !== "string" || !isValidServiceTypeId(id)) {
      return { valid: false, message: `Type de service invalide : ${id}` };
    }
  }

  return { valid: true };
}

/**
 * Valide l'adresse (champ requis).
 */
export function validateAddress(address: unknown): ValidationResult {
  if (typeof address !== "string" || !address.trim()) {
    return { valid: false, message: "Merci de renseigner une adresse." };
  }
  if (address.trim().length < 5) {
    return { valid: false, message: "L'adresse semble trop courte." };
  }
  return { valid: true };
}

/**
 * Valide un rayon de recherche (1 à 100 km).
 */
export function validateRadius(radiusKm: unknown): ValidationResult {
  if (typeof radiusKm !== "number" || radiusKm < 1 || radiusKm > 100) {
    return { valid: false, message: "Le rayon doit être entre 1 et 100 km." };
  }
  return { valid: true };
}
