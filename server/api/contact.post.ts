// POST /api/contact - Envoyer un email de contact via Resend

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, subject, message } = body;

  // Validation
  if (!name || !email || !subject || !message) {
    throw createError({
      statusCode: 400,
      message: "Tous les champs sont obligatoires.",
    });
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      message: "Adresse email invalide.",
    });
  }

  const config = useRuntimeConfig();
  const resendApiKey = config.resendApiKey;

  if (!resendApiKey) {
    console.error("RESEND_API_KEY manquante");
    throw createError({
      statusCode: 500,
      message: "Configuration email manquante. Veuillez contacter l'administrateur.",
    });
  }

  // Préparer le contenu HTML de l'email
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
        Nouveau message depuis Koudpouce
      </h2>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Sujet :</strong> ${subject}</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Nom :</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            ${name}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <strong>Email :</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <a href="mailto:${email}" style="color: #f97316;">${email}</a>
          </td>
        </tr>
      </table>
      
      <div style="margin-top: 20px;">
        <strong>Message :</strong>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 10px; white-space: pre-wrap;">
${message}
        </div>
      </div>
      
      <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
        Ce message a été envoyé depuis le formulaire de contact de Koudpouce.
      </p>
    </div>
  `;

  try {
    // Appel à l'API Resend
    const response = await $fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: {
        from: "Koudpouce <onboarding@resend.dev>",
        to: ["remi.lombard70@gmail.com"],
        reply_to: email,
        subject: `[Koudpouce] ${subject} - ${name}`,
        html: htmlContent,
      },
    });

    console.log("Email envoyé avec succès:", response);

    return {
      success: true,
      message: "Message envoyé avec succès.",
    };
  } catch (err: any) {
    console.error("Erreur lors de l'envoi de l'email:", err);
    
    // Si l'erreur vient de Resend, on peut avoir plus de détails
    const errorMessage = err?.data?.message || err?.message || "Erreur lors de l'envoi";
    
    throw createError({
      statusCode: 500,
      message: `Impossible d'envoyer le message: ${errorMessage}`,
    });
  }
});
