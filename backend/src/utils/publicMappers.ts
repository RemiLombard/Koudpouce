/**
 * Mappers publics.
 * Transforment les données internes en représentations publiques.
 *
 * RÈGLE DE SÉCURITÉ :
 * Toute donnée retournée par l'API DOIT passer par ces mappers.
 * Cela garantit qu'aucun champ privé ne peut fuiter.
 */

import type { ListingInternal } from "../models/Listing";
import { getUserById } from "../models/User";

/**
 * Représentation publique de la localisation d'une annonce.
 * Ne contient JAMAIS addressRaw ni coordonnées.
 */
export interface LocationPublic {
  cityName: string;
  postalCode: string;
  departmentCode: string;
  /** Affichage formaté : "Ville (XX)" */
  display: string;
}

/**
 * Représentation publique de l'auteur d'une annonce.
 * Minimal, non "réseau social".
 */
export interface AuthorPublic {
  id: string;
  displayName: string;
}

/**
 * Représentation publique d'une annonce.
 * Exclut TOUJOURS : addressRaw, geoLatRounded, geoLngRounded.
 */
export interface ListingPublic {
  id: string;
  type: "demande" | "proposition";
  status: "active" | "closed";
  title: string;
  description: string;
  serviceTypeIds: string[];
  cityName: string;
  departmentCode: string;
  authorId: string;
  authorDisplayName: string;
  createdAt: string;
  closedAt: string | null;
  distanceKm?: number; // Distance en km depuis le point de recherche (si applicable)
}

/**
 * Transforme une annonce interne en représentation publique.
 * TOUJOURS utiliser cette fonction pour les réponses API.
 * @param listing - L'annonce à transformer
 * @param distanceKm - Distance optionnelle depuis un point de référence
 */
export function toListingPublic(
  listing: ListingInternal,
  distanceKm?: number,
): ListingPublic {
  const author = getUserById(listing.createdByUserId);

  return {
    id: listing.id,
    type: listing.type,
    status: listing.status,
    title: listing.title,
    description: listing.description,
    serviceTypeIds: listing.serviceTypeIds,
    cityName: listing.cityName,
    departmentCode: listing.departmentCode,
    authorId: listing.createdByUserId,
    authorDisplayName: author?.displayName ?? "Utilisateur inconnu",
    createdAt: listing.createdAt.toISOString(),
    closedAt: listing.closedAt ? listing.closedAt.toISOString() : null,
    ...(distanceKm !== undefined && { distanceKm }),
  };
}

/**
 * Transforme un tableau d'annonces internes en représentations publiques.
 * @param listings - Tableau d'annonces à transformer
 * @param distances - Map optionnelle id->distance pour inclure les distances
 */
export function toListingsPublic(
  listings: ListingInternal[],
  distances?: Map<string, number>,
): ListingPublic[] {
  return listings.map((listing) =>
    toListingPublic(listing, distances?.get(listing.id)),
  );
}
