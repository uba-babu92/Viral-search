// Relais sécurisé : les clés restent dans Cloudflare (secrets), jamais dans la page.
// Autorise seulement ta page GitHub Pages.
const ALLOWED_ORIGIN = "https://uba-babu92.github.io";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.headers.get("Origin") !== ALLOWED_ORIGIN && request.method !== "OPTIONS") {
      return new Response("Origine non autorisée", { status: 403 });
    }
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    const body = await request.text();
    let upstream;

    if (url.pathname === "/mistral") {
      upstream = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.MISTRAL_KEY}`, "Content-Type": "application/json" },
        body,
      });
    } else if (url.pathname === "/shotstack/render") {
      upstream = await fetch(`https://api.shotstack.io/edit/${env.SHOTSTACK_ENV || "stage"}/render`, {
        method: "POST",
        headers: { "x-api-key": env.SHOTSTACK_KEY, "Content-Type": "application/json" },
        body,
      });
    } else {
      return new Response("Introuvable", { status: 404, headers: cors });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
