import { defineEventHandler, proxyRequest } from "h3";

export default defineEventHandler((event) => {
  // Proxy /api/* vers le backend Express (même origin côté navigateur)
  const target = process.env.NUXT_API_PROXY_TARGET || "http://localhost:3001";
  return proxyRequest(event, target);
});
