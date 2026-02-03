// Proxy pour contourner le CORS de l'API-adresse.data.gouv.fr
import { defineEventHandler, getQuery, sendError } from 'h3';

export default defineEventHandler(async (event) => {
  const { lat, lon, limit } = getQuery(event);
  if (!lat || !lon) {
    return sendError(event, { statusCode: 400, statusMessage: 'lat et lon requis' });
  }
  try {
    const url = `https://api-adresse.data.gouv.fr/reverse/?lat=${lat}&lon=${lon}&limit=${limit || 1}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (e) {
    return sendError(event, { statusCode: 500, statusMessage: 'Erreur proxy geocode' });
  }
});