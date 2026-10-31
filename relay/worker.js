// Relais sécurisé : les clés restent dans Cloudflare (variables), jamais dans la page.
// Variables : APIFY_KEY, SHOTSTACK_KEY, SHOTSTACK_ENV ("stage" pour tester, "v1" pour le vrai), AI_KEY (Vercel AI Gateway).
const ALLOWED_ORIGIN = "https://uba-babu92.github.io";
// Seuls ces scrapers Apify sont autorisés
const APIFY_ACTORS = ["mu0i~tiktok-search-scraper", "scrapingmonkey~tiktok-scraper"];

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    const p = url.pathname;

    // Test simple dans le navigateur : ouvrir /ping
    if (p === "/ping") {
      return Response.json({
        ok: true,
        shotstack: !!env.SHOTSTACK_KEY,
        ia: !!env.AI_KEY,
        apify: !!env.APIFY_KEY,
        mode: env.SHOTSTACK_ENV || "stage",
      }, { headers: cors });
    }

    if (request.headers.get("Origin") !== ALLOWED_ORIGIN) {
      return new Response("Origine non autorisée", { status: 403 });
    }

    const stage = env.SHOTSTACK_ENV || "stage";
    const shot = { "x-api-key": env.SHOTSTACK_KEY, "Content-Type": "application/json" };
    const body = request.method === "POST" ? await request.text() : undefined;
    let m, upstream;

    if (p === "/ai" && request.method === "POST") {
      upstream = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.AI_KEY}`, "Content-Type": "application/json" },
        body,
      });
    } else if ((m = p.match(/^\/apify\/([\w~.-]+)$/)) && request.method === "POST" && APIFY_ACTORS.includes(m[1])) {
      upstream = await fetch(`https://api.apify.com/v2/acts/${m[1]}/run-sync-get-dataset-items`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.APIFY_KEY}`, "Content-Type": "application/json" },
        body,
      });
    } else if (p === "/subtitle") {
      // Récupère un fichier de sous-titres TikTok (seulement depuis les serveurs TikTok)
      const target = new URL(url.searchParams.get("url") || "https://x.invalid");
      const okHost = /(^|\.)(tiktokcdn\.com|tiktokcdn-us\.com|tiktokcdn-eu\.com|tiktokv\.com|tiktok\.com|byteoversea\.com|ibyteimg\.com|muscdn\.com)$/.test(target.hostname);
      if (target.protocol !== "https:" || !okHost) return new Response("Adresse refusée", { status: 400, headers: cors });
      const r = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.tiktok.com/" } });
      return new Response(r.body, { status: r.status, headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } });
    } else if (p === "/shotstack/upload" && request.method === "POST") {
      // Donne une adresse où la page envoie la vidéo
      upstream = await fetch(`https://api.shotstack.io/ingest/${stage}/upload`, { method: "POST", headers: shot });
    } else if ((m = p.match(/^\/shotstack\/source\/([\w-]+)$/))) {
      upstream = await fetch(`https://api.shotstack.io/ingest/${stage}/sources/${m[1]}`, { headers: shot });
    } else if (p === "/shotstack/render" && request.method === "POST") {
      upstream = await fetch(`https://api.shotstack.io/edit/${stage}/render`, { method: "POST", headers: shot, body });
    } else if ((m = p.match(/^\/shotstack\/render\/([\w-]+)$/))) {
      upstream = await fetch(`https://api.shotstack.io/edit/${stage}/render/${m[1]}`, { headers: shot });
    } else {
      return new Response("Introuvable", { status: 404, headers: cors });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
