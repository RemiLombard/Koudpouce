// PATCH /api/auth/me - Modifier le profil utilisateur

import { supabase, getUserById } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies["koudpouce.token"];

  if (!token) {
    throw createError({ statusCode: 401, message: "Non connecté." });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw createError({ statusCode: 401, message: "Session invalide." });
  }

  const body = await readBody(event);
  const { displayName, email, password } = body;

  // Mise à jour du profil
  if (displayName !== undefined) {
    await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  // Mise à jour email
  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase().trim();
    await supabase.auth.admin.updateUserById(user.id, { email: normalizedEmail });
    await supabase
      .from("profiles")
      .update({ email: normalizedEmail })
      .eq("id", user.id);
  }

  // Mise à jour mot de passe
  if (password !== undefined) {
    if (password.length < 6) {
      throw createError({ statusCode: 400, message: "Le mot de passe doit contenir au moins 6 caractères." });
    }
    await supabase.auth.admin.updateUserById(user.id, { password });
  }

  const updatedUser = await getUserById(user.id);

  return { user: updatedUser };
});
