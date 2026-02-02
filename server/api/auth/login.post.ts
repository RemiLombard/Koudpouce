// POST /api/auth/login - Connexion utilisateur

import { supabase } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({ statusCode: 400, message: "Email et mot de passe requis." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Authentifier via Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.session) {
    throw createError({ statusCode: 401, message: "Email ou mot de passe incorrect." });
  }

  // Récupérer le profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  // Définir le cookie
  setCookie(event, "koudpouce.token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return {
    user: {
      id: data.user.id,
      email: profile?.email || data.user.email,
      displayName: profile?.display_name || "Utilisateur",
      role: profile?.role || "user",
      createdAt: profile?.created_at || data.user.created_at,
    },
  };
});
