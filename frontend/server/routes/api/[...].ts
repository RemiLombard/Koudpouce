import { defineEventHandler, proxyRequest } from "h3";

export default defineEventHandler((event) => {
  // Reverse proxy Nuxt -> Express pour garder le same-origin (cookies de session)
  const target = process.env.NUXT_API_PROXY_TARGET || "http://localhost:3001";
  return proxyRequest(event, target);
});
