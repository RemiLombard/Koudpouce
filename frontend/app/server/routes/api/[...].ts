// Proxy API : redirige les requêtes /api vers le backend Express
// Permet de garder le même domaine pour les cookies de session

import { defineEventHandler, proxyRequest } from "h3";

export default defineEventHandler((event) => {
  // Backend Express sur le port 3001
  const target = process.env.NUXT_API_PROXY_TARGET || "http://localhost:3001";
  return proxyRequest(event, target);
});
