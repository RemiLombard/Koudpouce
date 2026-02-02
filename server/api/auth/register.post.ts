// POST /api/auth/register - Inscription d'un nouvel utilisateur

import { supabase } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, displayName } = body;

  // Validation
  if (!email || !password || !displayName) {
    throw createError({ statusCode: 400, message: "Tous les champs sont requis." });
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, message: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Créer l'utilisateur via Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName.trim(),
    },
  });

  if (error) {
    if (error.message.includes("already") || error.message.includes("exists")) {
      throw createError({ statusCode: 409, message: "Cette adresse email est déjà utilisée." });
    }
    console.error("Erreur création utilisateur:", error);
    throw createError({ statusCode: 500, message: "Erreur lors de l'inscription." });
  }

  if (!data.user) {
    throw createError({ statusCode: 500, message: "Erreur lors de la création du compte." });
  }

  // Attendre que le profil soit créé par le trigger
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Connecter l'utilisateur
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (signInError || !signInData.session) {
    throw createError({ statusCode: 500, message: "Compte créé mais connexion échouée." });
  }

  // Récupérer le profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  // Définir le cookie
  setAuthCookie(event, signInData.session.access_token);

  return {
    user: {
      id: data.user.id,
      email: profile?.email || normalizedEmail,
      displayName: profile?.display_name || displayName.trim(),
      role: profile?.role || "user",
      createdAt: profile?.created_at || new Date().toISOString(),
    },
  };
});

// Helper pour définir le cookie
function setAuthCookie(event: any, token: string): void {
  setCookie(event, "koudpouce.token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
