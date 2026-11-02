// Relais sécurisé : les clés restent dans Cloudflare (variables), jamais dans la page.
// Variables : APIFY_KEY, SHOTSTACK_KEY, SHOTSTACK_ENV ("stage" pour tester, "v1" pour le vrai), AI_KEY (clé Groq).
const ALLOWED_ORIGIN = "https://uba-babu92.github.io";
// Seuls ces scrapers Apify sont autorisés
const APIFY_ACTORS = ["mu0i~tiktok-search-scraper", "scrapingmonkey~tiktok-scraper"];

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Expose-Headers": "X-Desc",
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
    const body = request.method === "POST" && p !== "/transcribe" ? await request.text() : undefined;
    let m, upstream;

    if (p === "/ai" && request.method === "POST") {
      upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.AI_KEY}`, "Content-Type": "application/json" },
        body,
      });
    } else if (p === "/transcribe" && request.method === "POST") {
      // Transcription audio (légendes) avec Groq Whisper : le fichier passe tel quel
      upstream = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.AI_KEY}`, "Content-Type": request.headers.get("Content-Type") },
        body: request.body,
      });
    } else if ((m = p.match(/^\/apify\/([\w~.-]+)$/)) && request.method === "POST" && APIFY_ACTORS.includes(m[1])) {
      upstream = await fetch(`https://api.apify.com/v2/acts/${m[1]}/run-sync-get-dataset-items`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.APIFY_KEY}`, "Content-Type": "application/json" },
        body,
      });
    } else if (p === "/tiktok-video") {
      // Ouvre la page TikTok, trouve le fichier vidéo et le renvoie (pour transcrire ce qui est dit)
      const page = new URL(url.searchParams.get("url") || "https://x.invalid");
      if (page.protocol !== "https:" || !/(^|\.)tiktok\.com$/.test(page.hostname)) return new Response("Adresse refusée", { status: 400, headers: cors });
      const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
      const r1 = await fetch(page, { headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8", "Accept": "text/html" } });
      const html = await r1.text();
      const set = r1.headers.getSetCookie ? r1.headers.getSetCookie() : [r1.headers.get("set-cookie") || ""];
      const cookie = set.map(c => c.split(";")[0]).filter(Boolean).join("; ");
      let videoUrl = "", desc = "";
      const m1 = html.match(/<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      if (m1) {
        try {
          const item = JSON.parse(m1[1]).__DEFAULT_SCOPE__["webapp.video-detail"].itemInfo.itemStruct;
          const v = item.video || {};
          videoUrl = v.playAddr || v.downloadAddr || (v.bitrateInfo && v.bitrateInfo[0] && v.bitrateInfo[0].PlayAddr.UrlList[0]) || "";
          desc = item.desc || "";
        } catch (e) {}
      }
      if (!videoUrl) { const m2 = html.match(/"playAddr":"([^"]+)"/) || html.match(/"downloadAddr":"([^"]+)"/); if (m2) videoUrl = JSON.parse('"' + m2[1] + '"'); }
      if (!videoUrl) return new Response("Vidéo introuvable sur la page TikTok", { status: 404, headers: cors });
      const r2 = await fetch(videoUrl, { headers: { "User-Agent": UA, "Referer": "https://www.tiktok.com/", "Cookie": cookie, "Range": "bytes=0-" } });
      if (!r2.ok) return new Response("TikTok a bloqué la vidéo (" + r2.status + ")", { status: 502, headers: cors });
      return new Response(r2.body, { status: 200, headers: { ...cors, "Content-Type": "video/mp4", "X-Desc": encodeURIComponent(desc.slice(0, 500)) } });
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
