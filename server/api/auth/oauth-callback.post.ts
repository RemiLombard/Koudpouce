import { supabase, setAuthCookie, getUserById } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { accessToken, refreshToken } = body;

  if (!accessToken) {
    throw createError({
      statusCode: 400,
      message: "Token manquant",
    });
  }

  // Vérifier le token avec Supabase
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw createError({
      statusCode: 401,
      message: "Token invalide",
    });
  }

  // Vérifier/créer le profil utilisateur
  let profile = await getUserById(user.id);

  if (!profile) {
    // Créer le profil si c'est un nouvel utilisateur
    const displayName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split("@")[0] || 
                        "Utilisateur";

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        display_name: displayName,
        role: "user",
      });

    if (profileError) {
      console.error("Erreur lors de la création du profil:", profileError);
      throw createError({
        statusCode: 500,
        message: "Erreur lors de la création du profil",
      });
    }

    profile = {
      id: user.id,
      email: user.email!,
      displayName,
      role: "user",
      createdAt: new Date().toISOString(),
    };
  }

  // Définir le cookie de session
  setAuthCookie(event, accessToken);

  return {
    message: "Connexion réussie",
    user: profile,
  };
});
