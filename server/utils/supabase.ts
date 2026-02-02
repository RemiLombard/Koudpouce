// Client Supabase pour les server routes Nuxt

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Client Supabase singleton (initialisé au premier appel)
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const config = useRuntimeConfig();

    if (!config.supabaseUrl || !config.supabaseServiceKey) {
      throw new Error("Variables Supabase manquantes! Vérifiez .env");
    }

    _supabase = createClient(
      config.supabaseUrl as string,
      config.supabaseServiceKey as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }
  return _supabase;
}

// Alias pour compatibilité (utiliser getSupabase() à la place)
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
  from(table: string) {
    return getSupabase().from(table);
  },
};

// Interface utilisateur public
export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

// Interface annonce
export interface ListingPublic {
  id: string;
  type: "demande" | "proposition";
  title: string;
  description: string;
  serviceTypeIds: string[];
  authorId: string;
  authorName: string;
  cityName: string;
  postalCode: string;
  departmentCode: string;
  status: "active" | "closed";
  createdAt: string;
  closedAt: string | null;
  distanceKm?: number;
}

/**
 * Récupère un utilisateur par son ID depuis la table profiles
 */
export async function getUserById(userId: string): Promise<UserPublic | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    role: data.role || "user",
    createdAt: data.created_at,
  };
}

/**
 * Récupère le nom d'affichage d'un utilisateur
 */
export async function getDisplayName(userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();
  return data?.display_name || "Utilisateur inconnu";
}

/**
 * Vérifie un token et retourne l'utilisateur
 */
export async function getUserFromToken(
  token: string,
): Promise<UserPublic | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return getUserById(user.id);
}

/**
 * Extrait le token du cookie de la requête
 */
export function getTokenFromEvent(event: any): string | null {
  const cookies = parseCookies(event);
  return cookies["koudpouce.token"] || null;
}

/**
 * Définit le cookie d'authentification
 */
export function setAuthCookie(event: any, token: string): void {
  setCookie(event, "koudpouce.token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: "/",
  });
}

/**
 * Supprime le cookie d'authentification
 */
export function clearAuthCookie(event: any): void {
  deleteCookie(event, "koudpouce.token", { path: "/" });
}
