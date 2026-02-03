// Proxy pour contourner le CORS de l'API-adresse.data.gouv.fr (search)
import { defineEventHandler, getQuery, sendError } from "h3";

export default defineEventHandler(async (event) => {
  const { q, limit } = getQuery(event);
  if (!q) {
    return sendError(event, {
      statusCode: 400,
      statusMessage: "q (query) requis",
    });
  }
  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=${limit || 10}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (e) {
    return sendError(event, {
      statusCode: 500,
      statusMessage: "Erreur proxy geocode search",
    });
  }
});
