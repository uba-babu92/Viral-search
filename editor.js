// ===== TABLE DE MONTAGE (organisation façon CapCut, version simple) =====
// Moteur : Mediabunny (vendor/, licence MPL-2.0) pour décoder et exporter en MP4 sur le téléphone.
// Plans : appui long pour déplacer, poignées pour rallonger/raccourcir, diviser, vitesse x0,5 à x100, volume.
// Sons : bibliothèque de bruitages perso (gardée sur le téléphone) + voix off (appui maintenu).
// Légendes façon TikTok (transcription Groq Whisper), superpositions. Lecture sans écran noir ni latence.
(() => {
  const PPS = 60;                                    // pixels par seconde
  const RULER_H = 20, VIDEO_Y = 24, VIDEO_H = 56, ROW_H = 30;
  const CAP_RATIO = 0.045;                           // taille du texte des légendes / hauteur de la vidéo
  const $ = id => document.getElementById(id);

  // ---------- Icônes (traits fins) ----------
  const P = {
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" fill="currentColor" stroke="none"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
    split: '<path d="M12 3v18M8 7l-4 5 4 5M16 7l4 5-4 5"/>',
    note: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    captions: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15h4M14 15h3M7 11h2M12 11h5"/>',
    overlay: '<rect x="3" y="3" width="13" height="13" rx="2"/><rect x="8" y="8" width="13" height="13" rx="2"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/>',
    vol: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    mute: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
    speed: '<path d="M12 14l4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    cam: '<path d="m16 13 5 3V8l-5 3"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    kf: '<path d="M12 3 21 12 12 21 3 12z"/>',
    ai: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    adjust: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  };
  const ic = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;

  // ---------- Style ----------
  document.head.insertAdjacentHTML("beforeend", `<style>
  #ed { position: fixed; inset: 0; background: #0f0f0f; z-index: 70; display: flex; flex-direction: column; color: #eee; -webkit-user-select: none; user-select: none; font-family: system-ui, sans-serif; }
  #ed button { font-family: inherit; -webkit-touch-callout: none; }
  #ed .etop { display: flex; align-items: center; gap: 10px; padding: max(10px, env(safe-area-inset-top)) 14px 8px; }
  #ed .etop .grow { flex: 1; }
  #edClose { border: 0; background: none; color: #fff; padding: 4px; display: flex; }
  #ed .epill { padding: 7px 12px; border-radius: 8px; background: #1f1f1f; font-size: 14px; font-weight: 600; }
  #edExport { padding: 9px 18px; border: 0; border-radius: 999px; background: #FF5A4E; color: #fff; font-weight: 700; font-size: 15px; }
  #ed .eprev { flex: 1; min-height: 0; position: relative; display: flex; justify-content: center; align-items: center; }
  #ed .stage { position: relative; height: 100%; aspect-ratio: 9 / 16; max-width: 100%; background: #000; overflow: hidden; }
  #edCanvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .eov { position: absolute; aspect-ratio: 9 / 16; box-sizing: border-box; transform: translate(-50%, -50%); touch-action: none; z-index: 2; }
    .eov.sel { outline: 2px solid #fff; }
  .eov .ox, .eov .orz { display: none; position: absolute; width: 28px; height: 28px; border-radius: 14px; background: #222; color: #fff; align-items: center; justify-content: center; }
  .eov.sel .ox, .eov.sel .orz { display: flex; }
  .eov .ox { top: -14px; left: -14px; } .eov .orz { bottom: -14px; right: -14px; }
  #edCap { position: absolute; transform: translate(-50%, -50%); width: 86%; text-align: center; color: transparent; font-weight: 800; line-height: 1.3; touch-action: none; z-index: 3; border-radius: 6px; }
  #edCap.sel { outline: 1px dashed #fffa; }
  #edPip { position: absolute; top: 10px; right: 10px; width: 34%; aspect-ratio: 9 / 16; object-fit: cover; border-radius: 14px; border: 2px solid #FF5A4E; transform: scaleX(-1); z-index: 5; background: #000; }
  #ed .ectrl { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 6px 16px; font-size: 13px; }
  #edTime b { color: #fff; font-weight: 500; } #edTime { color: #777; }
  #edPlay { border: 0; background: none; color: #fff; display: flex; padding: 6px; }
  #ed .eundo { justify-self: end; display: flex; gap: 14px; }
  #ed .eundo button { border: 0; background: none; color: #ddd; display: flex; padding: 0; }
  #ed .eundo button:disabled { color: #444; }
  #ed .ewrap { position: relative; background: #0f0f0f; }
  #edTl { position: relative; overflow-x: auto; overflow-y: auto; max-height: 34vh; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  #edTl::-webkit-scrollbar { display: none; }
  #edInner { position: relative; }
  #edRuler span { position: absolute; top: 4px; font-size: 10px; color: #666; transform: translateX(-50%); }
  #edRuler i { position: absolute; top: 9px; width: 2px; height: 2px; border-radius: 1px; background: #555; }
  .eclip { position: absolute; border-radius: 4px; background: #2a2a2a repeat-x left center / auto 100%; box-sizing: border-box; border: 2px solid transparent; transition: left .15s; touch-action: pan-x pan-y; }
  .eclip span, .eit span { position: absolute; left: 5px; bottom: 2px; font-size: 10px; color: #fff; text-shadow: 0 1px 2px #000; white-space: nowrap; overflow: hidden; max-width: calc(100% - 8px); }
  .eclip em { position: absolute; right: 4px; top: 2px; font-size: 10px; font-style: normal; background: #000a; color: #fff; padding: 0 4px; border-radius: 3px; }
  .eclip.sel, .eit.sel { border-color: #fff; }
  .eit.sel { touch-action: none; }   /* sélectionné : on le glisse directement */
  .eclip.drag, .eit.drag { transition: none; z-index: 5; opacity: .85; transform: scale(1.04); box-shadow: 0 6px 18px #000; }
  .ehandle { position: absolute; top: -2px; bottom: -2px; width: 14px; background: #fff; touch-action: none; display: flex; align-items: center; justify-content: center; color: #000; font-size: 12px; font-weight: 700; z-index: 3; }
  .ehandle.l { left: -12px; border-radius: 4px 0 0 4px; } .ehandle.r { right: -12px; border-radius: 0 4px 4px 0; }
  .eit { position: absolute; height: ${ROW_H - 6}px; border-radius: 4px; box-sizing: border-box; border: 2px solid transparent; touch-action: pan-x pan-y; background-size: auto 100%; }
  .eit.sfx { background-color: #6d4bd8; } .eit.voice { background-color: #12936b; } .eit.cap { background-color: #c2760c; } .eit.ov { background-color: #444; }
  .eph { position: absolute; height: ${ROW_H - 6}px; line-height: ${ROW_H - 6}px; border-radius: 4px; background: #1c1c1c; color: #bbb; font-size: 13px; padding-left: 10px; box-sizing: border-box; white-space: nowrap; }
  #edLeft { position: absolute; left: 0; top: ${VIDEO_Y}px; width: 58px; height: ${VIDEO_H}px; display: flex; align-items: center; justify-content: center; background: linear-gradient(90deg, #0f0f0f 75%, #0f0f0f00); z-index: 4; }
  #edLeft button { border: 0; background: none; color: #ddd; display: flex; flex-direction: column; align-items: center; font-size: 9px; gap: 2px; }
  #edAdd { position: absolute; right: 10px; top: ${VIDEO_Y + 8}px; width: 40px; height: 40px; border-radius: 6px; border: 0; background: #fff; color: #000; display: flex; align-items: center; justify-content: center; z-index: 4; box-shadow: -10px 0 12px #0f0f0f; }
  #edHead { position: absolute; left: 50%; top: ${RULER_H - 2}px; bottom: 0; width: 2px; margin-left: -1px; background: #fff; border-radius: 1px; pointer-events: none; z-index: 6; }
  #ed .etools { display: flex; align-items: stretch; overflow-x: auto; gap: 4px; padding: 10px 8px max(12px, env(safe-area-inset-bottom)); scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  #ed .etools::-webkit-scrollbar { display: none; }
  #ed .etools button { flex: 0 0 auto; border: 0; background: none; color: #eee; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 70px; padding: 2px 0; touch-action: manipulation; }
  #ed .etools button.back { flex: 0 0 44px; min-width: 44px; justify-content: center; background: #1f1f1f; border-radius: 8px; }
  #ed .etools button.rec { color: #FF5A4E; }
  #edSheet { position: absolute; inset: 0; background: #0009; display: flex; align-items: flex-end; z-index: 10; }
  #edSheet .sheet { width: 100%; max-height: 75vh; overflow-y: auto; background: #1c1c1c; border-radius: 28px 28px 0 0; padding: 16px 16px max(16px, env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; }
  #edSheet input[type=range] { width: 100%; accent-color: #FF5A4E; }
  #ed button.main.alt { background: #2c2c2c; }
  #ed input[type=text] { background: #2a2a2a; color: #fff; }
  #edSheet input[type=text] { margin: 0; }
  .elib { display: flex; flex-direction: column; gap: 6px; }
  .elib div { display: flex; gap: 6px; align-items: center; }
  .elib span { flex: 1; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .elib button { width: 40px; height: 36px; border: 1px solid #333; border-radius: 8px; background: #111; color: #eee; display: flex; align-items: center; justify-content: center; }
  .elib button.add { background: #fff; color: #000; }
  .estops { display: flex; justify-content: space-between; font-size: 11px; color: #888; }
  .ebig { text-align: center; font-size: 28px; font-weight: 700; }
  .espin { display: inline-block; width: 12px; height: 12px; border: 2px solid #555; border-top-color: #FF5A4E; border-radius: 50%; animation: espin .8s linear infinite; }
  @keyframes espin { to { transform: rotate(360deg); } }
  .ekf { position: absolute; top: 50%; width: 10px; height: 10px; margin-top: -6px; background: #fff; border: 1px solid #000; transform: rotate(45deg); z-index: 2; }
  .eit.txt { background-color: #3a3a3a; }
  #edKf { border: 0; background: none; color: #ddd; display: flex; padding: 0; }
  #edKf.on { color: #FF5A4E; }
  #edKf.on svg path { fill: #FF5A4E; }
  #edKf:disabled { color: #444; }
  .etx { position: absolute; transform: translate(-50%, -50%); color: transparent; font-weight: 800; white-space: pre; text-align: center; line-height: 1.1; z-index: 3; touch-action: none; padding: 4px 8px; border-radius: 6px; }
  .etx.sel, .eov.sel { outline: 2px solid #fff; }
  #ed .etools button.aibtn { color: #FF5A4E; }
  #edToast { position: absolute; top: 35%; left: 20px; right: 20px; text-align: center; background: #000c; color: #fff; padding: 12px; border-radius: 10px; z-index: 9; pointer-events: none; }
  </style>`);

  // ---------- Interface ----------
  document.body.insertAdjacentHTML("beforeend", `
  <div id="ed" class="hidden">
    <div class="etop"><button id="edClose">${ic("x", 26)}</button><span class="grow" id="edProxy" style="font-size:12px;color:#888"></span><span class="epill">1080p</span><button id="edExport">Exporter</button></div>
    <div class="eprev"><div class="stage" id="edStage">
      <canvas id="edCanvas"></canvas>
      <div id="edOvs"></div><div id="edTxs"></div><div id="edCap" class="hidden"></div>
      <video id="edPip" class="hidden" playsinline muted autoplay></video>
    </div></div>
    <div class="ectrl"><span id="edTime"><b>00:00</b> / 00:00</span><button id="edPlay">${ic("play", 30)}</button>
      <span class="eundo"><button id="edKf" title="Image clé">${ic("kf")}</button><button id="edUndo">${ic("undo")}</button><button id="edRedo">${ic("redo")}</button></span></div>
    <div class="ewrap">
      <div id="edTl"><div id="edInner"><div id="edRuler"></div><div id="edItems"></div></div></div>
      <div id="edLeft"><button id="edMute">${ic("vol", 20)}<span>Son du clip</span></button></div>
      <div id="edHead"></div>
      <button id="edAdd">${ic("plus", 26)}</button>
    </div>
    <div class="etools" id="edTools"></div>
    <input id="edFile" type="file" accept="video/*" multiple class="hidden">
    <input id="edOvFile" type="file" accept="video/*,image/*" class="hidden">
    <input id="edSfxFile" type="file" accept="audio/*" multiple class="hidden">
    <div id="edToast" class="hidden"></div>
    <div id="edSheet" class="hidden"><div class="sheet"><div id="edSheetBody"></div><button class="main alt" id="edSheetClose">Fermer</button></div></div>
  </div>`);

  const tl = $("edTl"), inner = $("edInner"), items = $("edItems"), stage = $("edStage");

  // ---------- État ----------
  let clips = [];      // plans : {ref, in, out, speed, vol}
  let audios = [];     // sons : {ref, kind:"sfx"|"voice", start, in, out, vol}
  let overlays = [];   // superpositions : {ref, start, in, out, vol, x, y, scale}
  let caps = [];       // légendes : {text, start, in, out}
  let texts = [];      // textes libres : {text, start, in, out, x, y, scale, rot, op, kf}
  let capStyle = { x: 0.5, y: 0.7, size: 1, style: "box" };
  let clipMute = false;
  let sel = null;      // {type:"v"|"a"|"o"|"c", i}
  let t = 0, playing = false, cur = -1, front = 0, programmatic = false, token = 0;
  let step = null;     // lecture image par image : {t0, clock}
  let waiting = false; // plan suivant en cours de chargement (secours)
  let refs = [];
  const past = [], future = [];

  const sp = x => x.speed || 1;
  const len = x => (x.out - x.in) / sp(x);              // durée sur la ligne du temps
  const total = () => clips.reduce((s, c) => s + len(c), 0);
  const startOf = i => clips.slice(0, i).reduce((s, c) => s + len(c), 0);
  const half = () => tl.clientWidth / 2;
  const arr = k => (k === "a" ? audios : k === "o" ? overlays : k === "t" ? texts : caps);
  const fmt = s => { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
  let lastTime = "";
  const showTime = () => { const h = `<b>${fmt(t)}</b> / ${fmt(total())}`; if (h !== lastTime) $("edTime").innerHTML = lastTime = h; };
  const toast = (msg, ms = 2500) => { const e = $("edToast"); e.textContent = msg; e.classList.remove("hidden"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.add("hidden"), ms); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function locate(time) {
    let acc = 0;
    for (let i = 0; i < clips.length; i++) {
      if (time < acc + len(clips[i]) || i === clips.length - 1) return { i, off: Math.min(Math.max(0, time - acc), len(clips[i])) };
      acc += len(clips[i]);
    }
    return { i: -1, off: 0 };
  }

  // ---------- Bibliothèque de bruitages (gardée dans le téléphone) ----------
  const DB = new Promise((ok, ko) => {
    const r = indexedDB.open("viral-montage", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("sfx", { keyPath: "id", autoIncrement: true });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
  const store = async mode => (await DB).transaction("sfx", mode).objectStore("sfx");
  const req = r => new Promise((ok, ko) => { r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
  const libList = async () => req((await store("readonly")).getAll());
  const libAdd = async f => req((await store("readwrite")).add({ name: f.name.replace(/\.[^.]+$/, ""), type: f.type, blob: f }));
  const libDel = async id => req((await store("readwrite")).delete(id));

  // ---------- Historique ----------
  const snap = () => JSON.stringify({ clips, audios, overlays, caps, texts, capStyle, clipMute }, (k, v) => (k === "ref" ? refs.indexOf(v) : v));
  function save() { past.push(snap()); if (past.length > 60) past.shift(); future.length = 0; updUndo(); }
  function updUndo() { $("edUndo").disabled = !past.length; $("edRedo").disabled = !future.length; }
  function restore(str) {
    const s = JSON.parse(str, (k, v) => (k === "ref" ? refs[v] : v));
    ({ clips, audios, overlays, caps, capStyle, clipMute } = s);
    texts = s.texts || [];
    sel = null; resetPlayers();
    draw(); seek(Math.min(t, total())); updUndo();
  }
  $("edKf").onclick = () => toggleKf();
  $("edUndo").onclick = () => { if (past.length) { future.push(snap()); restore(past.pop()); } };
  $("edRedo").onclick = () => { if (future.length) { past.push(snap()); restore(future.pop()); } };

  // ---------- Ouvrir / fermer ----------
  // Le montage est gardé quand on ferme l'éditeur : on le retrouve en revenant avec les mêmes rushs
  window.openEditor = async (list, opts = {}) => {
    $("ed").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    ["400 20px Anton", '800 20px "JetBrains Mono"', "900 20px Montserrat"].forEach(f => document.fonts.load(f).catch(() => {}));
    const known = clips.length && clips.some(c => list.includes(c.ref));
    if (known) {
      // même projet : on ajoute seulement les nouveaux rushs, et on retire ceux supprimés de la liste
      const gone = refs.filter(r => !list.includes(r) && clips.some(c => c.ref === r));
      if (gone.length) { save(); clips = clips.filter(c => !gone.includes(c.ref)); }
      const added = list.filter(r => !refs.includes(r));
      if (added.length) await addVideos(added);
      resetPlayers(); draw(); seek(Math.min(t, total()));
    } else {
      refs = []; clips = []; audios = []; overlays = []; caps = []; texts = []; sel = null;
      capStyle = { x: 0.5, y: 0.7, size: 1, style: "box" }; clipMute = false;
      past.length = future.length = 0; updUndo();
      resetPlayers();
      await addVideos(list, false);
      seek(0);
    }
    if (opts.message) toast(opts.message, 4000);
    if (opts.ai) setTimeout(() => aiMontage(opts.prompt || ""), 300);   // Montage IA : écoute, coupe des blancs, légendes
  };
  $("edClose").onclick = () => { pause(); $("ed").classList.add("hidden"); document.body.style.overflow = ""; };

  async function addVideos(list, record = true) {
    if (record) save();
    for (const r of list) {
      if (!refs.includes(r)) refs.push(r);
      const d = await mediaDuration(r);
      // Prises de la caméra : on coupe la petite image figée du tout début
      const start = r.cam && d > 0.6 ? 0.1 : 0;
      clips.push({ ref: r, in: start, out: d, speed: 1, vol: 1 });
      if (!r.thumb && r.file instanceof File && typeof makeThumb === "function") makeThumb(r).then(draw);
    }
    draw();
  }
  async function addAudio(ref, kind, start) {
    if (!refs.includes(ref)) refs.push(ref);
    const d = await mediaDuration(ref);
    save();
    audios.push({ ref, kind, start, in: 0, out: d, vol: 1 });
    sel = { type: "a", i: audios.length - 1 };
    draw();
  }

  // ---------- Images clés (comme CapCut) ----------
  // Chaque élément animable a des valeurs de base et, s'il en a, des clés {t (secondes depuis son début), v:{...}}.
  const PROPS = { v: ["x", "y", "scale", "rot"], o: ["x", "y", "scale", "rot", "op"], t: ["x", "y", "scale", "rot", "op"] };
  const DEF = { x: 0, y: 0, scale: 1, rot: 0, op: 1 };
  const easeIO = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const itemOf = (k, i) => (k === "v" ? clips[i] : arr(k)[i]);
  const startOfItem = (k, i) => (k === "v" ? startOf(i) : arr(k)[i].start);
  function baseOf(k, it) { const o = {}; PROPS[k].forEach(p => (o[p] = it[p] ?? DEF[p])); return o; }
  function valAt(k, it, local) {
    const b = baseOf(k, it), kf = it.kf;
    if (!kf || !kf.length) return b;
    if (local <= kf[0].t) return { ...b, ...kf[0].v };
    if (local >= kf[kf.length - 1].t) return { ...b, ...kf[kf.length - 1].v };
    let j = 0; while (kf[j + 1].t < local) j++;
    const A = kf[j], B = kf[j + 1], u = easeIO((local - A.t) / Math.max(1e-6, B.t - A.t)), o = { ...b };
    PROPS[k].forEach(p => { const a = A.v[p] ?? b[p], c = B.v[p] ?? b[p]; o[p] = a + (c - a) * u; });
    return o;
  }
  const kfNear = (it, local) => (it.kf || []).findIndex(k => Math.abs(k.t - local) < 0.6 / FPS);
  // Modifie un élément : s'il a des clés, la modification crée/met à jour la clé à cet instant (comme CapCut)
  function setProps(k, i, changes) {
    const it = itemOf(k, i), local = t - startOfItem(k, i);
    if (it.kf && it.kf.length) {
      let j = kfNear(it, local);
      if (j < 0) { it.kf.push({ t: +local.toFixed(3), v: valAt(k, it, local) }); it.kf.sort((a, b) => a.t - b.t); j = kfNear(it, local); }
      Object.assign(it.kf[j].v, changes);
    } else Object.assign(it, changes);
  }
  function toggleKf() {
    if (!sel || !PROPS[sel.type]) return toast("Sélectionne un plan, une superposition ou un texte");
    const it = itemOf(sel.type, sel.i), local = t - startOfItem(sel.type, sel.i), l = len(it);
    if (local < -0.01 || local > l + 0.01) return toast("Place la barre blanche sur l'élément sélectionné");
    pause(); save();
    it.kf = it.kf || [];
    const j = kfNear(it, local);
    if (j >= 0) { it.kf.splice(j, 1); toast("Clé supprimée"); }
    else { it.kf.push({ t: +Math.max(0, Math.min(l, local)).toFixed(3), v: valAt(sel.type, it, local) }); it.kf.sort((a, b) => a.t - b.t); toast("Clé ajoutée : déplace la barre et modifie l'élément pour l'animer", 3000); }
    draw(); renderStill(t);
  }
  const kfMarks = (k, it) => (it.kf || []).map(x => `<i class="ekf" data-kt="${x.t}" style="left:${x.t * PPS - 6}px"></i>`).join("");

  // ---------- Dessin ----------
  function lanes(list) { // place les éléments sur des lignes sans chevauchement
    const ends = [];
    return list.map(a => {
      let l = ends.findIndex(e => e <= a.start + 0.01);
      if (l < 0) { l = ends.length; ends.push(0); }
      ends[l] = a.start + len(a);
      return l;
    });
  }
  const nl = lane => (lane.length ? Math.max(...lane) + 1 : 0);

  function itemHtml(k, x, i, top, cls, label, bg = "") {
    const on = sel && sel.type === k && sel.i === i, h = half();
    return `<div class="eit ${cls}${on ? " sel" : ""}" data-k="${k}" data-i="${i}" style="left:${h + x.start * PPS}px;top:${top}px;width:${Math.max(10, len(x) * PPS)}px;${bg}"><span>${label}</span>${PROPS[k] ? kfMarks(k, x) : ""}
      ${on ? `<div class="ehandle l" data-h="l">‹</div><div class="ehandle r" data-h="r">›</div>` : ""}</div>`;
  }

  function draw() {
    const h = half(), tot = total(), w = Math.max(tot * PPS, 170);
    const ovL = lanes(overlays), auL = lanes(audios), txL = lanes(texts);
    let y = VIDEO_Y + VIDEO_H + 8;
    const ovY = y; y += Math.max(1, nl(ovL)) * ROW_H;
    const txY = y; y += Math.max(1, nl(txL)) * ROW_H;
    const capY = y; y += ROW_H;
    const auY = y; y += (nl(auL) + 1) * ROW_H;
    inner.style.width = (tot * PPS + 2 * h) + "px";   // la ligne s'arrête à la fin du montage
    inner.style.height = y + 6 + "px";

    let ruler = "";
    for (let s = 0; s <= Math.floor(tot); s += 2) {
      ruler += `<span style="left:${h + s * PPS}px">${fmt(s)}</span>`;
      if (s + 1 <= tot) ruler += `<i style="left:${h + (s + 1) * PPS - 1}px"></i>`;
    }
    $("edRuler").innerHTML = ruler;

    let html = "", x = h;
    clips.forEach((c, i) => {
      const cw = Math.max(6, len(c) * PPS), on = sel && sel.type === "v" && sel.i === i;
      const bg = c.ref.thumb ? `background-image:url(${c.ref.thumb});` : "";
      const badge = [sp(c) !== 1 ? "x" + sp(c) : "", c.vol === 0 ? "" : ""].filter(Boolean).join(" ");
      html += `<div class="eclip${on ? " sel" : ""}" data-k="v" data-i="${i}" style="left:${x}px;top:${VIDEO_Y}px;width:${cw}px;height:${VIDEO_H}px;${bg}"><span>${fmt(len(c))}</span>${badge ? `<em>${badge}</em>` : ""}${kfMarks("v", c)}
        ${on ? `<div class="ehandle l" data-h="l">‹</div><div class="ehandle r" data-h="r">›</div>` : ""}</div>`;
      x += cw;
    });
    if (overlays.length) overlays.forEach((o, i) => html += itemHtml("o", o, i, ovY + ovL[i] * ROW_H, "ov", "Superposition", o.ref.thumb ? `background-image:url(${o.ref.thumb});` : ""));
    else html += `<div class="eph" data-ph="ov" style="left:${h}px;top:${ovY}px;width:${w}px">+ Ajouter une superposition</div>`;
    if (texts.length) texts.forEach((x, i) => html += itemHtml("t", x, i, txY + txL[i] * ROW_H, "txt", "T  " + esc(x.text)));
    else html += `<div class="eph" data-ph="txt" style="left:${h}px;top:${txY}px;width:${w}px">+ Ajouter un texte</div>`;
    if (caps.length) caps.forEach((c, i) => html += itemHtml("c", c, i, capY, "cap", esc(c.text)));
    else html += `<div class="eph" data-ph="cap" style="left:${h}px;top:${capY}px;width:${w}px">+ Générer des légendes</div>`;
    audios.forEach((a, i) => html += itemHtml("a", a, i, auY + auL[i] * ROW_H, a.kind, esc(a.ref.label || "Son")));
    html += `<div class="eph" data-ph="sound" style="left:${h}px;top:${auY + nl(auL) * ROW_H}px;width:${w}px">+ Ajouter un son</div>`;
    items.innerHTML = html;

    $("edMute").innerHTML = `${ic(clipMute ? "mute" : "vol", 20)}<span>${clipMute ? "Son coupé" : "Son du clip"}</span>`;
    drawOverlays();
    drawCaption();
    drawTools();
    updKf();
    showTime();
  }
  function updKf() {   // le bouton ◇ est plein quand une clé est sous la barre blanche
    const b = $("edKf");
    if (!sel || !PROPS[sel.type]) { b.disabled = true; b.classList.remove("on"); return; }
    b.disabled = false;
    b.classList.toggle("on", kfNear(itemOf(sel.type, sel.i), t - startOfItem(sel.type, sel.i)) >= 0);
  }

  // Barre d'outils du bas : change selon ce qui est sélectionné, défile si trop d'outils
  function drawTools() {
    const b = (t, icon, label, cls = "") => `<button data-t="${t}" class="${cls}">${ic(icon)}<span>${label}</span></button>`;
    const back = `<button data-t="back" class="back">${ic("back")}</button>`;
    let html;
    if (!sel) html = b("ai", "ai", "IA", "aibtn") + b("edit", "scissors", "Modifier") + b("sound", "note", "Son")
      + b("voice", "mic", voiceRec ? "Parle…" : "Voix off", voiceRec ? "rec" : "") + b("captions", "captions", "Légendes") + b("addtext", "text", "Texte") + b("overlay", "overlay", "Superposition")
      + b("camera", "cam", camRec ? "Filme…" : "Caméra", camRec ? "rec" : "");
    else if (sel.type === "v") html = back + b("split", "split", "Diviser") + b("adjust", "adjust", "Ajuster") + b("speed", "speed", "Vitesse") + b("volume", "vol", "Volume") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    else if (sel.type === "a") html = back + b("split", "split", "Diviser") + b("volume", "vol", "Volume") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    else if (sel.type === "o") html = back + b("split", "split", "Diviser") + b("adjust", "adjust", "Ajuster") + b("volume", "vol", "Volume") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    else if (sel.type === "t") html = back + b("edittext", "text", "Modifier") + b("split", "split", "Diviser") + b("adjust", "adjust", "Ajuster") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    else html = back + b("style", "captions", "Style") + b("text", "text", "Modifier le texte") + b("del", "trash", "Supprimer") + b("delcaps", "trash", "Tout supprimer");
    $("edTools").innerHTML = html;
  }

  // ---------- Aperçu : superpositions et légendes ----------
  // Cadres pour toucher / déplacer / agrandir les superpositions (l'image est dessinée sur le canvas)
  const ovEls = new Map();   // superposition -> {box}
  function drawOverlays() {
    overlays.forEach((o, i) => {
      let e = ovEls.get(o);
      if (!e) {
        const box = document.createElement("div");
        box.className = "eov";
        box.innerHTML = `<div class="ox">${ic("x", 16)}</div><div class="orz">⤡</div>`;
        $("edOvs").append(box);
        ovEls.set(o, (e = { box }));
      }
      e.i = i;
      e.box.classList.toggle("sel", !!(sel && sel.type === "o" && sel.i === i));
      const v = valAt("o", o, t - o.start);
      e.box.style.left = v.x * 100 + "%";
      e.box.style.top = v.y * 100 + "%";
      e.box.style.width = v.scale * 100 + "%";
      e.box.style.transform = `translate(-50%, -50%) rotate(${v.rot}deg)`;
      e.box.style.display = t >= o.start && t < o.start + len(o) ? "" : "none";
    });
    ovEls.forEach((e, o) => { if (!overlays.includes(o)) { e.box.remove(); ovEls.delete(o); } });
    drawTextBoxes();
  }
  const txEls = new Map();
  function drawTextBoxes() {
    texts.forEach((x, i) => {
      let e = txEls.get(x);
      if (!e) { const box = document.createElement("div"); box.className = "etx"; $("edTxs").append(box); txEls.set(x, (e = { box })); }
      e.i = i;
      const v = valAt("t", x, t - x.start);
      e.box.textContent = x.text;
      e.box.style.left = v.x * 100 + "%"; e.box.style.top = v.y * 100 + "%";
      e.box.style.fontSize = stage.clientHeight * TXT_RATIO * v.scale + "px";
      e.box.style.transform = `translate(-50%, -50%) rotate(${v.rot}deg)`;
      e.box.classList.toggle("sel", !!(sel && sel.type === "t" && sel.i === i));
      e.box.style.display = t >= x.start && t < x.start + len(x) ? "" : "none";
    });
    txEls.forEach((e, x) => { if (!texts.includes(x)) { e.box.remove(); txEls.delete(x); } });
  }
  function drawCaption() {
    const el = $("edCap");
    const c = caps.find(c => t >= c.start && t < c.start + len(c));
    el.classList.toggle("hidden", !c);
    if (!c) return;
    el.textContent = (capStyle.style === "pop" ? c.text.split(/\s+/)[0] : c.text) || " ";
    el.style.left = capStyle.x * 100 + "%";
    el.style.top = capStyle.y * 100 + "%";
    el.style.fontSize = stage.clientHeight * CAP_RATIO * capStyle.size + "px";
    el.classList.toggle("sel", !!(sel && sel.type === "c"));
  }

  // Déplacer / agrandir sur l'aperçu (superpositions et légendes)
  // Gestes à 1 doigt (déplacer) et 2 doigts (agrandir / tourner), comme CapCut
  const touches = new Map();
  let gest = null, suppressClick = false;
  stage.addEventListener("pointerdown", e => {
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const tb = e.target.closest(".etx");
    const ob = e.target.closest(".eov");
    let k = null, i = -1;
    if (tb) { k = "t"; i = [...txEls.values()].find(v => v.box === tb).i; }
    else if (ob && !e.target.closest(".ox") && !e.target.closest(".orz")) { k = "o"; i = [...ovEls.values()].find(v => v.box === ob).i; }
    else if (gest && touches.size === 2) k = gest.k, i = gest.i;
    else if (e.target === view && sel && sel.type === "v") { k = "v"; i = sel.i; }
    if (!k) return;
    e.preventDefault();
    pause();
    if (!gest) { save(); if (!(sel && sel.type === k && sel.i === i)) { sel = { type: k, i }; draw(); } }
    const it = itemOf(k, i), local = t - startOfItem(k, i);
    const pts = [...touches.values()];
    const mid = pts.length > 1 ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } : pts[0];
    gest = { k, i, v0: valAt(k, it, local), mid0: mid, d0: pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      a0: pts.length > 1 ? Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) : 0, moved: false };
  }, { capture: true });
  window.addEventListener("pointermove", e => {
    if (!touches.has(e.pointerId)) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!gest) return;
    const r = stage.getBoundingClientRect(), pts = [...touches.values()];
    const mid = pts.length > 1 ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } : pts[0];
    const ch = { x: gest.v0.x + (mid.x - gest.mid0.x) / r.width, y: gest.v0.y + (mid.y - gest.mid0.y) / r.height };
    if (Math.hypot(mid.x - gest.mid0.x, mid.y - gest.mid0.y) > 4) gest.moved = true;
    if (pts.length > 1 && gest.d0) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), a = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
      ch.scale = Math.min(gest.k === "v" ? 5 : 4, Math.max(gest.k === "v" ? 0.5 : 0.1, gest.v0.scale * d / gest.d0));
      ch.rot = gest.v0.rot + (a - gest.a0) * 180 / Math.PI;
      gest.moved = true;
    }
    if (gest.k !== "v") { ch.x = Math.min(1.2, Math.max(-0.2, ch.x)); ch.y = Math.min(1.2, Math.max(-0.2, ch.y)); }
    setProps(gest.k, gest.i, ch);
    drawOverlays(); renderStill(t);
  });
  const endTouch = e => {
    touches.delete(e.pointerId);
    if (!gest) return;
    if (touches.size === 1) {   // on repasse à un doigt : nouveau point de départ
      const it = itemOf(gest.k, gest.i);
      gest.v0 = valAt(gest.k, it, t - startOfItem(gest.k, gest.i)); gest.mid0 = [...touches.values()][0]; gest.d0 = 0;
      return;
    }
    if (!touches.size) { if (gest.moved) suppressClick = true; gest = null; draw(); renderStill(t); }
  };
  window.addEventListener("pointerup", endTouch);
  window.addEventListener("pointercancel", endTouch);

  stage.addEventListener("pointerdown", e => {
    const capEl = e.target.closest("#edCap"), box = e.target.closest(".eov");
    if (!capEl && !box) return;
    if (box && !e.target.closest(".ox") && !e.target.closest(".orz")) return;   // déplacement géré au-dessus
    e.preventDefault();
    pause();
    const r = stage.getBoundingClientRect();
    if (capEl) {
      const i = caps.findIndex(c => t >= c.start && t < c.start + len(c));
      save();
      sel = { type: "c", i }; drawTools();
      const x0 = e.clientX, y0 = e.clientY, sx = capStyle.x, sy = capStyle.y;
      return dragOn(ev => {
        capStyle.x = Math.min(0.9, Math.max(0.1, sx + (ev.clientX - x0) / r.width));
        capStyle.y = Math.min(0.95, Math.max(0.05, sy + (ev.clientY - y0) / r.height));
        drawCaption(); if (!playing) renderStill(t);
      });
    }
    const entry = [...ovEls.values()].find(v => v.box === box);
    const o = overlays[entry.i];
    if (e.target.closest(".ox")) { save(); overlays.splice(entry.i, 1); sel = null; return draw(); }
    save();
    sel = { type: "o", i: entry.i }; draw();
    const x0 = e.clientX, y0 = e.clientY, os = valAt("o", o, t - o.start).scale;
    dragOn(ev => {
      setProps("o", entry.i, { scale: Math.min(4, Math.max(0.1, os + ((ev.clientX - x0) + (ev.clientY - y0) * 9 / 16) / r.width)) });
      drawOverlays(); if (!playing) renderStill(t);
    });
  });
  function dragOn(move) {
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  // ---------- Moteur vidéo (Mediabunny) : aperçu image par image, sans freeze ----------
  // Comme CapCut Web / Clipchamp : on décode nous-mêmes les images (WebCodecs) et on les dessine.
  // Aperçu en petite qualité (fluide), export en pleine qualité sur le téléphone.
  const FPS = 30, PW = 432, PH = 768, EW = 1080, EH = 1920;
  let MB = null;
  const loadMB = () => (MB ? Promise.resolve(MB) : import("./vendor/mediabunny.min.mjs").then(m => (MB = m)));
  let AC = null;
  const audioCtx = () => (AC ||= new (window.AudioContext || window.webkitAudioContext)());
  const view = $("edCanvas"), vg = view.getContext("2d");
  view.width = PW; view.height = PH;

  // Ouvre un fichier une seule fois : pistes vidéo/son, durée, lecteur d'aperçu
  function media(ref) {
    if (ref._p) return ref._p;
    return (ref._p = (async () => {
      if (ref.image) {
        const img = new Image(); img.src = ref.url;
        await img.decode().catch(() => {});
        return (ref._m = { image: img, dur: 3600 });
      }
      await loadMB();
      const blob = ref.file || await (await fetch(ref.url)).blob();
      const input = new MB.Input({ source: new MB.BlobSource(blob), formats: MB.ALL_FORMATS });
      const v = await input.getPrimaryVideoTrack().catch(() => null);
      const a = await input.getPrimaryAudioTrack().catch(() => null);
      const m = { input, dur: await input.computeDuration().catch(() => 5) };
      m.v = v && await v.canDecode().catch(() => false) ? v : null;
      m.a = a && await a.canDecode().catch(() => false) ? a : null;
      if (m.v) { m.prev = new MB.CanvasSink(m.v, { width: PW, height: PH, fit: "contain", poolSize: 10 }); m.off = 0; m.vt = m.v; }
      ref._m = m;
      if (m.v) buildProxy(ref, m, blob);   // copie légère pour un aperçu fluide
      decodeAudio(ref);   // le son se prépare en arrière-plan
      return m;
    })());
  }
  // ---------- Proxys : copie légère de chaque vidéo pour l'aperçu (l'export garde l'original) ----------
  let proxyQueue = Promise.resolve(), proxyTodo = 0, proxyDone = 0;
  function proxyLabel() { $("edProxy").textContent = proxyTodo > proxyDone ? `Préparation de l'aperçu ${proxyDone + 1}/${proxyTodo}…` : ""; }
  function buildProxy(ref, m, blob) {
    proxyTodo++; proxyLabel();
    proxyQueue = proxyQueue.then(async () => {
      try {
        const input = new MB.Input({ source: new MB.BlobSource(blob), formats: MB.ALL_FORMATS });
        const output = new MB.Output({ format: new MB.Mp4OutputFormat({ fastStart: "in-memory" }), target: new MB.BufferTarget() });
        const conv = await MB.Conversion.init({ input, output,
          video: { width: PW, height: PH, fit: "contain", frameRate: FPS, codec: "avc", bitrate: 1.2e6, keyFrameInterval: 0.5, forceTranscode: true },
          audio: { discard: true } });
        if (!conv.isValid) throw new Error("proxy impossible");
        conv.onProgress = pr => { $("edProxy").textContent = `Préparation de l'aperçu ${proxyDone + 1}/${proxyTodo}… ${Math.round(pr * 100)} %`; };
        await conv.execute();
        input.dispose && input.dispose();
        const pin = new MB.Input({ source: new MB.BlobSource(new Blob([output.target.buffer], { type: "video/mp4" })), formats: MB.ALL_FORMATS });
        const pv = await pin.getPrimaryVideoTrack();
        const off = (await pv.getFirstTimestamp().catch(() => 0)) - (await m.v.getFirstTimestamp().catch(() => 0));
        m.prev = new MB.CanvasSink(pv, { width: PW, height: PH, fit: "contain", poolSize: 10 });
        m.vt = pv; m.small = null;
        m.off = off;
        m.proxy = true;
        if (!playing) { closeFeeds(); renderStill(t); }
      } catch (e) { /* on garde l'original pour l'aperçu */ }
      proxyDone++; proxyLabel();
    });
  }
  async function mediaDuration(ref) {
    if (ref.dur) return ref.dur;
    if (ref.image) return (ref.dur = 3);
    try { return (ref.dur = (await media(ref)).dur || 5); } catch (e) { return (ref.dur = 5); }
  }
  // Tout le son d'un fichier dans un AudioBuffer (pour l'aperçu, les légendes et l'export)
  function decodeAudio(ref) {
    if (ref._ab !== undefined) return ref._ab;
    return (ref._ab = (async () => {
      const m = await media(ref);
      if (!m.a) return null;
      const parts = [];
      for await (const w of new MB.AudioBufferSink(m.a).buffers()) parts.push(w);
      if (!parts.length) return null;
      const sr = parts[0].buffer.sampleRate, ch = parts[0].buffer.numberOfChannels, t0 = parts[0].timestamp;
      const last = parts[parts.length - 1];
      const n = Math.ceil((last.timestamp - t0 + last.buffer.duration) * sr) + 1;
      const out = audioCtx().createBuffer(ch, n, sr);
      for (const w of parts) {
        const at = Math.max(0, Math.round((w.timestamp - t0) * sr));
        for (let c = 0; c < ch; c++) out.getChannelData(c).set(w.buffer.getChannelData(Math.min(c, w.buffer.numberOfChannels - 1)).subarray(0, n - at), at);
      }
      ref._abReady = out;
      return out;
    })().catch(() => null));
  }

  // Flux d'images d'un élément (plan ou superposition), décodées à l'avance
  class Feed {
    constructor(sink, item, k0, off = 0, step = 1, depth = 6) {
      this.sink = sink; this.k0 = k0; this.k = -1; this.q = []; this.cur = null; this.done = false; this.busy = false;
      this.step = step; this.depth = depth;
      const self = this;
      this.it = sink.canvasesAtTimestamps((function* () {
        for (let k = k0; ; k += step) { const ts = item.in + (k / FPS) * sp(item); if (ts >= item.out || self.done) return; yield ts + off; }
      })());
      this.pump();
    }
    async pump() {
      if (this.busy) return;
      this.busy = true;
      try { while (!this.done && this.q.length < this.depth) { const r = await this.it.next(); if (r.done) this.done = true; else this.q.push(r.value); } }
      catch (e) { this.done = true; }
      this.busy = false;
    }
    frame(kAbs) {   // image pour le numéro d'image demandé (garde la dernière si le décodage a du retard)
      const want = Math.floor((kAbs - this.k0) / this.step);
      while (this.k < want && this.q.length) { const f = this.q.shift(); this.k++; if (f) this.cur = f.canvas; }
      this.pump();
      return this.cur;
    }
    close() { this.done = true; this.q = []; }
  }
  const feeds = new Map();   // élément -> Feed
  // Les superpositions sont décodées en petit (affichées en petit), le plan principal en taille aperçu
  function smallSink(m) {
    if (!m.small && m.vt) m.small = new MB.CanvasSink(m.vt, { width: PW / 2, height: PH / 2, fit: "contain", poolSize: 7 });
    return m.small;
  }
  let ovStep = 1;   // plusieurs superpositions en même temps : aperçu à 15 images/s pour elles (l'export reste à 30)
  function feedFor(item, kAbs, overlay = false) {
    const m = item.ref && item.ref._m;
    if (!m || !m.prev) return null;
    const sink = overlay ? smallSink(m) : m.prev, step = overlay ? ovStep : 1;
    let f = feeds.get(item);
    const pos = f ? f.k0 + Math.max(0, f.k) * f.step : 0;
    if (!f || f.sink !== sink || f.step !== step || kAbs < pos - f.step || kAbs - pos > 20) {   // trop loin : on recommence ici
      if (f) f.close();
      f = new Feed(sink, item, Math.max(0, kAbs), m.off || 0, step, overlay ? 4 : 6);
      feeds.set(item, f);
    }
    return f;
  }
  function closeFeeds() { feeds.forEach(f => f.close()); feeds.clear(); }

  // Dessin d'une image complète (plan + superpositions) sur un canvas
  const TXT_RATIO = 0.06;
  function drawMain(g, W, H, src, c, local) {   // plan principal avec zoom / cadrage / rotation
    const v = valAt("v", c, local);
    if (v.scale === 1 && !v.x && !v.y && !v.rot) return g.drawImage(src, 0, 0, W, H);
    g.save();
    g.translate(W / 2 + v.x * W, H / 2 + v.y * H); g.rotate(v.rot * Math.PI / 180); g.scale(v.scale, v.scale);
    g.drawImage(src, -W / 2, -H / 2, W, H);
    g.restore();
  }
  function drawOverlayImg(g, W, H, src, o, local = t - o.start) {
    const v = valAt("o", o, local);
    const bw = v.scale * W, bh = bw * 16 / 9;
    g.save();
    g.globalAlpha = Math.max(0, Math.min(1, v.op));
    g.translate(v.x * W, v.y * H); g.rotate(v.rot * Math.PI / 180);
    if (src instanceof HTMLImageElement) {
      const r = Math.min(bw / src.naturalWidth, bh / src.naturalHeight), w = src.naturalWidth * r, h = src.naturalHeight * r;
      g.drawImage(src, -w / 2, -h / 2, w, h);
    } else g.drawImage(src, -bw / 2, -bh / 2, bw, bh);
    g.restore();
  }
  function drawTexts(g, W, H, time) {
    texts.forEach(x => {
      if (time < x.start || time >= x.start + len(x)) return;
      const v = valAt("t", x, time - x.start), size = H * TXT_RATIO * v.scale;
      g.save();
      g.globalAlpha = Math.max(0, Math.min(1, v.op));
      g.translate(v.x * W, v.y * H); g.rotate(v.rot * Math.PI / 180);
      g.font = `800 ${size}px Inter, system-ui, sans-serif`;
      g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
      const lines = String(x.text).split("\n"), lh = size * 1.1;
      lines.forEach((l, j) => {
        const y = (j - (lines.length - 1) / 2) * lh;
        g.lineWidth = size * 0.14; g.strokeStyle = "#000"; g.strokeText(l, 0, y);
        g.fillStyle = "#fff"; g.fillText(l, 0, y);
      });
      g.restore();
    });
  }
  let lastMain = null;
  function renderPlaying(time) {
    const { i, off } = locate(time);
    if (i < 0) return;
    const c = clips[i], k = Math.floor(off * FPS + 1e-6);
    const f = feedFor(c, k);
    const img = f && f.frame(k);
    if (img) lastMain = img;
    if (!lastMain) return;   // rien de décodé encore : on garde l'image affichée
    vg.fillStyle = "#000"; vg.fillRect(0, 0, PW, PH);
    drawMain(vg, PW, PH, lastMain, c, off);
    // prépare le plan suivant à l'avance : zéro latence au passage
    if (clips[i + 1] && len(c) - off < 1.5) feedFor(clips[i + 1], 0);
    const visible = overlays.filter(o => time >= o.start && time < o.start + len(o) && !o.ref.image).length;
    ovStep = visible >= 2 ? 2 : 1;
    overlays.forEach(o => {
      if (time < o.start || time >= o.start + len(o)) return;
      if (o.ref.image) { if (o.ref._m) drawOverlayImg(vg, PW, PH, o.ref._m.image, o, time - o.start); return; }
      const ko = Math.floor((time - o.start) * FPS + 1e-6), fo = feedFor(o, ko, true), im = fo && fo.frame(ko);
      if (im) drawOverlayImg(vg, PW, PH, im, o, time - o.start);
    });
    drawTexts(vg, PW, PH, time);
    drawCaps(vg, PW, PH, time);
    // libère les flux qui ne servent plus
    feeds.forEach((f, item) => {
      const keep = item === c || item === clips[i + 1] || (overlays.includes(item) && time >= item.start - 1.5 && time < item.start + len(item));
      if (!keep) { f.close(); feeds.delete(item); }
    });
  }
  let stillToken = 0, stillBusy = false, stillNext = null;
  async function renderStill(time) {   // image fixe (pause, défilement) : un seul calcul à la fois, le dernier demandé gagne
    if (stillBusy) { stillNext = time; return; }
    stillBusy = true;
    try { await renderStillNow(time); } finally { stillBusy = false; }
    if (stillNext !== null) { const n = stillNext; stillNext = null; renderStill(n); }
  }
  async function renderStillNow(time) {
    const my = ++stillToken;
    const { i, off } = locate(time);
    if (i < 0) { vg.fillStyle = "#000"; vg.fillRect(0, 0, PW, PH); return; }
    const c = clips[i];
    const m = await media(c.ref).catch(() => null);
    const w = m && m.prev ? await m.prev.getCanvas(c.in + off * sp(c) + (m.off || 0)).catch(() => null) : null;
    const ovs = [];
    for (const o of overlays) {
      if (time < o.start || time >= o.start + len(o)) continue;
      const mo = await media(o.ref).catch(() => null);
      if (!mo) continue;
      if (mo.image) ovs.push([mo.image, o]);
      else if (mo.prev) { const wo = await smallSink(mo).getCanvas(o.in + (time - o.start) * sp(o) + (mo.off || 0)).catch(() => null); if (wo) ovs.push([wo.canvas, o]); }
    }
    if (my !== stillToken) return;
    vg.fillStyle = "#000"; vg.fillRect(0, 0, PW, PH);
    if (w) { drawMain(vg, PW, PH, w.canvas, c, off); lastMain = null; }
    ovs.forEach(([src, o]) => drawOverlayImg(vg, PW, PH, src, o, time - o.start));
    drawTexts(vg, PW, PH, time);
    drawCaps(vg, PW, PH, time);
  }

  // ---------- Lecture : horloge du son = image et son parfaitement calés ----------
  let nodes = [], playT0 = 0, ac0 = 0;
  function resetPlayers() { closeFeeds(); lastMain = null; }
  let session = 0;   // chaque lecture a son numéro : un son ne peut jamais être lancé deux fois
  function scheduleAudio(from, when, only = null) {
    const ac = audioCtx(), my = session, waiting = new Set();
    const add = (ref, startTl, bufIn, bufOut, rate, vol) => {
      if (!vol || (only && ref !== only)) return;
      const buf = ref._abReady;
      if (!buf) {   // son pas encore prêt : il rejoindra la lecture dès qu'il l'est
        if (ref._abReady === undefined && !only && !waiting.has(ref)) {
          waiting.add(ref);
          decodeAudio(ref).then(() => {
            if (!playing || session !== my || !ref._abReady) return;
            const w = ac.currentTime + 0.03;
            scheduleAudio(playT0 + (w - ac0), w, ref);
          });
        }
        return;
      }
      const tlLen = (bufOut - bufIn) / rate;
      if (startTl + tlLen <= from) return;
      const skip = Math.max(0, from - startTl);
      const src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buf; src.playbackRate.value = rate; g.gain.value = vol;
      src.connect(g).connect(ac.destination);
      src.start(when + Math.max(0, startTl - from), bufIn + skip * rate, Math.max(0.01, bufOut - bufIn - skip * rate));
      nodes.push(src);
    };
    let at = 0;
    clips.forEach(c => {
      if (!clipMute && !voiceRec && sp(c) <= 2) add(c.ref, at, c.in, c.out, sp(c), c.vol);
      at += len(c);
    });
    overlays.forEach(o => { if (!o.ref.image && !voiceRec) add(o.ref, o.start, o.in, o.out, sp(o), o.vol); });
    audios.forEach(a => add(a.ref, a.start, a.in, a.out, 1, a.vol));
  }
  function stopAudio() { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); nodes = []; }
  function setScroll(time) {
    programmatic = true;
    tl.scrollLeft = time * PPS;
    requestAnimationFrame(() => (programmatic = false));
  }
  function refreshAt() { drawOverlays(); drawCaption(); showTime(); if (!playing) updKf(); }
  function seek(time) {
    t = Math.min(Math.max(0, time), total());
    setScroll(t);
    renderStill(t);
    refreshAt();
  }
  function play() {
    if (!clips.length || playing) return;   // déjà en lecture : on ne relance rien
    if (t >= total() - 0.05) t = 0;
    const ac = audioCtx();
    ac.resume();
    playing = true;
    session++;
    stopAudio();
    $("edPlay").innerHTML = ic("pause", 30);
    closeFeeds();
    const when = ac.currentTime + 0.12;   // petite avance : les premières images se décodent
    playT0 = t; ac0 = when;
    scheduleAudio(t, when);
    renderPlaying(t);
    requestAnimationFrame(loop);
  }
  function pause() {
    if (!playing) return;
    playing = false;
    session++;
    $("edPlay").innerHTML = ic("play", 30);
    stopAudio();
    closeFeeds();
    renderStill(t);
  }
  $("edPlay").onclick = () => (playing ? pause() : play());
  view.addEventListener("click", () => { if (suppressClick) { suppressClick = false; return; } playing ? pause() : play(); });

  function loop() {
    if (!playing) return;
    t = Math.min(total(), playT0 + Math.max(0, audioCtx().currentTime - ac0));
    if (t >= total() - 0.001) { playing = false; $("edPlay").innerHTML = ic("play", 30); stopAudio(); closeFeeds(); t = total(); setScroll(t); refreshAt(); return; }
    renderPlaying(t);
    setScroll(t);
    refreshAt();
    requestAnimationFrame(loop);
  }

  // Faire défiler = se déplacer (bloqué à la fin du montage)
  let scrollTimer;
  tl.addEventListener("scroll", () => {
    const max = total() * PPS;
    if (tl.scrollLeft > max) tl.scrollLeft = max;
    if (programmatic || dragging) return;
    if (playing) pause();
    t = Math.min(tl.scrollLeft / PPS, total());
    refreshAt();
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => renderStill(t), 30);
  });

  // ---------- Gestes : toucher, appui long pour déplacer, poignées ----------
  let dragging = null, press = null;
  tl.addEventListener("touchmove", e => { if (dragging) e.preventDefault(); }, { passive: false });

  items.addEventListener("pointerdown", e => {
    const ph = e.target.closest(".eph");
    if (ph) { press = { ph: ph.dataset.ph, x: e.clientX, y: e.clientY }; return; }
    const el = e.target.closest("[data-k]");
    if (!el) return;
    const kind = el.dataset.k, i = +el.dataset.i;
    const kfEl = e.target.closest(".ekf");
    if (kfEl) { e.preventDefault(); pause(); sel = { type: kind, i }; seek(startOfItem(kind, i) + +kfEl.dataset.kt); draw(); return; }
    const handle = e.target.closest(".ehandle");
    if (handle) { e.preventDefault(); return startTrim(e, kind, i, handle.dataset.h); }
    const picked = kind !== "v" && sel && sel.type === kind && sel.i === i;
    press = { x: e.clientX, y: e.clientY, kind, i, moved: false, picked };
    if (picked) e.preventDefault();
    press.timer = setTimeout(() => { if (press && !press.moved) startMove(press); }, 380);
  });
  items.addEventListener("pointermove", e => {
    if (press && !dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) {
      clearTimeout(press.timer);
      if (press.picked) { startMove(press, true); return; }   // son/légende déjà sélectionné : on le déplace tout de suite
      press.moved = true;
    }
  });
  items.addEventListener("pointerup", () => {
    if (press && !press.moved && !dragging) {
      clearTimeout(press.timer);
      if (press.ph === "sound") soundSheet();
      else if (press.ph === "cap") captionSheet();
      else if (press.ph === "ov") $("edOvFile").click();
      else if (press.ph === "txt") textAddSheet();
      else {
        const same = sel && sel.type === press.kind && sel.i === press.i;
        sel = same ? null : { type: press.kind, i: press.i };
        draw();
      }
    }
    if (press) clearTimeout(press.timer);
    press = null;
  });
  items.addEventListener("pointercancel", () => { if (press) clearTimeout(press.timer); press = null; });

  function autoScroll(x) {
    const r = tl.getBoundingClientRect();
    if (x < r.left + 40) tl.scrollLeft -= 8;
    if (x > r.right - 40) tl.scrollLeft = Math.min(tl.scrollLeft + 8, total() * PPS);
  }

  function startMove(p, quiet) {
    if (navigator.vibrate && !quiet) navigator.vibrate(15);
    pause();
    save();
    dragging = p;
    sel = { type: p.kind, i: p.i };
    draw();
    const el = items.querySelector(`[data-k="${p.kind}"][data-i="${p.i}"]`);
    el.classList.add("drag");
    const startX = p.x, startScroll = tl.scrollLeft, baseLeft = parseFloat(el.style.left);
    let target = p.i;
    const move = e => {
      autoScroll(e.clientX);
      const dx = e.clientX - startX + (tl.scrollLeft - startScroll);
      el.style.left = baseLeft + dx + "px";
      if (p.kind !== "v") return;
      // plans : on calcule la nouvelle place et on pousse les autres
      const centre = baseLeft + dx + el.offsetWidth / 2 - half();
      const others = clips.map((c, j) => j).filter(j => j !== p.i);
      let acc = 0; target = others.length;
      for (let k = 0; k < others.length; k++) {
        const w = len(clips[others[k]]) * PPS;
        if (centre < acc + w / 2) { target = k; break; }
        acc += w;
      }
      let x = half(), k = 0;
      for (const j of others) {
        if (k === target) x += len(clips[p.i]) * PPS;
        items.querySelector(`[data-k="v"][data-i="${j}"]`).style.left = x + "px";
        x += len(clips[j]) * PPS; k++;
      }
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (p.kind === "v") {
        clips.splice(target, 0, clips.splice(p.i, 1)[0]);
        sel = { type: "v", i: target };
      } else {
        arr(p.kind)[p.i].start = Math.max(0, Math.min(total() - 0.1, (parseFloat(el.style.left) - half()) / PPS));
      }
      dragging = null; resetPlayers();
      draw(); seek(t);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  function startTrim(e, kind, i, side) {
    pause();
    save();
    dragging = { trim: true };
    const item = kind === "v" ? clips[i] : arr(kind)[i];
    const maxOut = item.ref ? (item.ref.image ? 3600 : item.ref.dur || item.out) : 3600;
    const x0 = e.clientX, in0 = item.in, out0 = item.out, start0 = item.start;
    const move = ev => {
      const d = (ev.clientX - x0) / PPS * sp(item);       // en secondes de la vidéo d'origine
      if (side === "l") {
        item.in = Math.min(Math.max(0, in0 + d), out0 - 0.2);
        if (kind !== "v") item.start = Math.max(0, start0 + (item.in - in0) / sp(item));
      } else item.out = Math.max(Math.min(maxOut, out0 + d), in0 + 0.2);
      draw();
      $("edTime").innerHTML = lastTime = `<b>${len(item).toFixed(1)} s</b>`;
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      dragging = null; resetPlayers();
      draw(); seek(Math.min(t, total()));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  // ---------- Outils ----------
  $("edAdd").onclick = () => $("edFile").click();
  $("edFile").addEventListener("change", async e => {
    const list = [...e.target.files].map(f => ({ file: f, url: URL.createObjectURL(f) }));
    e.target.value = "";
    await addVideos(list);
    seek(t);
  });
  $("edOvFile").addEventListener("change", async e => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const ref = { file: f, url: URL.createObjectURL(f), image: f.type.startsWith("image/") };
    refs.push(ref);
    const d = await mediaDuration(ref);
    save();
    overlays.push({ ref, start: Math.min(t, Math.max(0, total() - 0.5)), in: 0, out: Math.min(d, Math.max(0.5, total() - t)), vol: 1, x: 0.5, y: 0.45, scale: 0.6 });
    sel = { type: "o", i: overlays.length - 1 };
    if (!ref.image && typeof makeThumb === "function") makeThumb(ref).then(draw);
    draw(); seek(t);
  });
  $("edMute").onclick = () => { save(); clipMute = !clipMute; draw(); seek(t); toast(clipMute ? "Son des vidéos coupé" : "Son des vidéos activé"); };

  // Voix off : on reste appuyé pour enregistrer, on lâche pour arrêter
  $("edTools").addEventListener("pointerdown", e => {
    if (e.target.closest('[data-t="voice"]')) { e.preventDefault(); startVoice(); }
    if (e.target.closest('[data-t="camera"]')) { e.preventDefault(); camPress = setTimeout(() => { camPress = null; startCam(); }, 250); }
  });
  ["pointerup", "pointercancel"].forEach(ev => window.addEventListener(ev, () => {
    if (voiceRec) stopVoice();
    if (camPress) { clearTimeout(camPress); camPress = null; if (ev === "pointerup") openFullCamera(); }   // appui simple : caméra complète
    else if (camRec || camWanted) stopCam();
  }));
  $("edTools").addEventListener("contextmenu", e => e.preventDefault());
  $("edTools").addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.t !== "voice" && b.dataset.t !== "camera") tool(b.dataset.t); });

  function tool(name) {
    pause();
    let changed = true;
    const list = sel && sel.type !== "v" ? arr(sel.type) : null;
    if (name === "back") { sel = null; changed = false; }
    else if (name === "edit") { if (!clips.length) return; sel = { type: "v", i: locate(t).i }; changed = false; }
    else if (name === "split" && sel && sel.type === "v") {
      const { i, off } = locate(t);
      if (i !== sel.i) return toast("Place la barre blanche sur le plan sélectionné");
      const c = clips[i];
      if (off < 0.1 || off > len(c) - 0.1) return toast("Place la barre blanche au milieu du plan");
      save();
      const cut = c.in + off * sp(c);
      clips.splice(i, 1, { ...c, out: cut }, { ...c, in: cut });
      sel = { type: "v", i: i + 1 };
    } else if (name === "split" && list) {
      const a = list[sel.i], off = t - a.start;
      if (off < 0.1 || off > len(a) - 0.1) return toast("Place la barre blanche sur l'élément");
      save();
      // les clés d'animation suivent chaque morceau
      const kA = (a.kf || []).filter(k => k.t <= off).map(k => ({ ...k })), kB = (a.kf || []).filter(k => k.t >= off).map(k => ({ ...k, t: +(k.t - off).toFixed(3) }));
      list.splice(sel.i, 1, { ...a, out: a.in + off * sp(a), kf: kA }, { ...a, start: t, in: a.in + off * sp(a), kf: kB });
      sel = { type: sel.type, i: sel.i + 1 };
    } else if (name === "dup" && sel) {
      save();
      if (sel.type === "v") { clips.splice(sel.i + 1, 0, { ...clips[sel.i] }); sel = { type: "v", i: sel.i + 1 }; }
      else { const a = list[sel.i]; list.push({ ...a, start: a.start + len(a) }); sel = { type: sel.type, i: list.length - 1 }; }
    } else if (name === "del" && sel) {
      save();
      (sel.type === "v" ? clips : list).splice(sel.i, 1);
      sel = null;
    } else if (name === "delcaps") { save(); caps = []; sel = null; }
    else if (name === "speed") return speedSheet();
    else if (name === "adjust") return adjustSheet();
    else if (name === "ai") return assistSheet();
    else if (name === "addtext") return textAddSheet();
    else if (name === "edittext") return textAddSheet(sel.i);
    else if (name === "volume") return volumeSheet();
    else if (name === "text") return textSheet();
    else if (name === "style") return styleSheet();
    else if (name === "captions") return captionSheet();
    else if (name === "sound") return soundSheet();
    else if (name === "overlay") return $("edOvFile").click();
    if (changed) resetPlayers();
    draw(); seek(Math.min(t, total()));
  }

  // ----- Texte libre -----
  function textAddSheet(edit) {
    pause();
    const cur = edit !== undefined ? texts[edit] : null;
    sheet(`<b>${cur ? "Modifier le texte" : "Ajouter un texte"}</b>
      <input type="text" id="edTxt" value="${cur ? esc(cur.text) : ""}" placeholder="Ton texte">
      <button class="main" id="edTxtOk">OK</button>`);
    setTimeout(() => $("edTxt").focus(), 50);
    $("edTxtOk").onclick = () => {
      const v = $("edTxt").value.trim();
      if (!v) return closeSheet();
      save();
      if (cur) cur.text = v;
      else {
        const start = Math.min(t, Math.max(0, total() - 0.5));
        texts.push({ text: v, start, in: 0, out: Math.max(0.5, Math.min(3, total() - start)), x: 0.5, y: 0.35, scale: 1, rot: 0, op: 1, kf: [] });
        sel = { type: "t", i: texts.length - 1 };
      }
      closeSheet(); draw(); renderStill(t);
      if (!cur) toast("Glisse le texte sur l'image, pince pour l'agrandir ou le tourner. ◇ pour l'animer.", 3500);
    };
  }
  // ----- Ajuster : zoom / taille, rotation, transparence (crée une clé si l'élément est animé) -----
  function adjustSheet() {
    const k = sel.type, i = sel.i, it = itemOf(k, i), v = valAt(k, it, t - startOfItem(k, i));
    save();
    const row = (id, label, min, max, val) => `<div style="display:flex;justify-content:space-between;font-size:13px"><span>${label}</span><span id="${id}V">${val}</span></div><input type="range" id="${id}" min="${min}" max="${max}" value="${val}">`;
    sheet(`<b>Ajuster</b>${it.kf && it.kf.length ? `<div class="small" style="color:#999">Élément animé : les changements créent une clé à cet instant.</div>` : ""}
      ${row("adS", k === "v" ? "Zoom (%)" : "Taille (%)", k === "v" ? 50 : 10, k === "v" ? 400 : 300, Math.round(v.scale * 100))}
      ${row("adR", "Rotation (°)", -180, 180, Math.round(v.rot))}
      ${k === "v" ? row("adX", "Cadrage horizontal (%)", -50, 50, Math.round(v.x * 100)) + row("adY", "Cadrage vertical (%)", -50, 50, Math.round(v.y * 100)) : row("adO", "Opacité (%)", 0, 100, Math.round(v.op * 100))}
      <button class="main alt" id="adReset">Réinitialiser</button>`);
    const map = { adS: ["scale", 100], adR: ["rot", 1], adX: ["x", 100], adY: ["y", 100], adO: ["op", 100] };
    Object.entries(map).forEach(([id, [p, div]]) => {
      const el = $(id);
      if (!el) return;
      el.oninput = () => { $(id + "V").textContent = el.value; setProps(k, i, { [p]: +el.value / div }); drawOverlays(); renderStill(t); };
    });
    $("adReset").onclick = () => { it.kf = []; PROPS[k].forEach(p => delete it[p]); if (k !== "v") { it.x = 0.5; it.y = 0.4; } closeSheet(); draw(); renderStill(t); };
  }

  // ----- Vitesse (x0,5 à x100) -----
  // Curseur continu, réparti en logarithme : autant de place de 0,5 à 5 que de 5 à 100
  const toSpeed = v => { const x = 0.5 * Math.pow(200, v / 1000); return Math.abs(x - 1) < 0.04 ? 1 : x < 10 ? +x.toFixed(2) : Math.round(x); };
  const fromSpeed = x => Math.round(1000 * Math.log(x / 0.5) / Math.log(200));
  function speedSheet() {
    const c = clips[sel.i];
    save();
    sheet(`<b>Vitesse</b><div class="ebig" id="edSpVal">x${sp(c)}</div>
      <input type="range" id="edSp" min="0" max="1000" step="1" value="${fromSpeed(sp(c))}">
      <div class="estops" style="position:relative;height:14px">${[0.5, 1, 2, 5, 20, 100].map(v => `<span style="position:absolute;left:${fromSpeed(v) / 10}%;transform:translateX(-${fromSpeed(v) / 10}%)">${v}</span>`).join("")}</div>
      <div class="small" id="edSpInfo"></div>`);
    const upd = () => {
      c.speed = toSpeed(+$("edSp").value);
      $("edSpVal").textContent = "x" + c.speed;
      $("edSpInfo").textContent = `Durée du plan : ${len(c).toFixed(1)} s` + (c.speed > 2 ? " · son coupé (accéléré)" : "");
      resetPlayers(); draw(); renderStill(Math.min(t, total())); showTime();
    };
    $("edSp").oninput = upd;
    upd();
  }

  // ----- Volume (0 à 200 %) -----
  function volumeSheet() {
    const x = sel.type === "v" ? clips[sel.i] : arr(sel.type)[sel.i];
    save();
    sheet(`<b>Volume</b><div class="ebig" id="edVolVal">${Math.round(x.vol * 100)} %</div>
      <input type="range" id="edVol" min="0" max="200" step="5" value="${Math.round(x.vol * 100)}">
      <div class="estops"><span>0</span><span>100</span><span>200</span></div>
      <div class="small">Au-dessus de 100 %, l'effet s'entend sur la vidéo exportée (l'iPhone limite l'aperçu à 100 %).</div>`);
    $("edVol").oninput = () => { x.vol = +$("edVol").value / 100; $("edVolVal").textContent = $("edVol").value + " %"; draw(); };
  }

  // ----- Légendes façon TikTok -----
  function textSheet() {
    const c = caps[sel.i];
    sheet(`<b>Modifier le texte</b><input type="text" id="edCapTxt" value="${esc(c.text)}">
      <b>Taille</b><input type="range" id="edCapSize" min="60" max="180" step="5" value="${Math.round(capStyle.size * 100)}">
      <button class="main" id="edCapOk">OK</button>`);
    $("edCapSize").oninput = () => { capStyle.size = +$("edCapSize").value / 100; drawCaption(); renderStill(t); };
    $("edCapOk").onclick = () => { save(); const nt = $("edCapTxt").value.trim(); if (nt && nt !== c.text) { c.text = nt; c.words = null; } closeSheet(); draw(); seek(t); };
  }
  function captionSheet(auto) {
    if (caps.length && !auto) return toast("Touche une légende pour la modifier ou la déplacer");
    sheet(`<b>Légendes automatiques</b>
      <div class="small">L'appli écoute ce qui est dit (tes vidéos et ta voix off) et écrit les légendes. Tu pourras corriger chaque mot et les déplacer sur l'écran.</div>
      <button class="main" id="edCapGo">Générer les légendes</button>`);
    $("edCapGo").onclick = generateCaptions;
  }
  async function generateCaptions() {
    const say = txt => sheet(`<div style="font-size:15px;color:#ddd">⏳ ${txt}</div>`, false);
    try {
      say("Préparation du son…");
      const wav = await mixAudio();
      say("Transcription…");
      const data = await groqTranscribe(wav, true);
      const segs = data.segments && data.segments.length ? data.segments : [{ text: data.text || "", start: 0, end: total() }];
      save();
      caps = data.words && data.words.length ? chunkWords(data.words) : chunk(segs);
      sel = null;
      if (!caps.length) return sheet(`<div>Aucune parole entendue dans la vidéo.</div>`);
      closeSheet(); draw(); seek(t);
      toast("Légendes prêtes : touche-les pour corriger, glisse-les sur l'écran", 3500);
    } catch (err) {
      sheet(`<div style="color:#f87171">${esc(err.message)}</div>`);
    }
  }
  // Avec le temps de chaque mot : blocs de 1 à 3 mots (effet karaoké)
  function chunkWords(list) {
    const ws = list.map(x => ({ w: String(x.word).trim(), s: +x.start, e: +x.end })).filter(x => x.w);
    const out = [];
    let g = [];
    const push = () => { if (!g.length) return; const st = g[0].s, en = Math.max(g[g.length - 1].e, st + 0.2);
      out.push({ text: g.map(x => x.w).join(" "), start: +st.toFixed(3), in: 0, out: +(en - st).toFixed(3), words: g.map(x => ({ w: x.w, s: +(x.s - st).toFixed(3), e: +(x.e - st).toFixed(3) })) }); g = []; };
    ws.forEach((x, i) => {
      if (g.length && x.s - g[g.length - 1].e > 0.6) push();          // silence : nouveau bloc
      g.push(x);
      if (g.length >= 3 || g.map(y => y.w).join(" ").length > 14 || /[.,!?;:]$/.test(x.w)) push();
    });
    push();
    // pas de chevauchement entre blocs
    for (let i = 0; i < out.length - 1; i++) out[i].out = Math.min(out[i].out, +(out[i + 1].start - out[i].start).toFixed(3));
    return out;
  }
  // Découpe en petits blocs de 1 à 4 mots, comme TikTok
  function chunk(segs) {
    const out = [];
    segs.forEach(s => {
      const words = String(s.text).trim().split(/\s+/).filter(Boolean);
      if (!words.length) return;
      const groups = [];
      let g = [];
      words.forEach(w => { g.push(w); if (g.length >= 4 || g.join(" ").length > 18 || /[.,!?;:]$/.test(w)) { groups.push(g); g = []; } });
      if (g.length) groups.push(g);
      const chars = groups.reduce((n, gr) => n + gr.join(" ").length, 0) || 1;
      let at = s.start;
      groups.forEach(gr => {
        const d = (s.end - s.start) * gr.join(" ").length / chars;
        out.push({ text: gr.join(" "), start: +at.toFixed(3), in: 0, out: +Math.max(0.2, d).toFixed(3) });
        at += d;
      });
    });
    return out;
  }
  // Mélange le son du montage (plans + voix off) en un petit fichier WAV 16 kHz mono
  async function mixAudio() {
    const SR = 16000, dur = Math.max(0.5, total());
    const ctx = new OfflineAudioContext(1, Math.ceil(dur * SR), SR);
    const decode = ref => decodeAudio(ref);
    let at = 0;
    for (const c of clips) {
      const l = len(c);
      if (!clipMute && c.vol && sp(c) <= 2) {
        const b = await decode(c.ref);
        if (b) { const s = ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = sp(c); s.connect(ctx.destination); s.start(at, c.in, c.out - c.in); }
      }
      at += l;
    }
    for (const a of audios.filter(a => a.kind === "voice" && a.vol)) {
      const b = await decode(a.ref);
      if (b) { const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(a.start, a.in, a.out - a.in); }
    }
    return encodeWav((await ctx.startRendering()).getChannelData(0), SR);
  }
  function encodeWav(pcm, SR) {
    const view = new DataView(new ArrayBuffer(44 + pcm.length * 2));
    const w = (o, s) => [...s].forEach((ch, i) => view.setUint8(o + i, ch.charCodeAt(0)));
    w(0, "RIFF"); view.setUint32(4, 36 + pcm.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, SR, true); view.setUint32(28, SR * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    w(36, "data"); view.setUint32(40, pcm.length * 2, true);
    pcm.forEach((v, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 32767, true));
    return new Blob([view], { type: "audio/wav" });
  }
  // Envoie un son WAV à Groq et renvoie la réponse (essaie un autre modèle si besoin)
  async function groqTranscribe(wav, verbose) {
    let res, txt;
    for (const model of ["whisper-large-v3-turbo", "whisper-large-v3"]) {
      const fd = new FormData();
      fd.append("file", new File([wav], "son.wav", { type: "audio/wav" }));
      fd.append("model", model);
      fd.append("response_format", "verbose_json");
      fd.append("language", "fr");
      if (verbose) { fd.append("timestamp_granularities[]", "word"); fd.append("timestamp_granularities[]", "segment"); }
      res = await fetch(RELAY + "/transcribe", { method: "POST", body: fd });
      txt = await res.text();
      if (res.ok || !((res.status === 404 || res.status === 400) && /model/i.test(txt))) break;
    }
    if (!res.ok) { if (typeof checkCredit === "function") checkCredit("IA", res.status, txt); let why = txt; try { why = JSON.parse(txt).error.message || txt; } catch (e) {}
      throw new Error(`Groq a refusé (${res.status}) : ${String(why).slice(0, 160)}` + (res.status === 401 ? " → la clé dans AI_KEY n'est pas acceptée" : "")); }
    return JSON.parse(txt);
  }
  // Transcrit n'importe quelle vidéo (ex. une vidéo TikTok) : utilisé par la page Recherche
  window.transcribeBlob = async blob => {
    await loadMB();
    const input = new MB.Input({ source: new MB.BlobSource(blob), formats: MB.ALL_FORMATS });
    const a = await input.getPrimaryAudioTrack();
    if (!a || !(await a.canDecode())) throw new Error("pas de son lisible dans cette vidéo");
    const dur = Math.min(600, await input.computeDuration());
    const SR = 16000, ctx = new OfflineAudioContext(1, Math.ceil(dur * SR) + 1, SR);
    for await (const w of new MB.AudioBufferSink(a).buffers(0, dur)) {
      const src = ctx.createBufferSource(); src.buffer = w.buffer; src.connect(ctx.destination); src.start(Math.max(0, w.timestamp));
    }
    const data = await groqTranscribe(encodeWav((await ctx.startRendering()).getChannelData(0), SR), false);
    return String(data.text || "").trim();
  };

  // ----- Sons : ta bibliothèque de bruitages -----
  const libRefs = new Map();
  async function soundSheet() {
    pause();
    const list = await libList().catch(() => []);
    sheet(`<b>Mes bruitages</b>
      <div class="elib">${list.map(s => `<div><span>${esc(s.name)}</span><button data-p="${s.id}">▶</button><button class="add" data-s="${s.id}">${ic("plus", 18)}</button><button data-d="${s.id}">${ic("trash", 18)}</button></div>`).join("")
        || `<div class="small">Ta bibliothèque est vide. Importe des bruitages téléchargés : ils resteront ici.</div>`}</div>
      <button class="main" id="edSfxImport">+ Importer un bruitage</button>`);
    const preview = new Audio();
    const byId = id => list.find(s => s.id === +id);
    const refOf = s => {
      if (!libRefs.has(s.id)) libRefs.set(s.id, { lib: s.id, file: new File([s.blob], s.name + ".audio", { type: s.type || s.blob.type }), url: URL.createObjectURL(s.blob), label: s.name });
      return libRefs.get(s.id);
    };
    $("edSheetBody").querySelectorAll("[data-p]").forEach(b => b.onclick = () => { preview.src = refOf(byId(b.dataset.p)).url; preview.play().catch(() => {}); });
    $("edSheetBody").querySelectorAll("[data-s]").forEach(b => b.onclick = () => { addAudio(refOf(byId(b.dataset.s)), "sfx", t); closeSheet(); });
    $("edSheetBody").querySelectorAll("[data-d]").forEach(b => b.onclick = async () => {
      if (!confirm("Supprimer ce bruitage de ta bibliothèque ?")) return;
      await libDel(+b.dataset.d); soundSheet();
    });
    $("edSfxImport").onclick = () => $("edSfxFile").click();
  }
  $("edSfxFile").addEventListener("change", async e => {
    const fs = [...e.target.files];
    e.target.value = "";
    for (const f of fs) await libAdd(f).catch(() => toast("Impossible de garder ce fichier"));
    soundSheet();
  });

  // ----- Voix off (appui maintenu) -----
  let voiceRec = null, voiceStream = null, voiceStart = 0, voiceChunks = [], voiceTime = 0, voiceWanted = false;
  async function startVoice() {
    if (voiceRec || voiceWanted) return;
    voiceWanted = true;
    pause();
    // Son « studio » : sans le traitement « appel téléphonique » (anti-écho, réduction de bruit, gain auto)
    try { voiceStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1, sampleRate: 48000 } }); }
    catch (e) { voiceWanted = false; return toast("Micro refusé : autorise-le dans les réglages Safari"); }
    if (!voiceWanted) { voiceStream.getTracks().forEach(tr => tr.stop()); return; } // relâché trop vite
    const mime = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find(m => MediaRecorder.isTypeSupported(m)) || "";
    voiceChunks = [];
    voiceRec = new MediaRecorder(voiceStream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 192e3 });
    voiceRec.ondataavailable = e => e.data.size && voiceChunks.push(e.data);
    voiceRec.onstop = async () => {
      voiceStream.getTracks().forEach(tr => tr.stop());
      const type = voiceRec.mimeType || mime || "audio/mp4";
      const recDur = (Date.now() - voiceTime) / 1000;
      voiceRec = null;
      pause(); draw();
      if (recDur < 0.4) return toast("Reste appuyé pour enregistrer");
      const f = new File([new Blob(voiceChunks, { type })], "voix-off." + (type.includes("mp4") ? "m4a" : "webm"), { type });
      await addAudio({ file: f, url: URL.createObjectURL(f), label: "Voix off", dur: recDur }, "voice", voiceStart);
    };
    voiceStart = t;
    voiceRec.start(250);
    voiceTime = Date.now();
    drawTools();
    play();                         // la vidéo défile (son coupé) pendant que tu parles
  }
  function stopVoice() {
    voiceWanted = false;
    if (voiceRec && voiceRec.state !== "inactive") voiceRec.stop();
  }

  // ----- Caméra : appui maintenu = selfie inséré à la barre blanche ; appui simple = caméra complète -----
  let camPress = null, camRec = null, camStream = null, camWanted = false, camChunks = [], camTime = 0;
  // Insère des rushs à la barre blanche (coupe le plan si besoin) et décale ce qui suit
  async function insertRushes(list) {
    if (!list.length) return;
    save();
    const at = Math.min(t, total());
    let idx = clips.length;
    if (clips.length) {
      const { i, off } = locate(at);
      const c = clips[i];
      if (off < 0.05) idx = i;
      else if (off > len(c) - 0.05) idx = i + 1;
      else { const cut = c.in + off * sp(c); clips.splice(i, 1, { ...c, out: cut }, { ...c, in: cut }); idx = i + 1; }
    }
    let added = 0;
    for (const r of list) {
      refs.push(r);
      const d = await mediaDuration(r);
      const start = r.cam && d > 0.6 ? 0.1 : 0;
      clips.splice(idx++, 0, { ref: r, in: start, out: d, speed: 1, vol: 1 });
      added += d - start;
      if (typeof makeThumb === "function") makeThumb(r).then(draw);
    }
    [...audios, ...overlays, ...caps, ...texts].forEach(x => { if (x.start >= at - 0.01) x.start += added; });   // le reste suit
    sel = null; resetPlayers(); draw(); seek(at + added);   // la barre passe après le nouveau rush
    toast("Rush ajouté ");
  }
  function openFullCamera() {
    pause();
    if (typeof openCameraFor === "function") openCameraFor(list => insertRushes(list));
  }
  async function startCam() {
    if (camRec || camWanted) return;
    camWanted = true;
    pause();
    try {
      camStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) { camWanted = false; return toast("Caméra refusée : autorise-la dans les réglages Safari"); }
    if (!camWanted) { camStream.getTracks().forEach(tr => tr.stop()); return; }   // relâché trop vite
    const pip = $("edPip");
    pip.srcObject = camStream; pip.classList.remove("hidden"); pip.play().catch(() => {});
    const mime = ["video/mp4;codecs=avc1", "video/mp4", "video/webm"].find(m => MediaRecorder.isTypeSupported(m)) || "";
    camChunks = [];
    camRec = new MediaRecorder(camStream, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 12e6, audioBitsPerSecond: 192e3 });
    camRec.ondataavailable = e => e.data.size && camChunks.push(e.data);
    camRec.onstop = () => {
      camStream.getTracks().forEach(tr => tr.stop());
      pip.classList.add("hidden"); pip.srcObject = null;
      const type = camRec.mimeType || mime || "video/mp4";
      const dur = (Date.now() - camTime) / 1000;
      camRec = null; drawTools();
      if (dur < 0.5) return toast("Reste appuyé pour filmer");
      const f = new File([new Blob(camChunks, { type })], "selfie." + (type.includes("mp4") ? "mp4" : "webm"), { type });
      insertRushes([{ file: f, url: URL.createObjectURL(f), cam: true }]);
    };
    camRec.start(250);
    camTime = Date.now();
    drawTools();
    if (navigator.vibrate) navigator.vibrate(15);
  }
  function stopCam() {
    camWanted = false;
    if (camRec && camRec.state !== "inactive") camRec.stop();
  }

  // ---------- Feuille (bas d'écran) ----------
  function sheet(html, closable = true) {
    $("edSheetBody").innerHTML = html;
    $("edSheetClose").classList.toggle("hidden", !closable);
    $("edSheet").classList.remove("hidden");
  }
  function closeSheet() { $("edSheet").classList.add("hidden"); }
  $("edSheetClose").onclick = () => { closeSheet(); draw(); };

  // ---------- Assistant IA dans l'éditeur : tu demandes, il modifie le montage ----------
  async function assistSheet(last = "") {
    pause();
    sheet(`<b>Demande à l'IA</b>
      <div class="small" style="color:#999">Ex : « zoom sur moi au début », « coupe la 2e phrase », « légendes karaoké en bas », « ajoute le texte PROMO -50% en haut au début », « accélère le dernier plan ».</div>
      ${last}
      <textarea id="asTxt" placeholder="Ta demande" style="min-height:70px;background:#2a2a2a;color:#fff"></textarea>
      <button class="main" id="asGo">Envoyer</button>`);
    $("asGo").onclick = () => { const q = $("asTxt").value.trim(); if (q) runAssist(q); };
  }
  async function runAssist(q) {
    sheet(`<div style="font-size:15px;color:#ddd"><span class="espin"></span> L'IA modifie ton montage…</div><div class="small" style="color:#999">« ${esc(q)} »</div>`, false);
    // État du montage, avec des repères simples (P = plans, L = légendes, T = textes, S = superpositions, A = sons)
    const ids = new Map(), r2 = x => +x.toFixed(2);
    const said = (a, b) => caps.filter(c => c.start < b && c.start + len(c) > a).map(c => c.text).join(" ");
    const state = {
      duree: r2(total()), barre_blanche: r2(t),
      plans: clips.map((c, i) => { ids.set("P" + (i + 1), c); const s = startOf(i); return { id: "P" + (i + 1), debut: r2(s), fin: r2(s + len(c)), vitesse: sp(c), volume: c.vol, dit: said(s, s + len(c)) }; }),
      legendes: caps.map((c, i) => { ids.set("L" + (i + 1), c); return { id: "L" + (i + 1), debut: r2(c.start), fin: r2(c.start + len(c)), texte: c.text }; }),
      style_legendes: capStyle.style,
      textes: texts.map((x, i) => { ids.set("T" + (i + 1), x); return { id: "T" + (i + 1), debut: r2(x.start), fin: r2(x.start + len(x)), texte: x.text }; }),
      superpositions: overlays.map((o, i) => { ids.set("S" + (i + 1), o); return { id: "S" + (i + 1), debut: r2(o.start), fin: r2(o.start + len(o)) }; }),
      sons: audios.map((a, i) => { ids.set("A" + (i + 1), a); return { id: "A" + (i + 1), type: a.kind, nom: a.ref.label, debut: r2(a.start), fin: r2(a.start + len(a)) }; }),
    };
    const lib = await libList().catch(() => []);
    const sys = `Tu es l'assistant d'un éditeur vidéo façon CapCut. On te donne l'état du montage (temps en secondes) et une demande. Réponds UNIQUEMENT en JSON :
{"actions":[...],"reponse":"1 phrase en français qui dit ce que tu as fait"}
Actions possibles (n'utilise que les id fournis) :
{"do":"supprimer","id":"P2"} (plan, légende, texte, superposition ou son)
{"do":"couper","id":"P1","a":3.2} (coupe un plan en deux au temps a)
{"do":"raccourcir","id":"P1","debut":0.5,"fin":0.3} (secondes retirées au début / à la fin d'un plan)
{"do":"vitesse","id":"P1","valeur":2} (0.5 à 100)
{"do":"volume","id":"P1","valeur":1.2} (0 à 2)
{"do":"deplacer_plan","id":"P3","position":1} (nouvelle place, 1 = premier)
{"do":"zoom","id":"P1","de":1,"a":1.6,"debut":0,"fin":1.5,"cadrage_x":0,"cadrage_y":-0.1} (zoom animé ; cadrage en fraction de l'image, négatif = gauche/haut ; marche aussi sur T et S pour la taille)
{"do":"ajouter_texte","texte":"...","debut":0,"fin":3,"position":"haut|milieu|bas"}
{"do":"modifier_texte","id":"T1","texte":"..."} ou {"do":"modifier_texte","id":"L3","texte":"..."}
{"do":"style_legendes","style":"box|karaoke|pop|classic","position":"haut|milieu|bas","taille":1}
{"do":"bruitage","nom":"nom exact","a":2.5} (bruitages disponibles : ${lib.length ? lib.map(s => s.name).join(", ") : "aucun"})
{"do":"son_des_plans","coupe":true}
Si la demande est impossible, renvoie "actions":[] et explique dans "reponse".`;
    let plan;
    try {
      const ans = await askModel([{ role: "system", content: sys }, { role: "user", content: `État : ${JSON.stringify(state)}\n\nDemande : ${q}` }]);
      plan = JSON.parse(ans.slice(ans.indexOf("{"), ans.lastIndexOf("}") + 1));
    } catch (e) {
      return assistSheet(`<div style="color:#FF5A4E;font-size:13px">L'IA n'a pas pu répondre : ${esc(String(e.message).slice(0, 120))}</div>`);
    }
    save();
    let done = 0;
    const kindOf = id => ({ P: "v", L: "c", T: "t", S: "o", A: "a" }[String(id)[0]]);
    const listOf = k => (k === "v" ? clips : arr(k));
    for (const a of plan.actions || []) {
      try {
        const obj = ids.get(String(a.id || "").trim()), k = kindOf(a.id), list = k && listOf(k), i = obj ? list.indexOf(obj) : -1;
        switch (a.do) {
          case "supprimer": if (i >= 0) { list.splice(i, 1); done++; } break;
          case "couper": if (k === "v" && i >= 0) {
            const s0 = startOf(i), off = +a.a - s0;
            if (off > 0.1 && off < len(obj) - 0.1) { const cut = obj.in + off * sp(obj); clips.splice(i, 1, { ...obj, out: cut, kf: [] }, { ...obj, in: cut, kf: [] }); done++; }
          } break;
          case "raccourcir": if (k === "v" && i >= 0) {
            const d0 = Math.max(0, +a.debut || 0) * sp(obj), d1 = Math.max(0, +a.fin || 0) * sp(obj);
            if (obj.out - obj.in - d0 - d1 > 0.2) { obj.in += d0; obj.out -= d1; done++; }
          } break;
          case "vitesse": if (k === "v" && i >= 0) { obj.speed = Math.min(100, Math.max(0.5, +a.valeur || 1)); done++; } break;
          case "volume": if (obj && "vol" in obj) { obj.vol = Math.min(2, Math.max(0, +a.valeur)); done++; } break;
          case "deplacer_plan": if (k === "v" && i >= 0) { const to = Math.max(0, Math.min(clips.length - 1, (+a.position || 1) - 1)); clips.splice(to, 0, clips.splice(i, 1)[0]); done++; } break;
          case "zoom": if (obj && PROPS[k]) {
            const s0 = k === "v" ? startOf(i) : obj.start, L = len(obj);
            const t0 = Math.max(0, Math.min(L, (+a.debut || s0) - s0)), t1 = Math.max(t0 + 0.1, Math.min(L, (a.fin !== undefined ? +a.fin : s0 + L) - s0));
            const base = valAt(k, obj, t0);
            const from = +a.de || base.scale, to = +a.a || 1.5;
            const ex = a.cadrage_x !== undefined ? +a.cadrage_x : (k === "v" ? 0 : base.x), ey = a.cadrage_y !== undefined ? +a.cadrage_y : (k === "v" ? 0 : base.y);
            // le point visé (cadrage) reste en place pendant le zoom
            obj.kf = (obj.kf || []).filter(x => x.t < t0 - 0.01 || x.t > t1 + 0.01);
            obj.kf.push({ t: +t0.toFixed(3), v: { ...base, scale: from } }, { t: +t1.toFixed(3), v: { ...base, scale: to, ...(k === "v" ? { x: -ex * (to - 1), y: -ey * (to - 1) } : {}) } });
            obj.kf.sort((p, q) => p.t - q.t);
            done++;
          } break;
          case "ajouter_texte": {
            const st = Math.max(0, Math.min(total() - 0.3, +a.debut || 0)), en = Math.min(total(), Math.max(st + 0.3, +a.fin || st + 3));
            texts.push({ text: String(a.texte || "Texte"), start: st, in: 0, out: en - st, x: 0.5, y: /haut/i.test(a.position) ? 0.18 : /bas/i.test(a.position) ? 0.8 : 0.45, scale: 1, rot: 0, op: 1, kf: [] });
            done++;
          } break;
          case "modifier_texte": if (obj && "text" in obj) { obj.text = String(a.texte || obj.text); if (k === "c") obj.words = null; done++; } break;
          case "style_legendes":
            if (CAP_STYLES.some(s => s[0] === a.style)) capStyle.style = a.style;
            if (a.position) capStyle.y = /haut/i.test(a.position) ? 0.2 : /milieu|centre/i.test(a.position) ? 0.5 : 0.75;
            if (+a.taille) capStyle.size = Math.min(1.8, Math.max(0.6, +a.taille));
            done++; break;
          case "bruitage": {
            const s = lib.find(x => x.name.toLowerCase() === String(a.nom || "").toLowerCase()) || lib.find(x => x.name.toLowerCase().includes(String(a.nom || "").toLowerCase()));
            if (!s) break;
            const ref = libRefs.get(s.id) || { lib: s.id, file: new File([s.blob], s.name + ".audio", { type: s.type || s.blob.type }), url: URL.createObjectURL(s.blob), label: s.name };
            libRefs.set(s.id, ref);
            if (!refs.includes(ref)) refs.push(ref);
            const d = await mediaDuration(ref);
            audios.push({ ref, kind: "sfx", start: Math.max(0, +a.a || t), in: 0, out: d, vol: 1 });
            done++;
          } break;
          case "son_des_plans": clipMute = !!a.coupe; done++; break;
        }
      } catch (e) { /* action ignorée */ }
    }
    sel = null; resetPlayers(); draw(); seek(Math.min(t, total()));
    const msg = `<div style="background:#2a2a2a;border-radius:14px;padding:10px 12px;font-size:14px">${esc(plan.reponse || "C'est fait.")}<div class="small" style="color:#999;margin:4px 0 0">${done} modification(s) · ↶ pour annuler</div></div>`;
    assistSheet(msg);
  }

  // ---------- Montage IA : écoute, coupe des blancs, légendes ----------
  const AI_GAP = 0.35, AI_PAD_IN = 0.12, AI_PAD_OUT = 0.18;   // réglages de coupe (secondes)
  function aiSheet(steps, foot = "") {
    const icon = s => s.st === "done" ? `<span style="color:#4ade80">✓</span>` : s.st === "fail" ? `<span style="color:#FF5A4E">✕</span>` : s.st === "doing" ? `<span class="espin"></span>` : `<span style="color:#555">○</span>`;
    sheet(`<div style="font-size:20px;font-weight:700;margin-bottom:4px">Montage IA</div>
      ${steps.map(s => `<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0"><div style="width:18px;text-align:center">${icon(s)}</div>
        <div><div style="color:${s.st === "wait" ? "#777" : "#fff"}">${s.label}</div>${s.info ? `<div style="font-size:12px;color:#999;margin-top:2px">${esc(s.info)}</div>` : ""}</div></div>`).join("")}
      ${foot}`, false);
  }
  async function aiMontage(prompt = "") {
    pause();
    const steps = [
      { label: "Préparation de tes rushs", st: "doing" },
      { label: "Écoute de ce que tu dis", st: "wait" },
      { label: "L'IA décide du montage", st: "wait" },
      { label: "Application du montage et des légendes", st: "wait" },
    ];
    const show = () => aiSheet(steps, prompt ? `<div class="small" style="color:#999">Prompt : « ${esc(prompt.slice(0, 140))} »</div>` : "");
    show();
    const before = total();
    let words;
    try {
      for (const c of clips) { await media(c.ref); await decodeAudio(c.ref); }
      steps[0].st = "done"; steps[0].info = `${clips.length} rush(s), ${before.toFixed(1)} s`;
      steps[1].st = "doing"; show();
      const data = await groqTranscribe(await mixAudio(), true);
      words = (data.words || []).map(w => ({ w: String(w.word).trim(), s: +w.start, e: +w.end })).filter(w => w.w);
      if (!words.length) throw new Error("aucune parole entendue dans tes rushs");
      steps[1].st = "done"; steps[1].info = `${words.length} mots entendus`;
    } catch (e) {
      const i = steps.findIndex(s => s.st === "doing");
      steps[i].st = "fail"; steps[i].info = e.message;
      for (let j = i + 1; j < steps.length; j++) { steps[j].st = "fail"; steps[j].info = "pas possible sans l'étape d'avant"; }
      draw(); seek(0);
      aiSheet(steps, `<div class="small" style="color:#aaa">Tes rushs sont quand même à la suite dans l'éditeur.</div><button class="main" id="aiOk">Voir mes rushs</button>`);
      $("aiOk").onclick = () => { closeSheet(); seek(0); };
      return;
    }

    // 1. Découpe en morceaux : chaque phrase dite, et les plans sans parole
    const segs = [];
    clips.forEach((c, i) => {
      const s0 = startOf(i), s1 = s0 + len(c);
      const inside = words.filter(w => w.s < s1 && w.e > s0);
      if (!inside.length || sp(c) !== 1) { segs.push({ c, in: c.in, out: c.out, words: [], rush: i + 1 }); return; }
      const parts = [];
      inside.forEach(w => {
        const a = Math.max(c.in, c.in + (w.s - s0) - AI_PAD_IN), b = Math.min(c.out, c.in + (w.e - s0) + AI_PAD_OUT);
        const src = { w: w.w, s: c.in + (w.s - s0), e: c.in + (w.e - s0) };   // temps dans le rush
        const last = parts[parts.length - 1];
        if (last && a - last.out <= AI_GAP) { last.out = Math.max(last.out, b); last.words.push(src); }
        else parts.push({ c, in: a, out: b, words: [src], rush: i + 1 });
      });
      segs.push(...parts);
    });
    segs.forEach((s, k) => { s.id = "S" + (k + 1); s.text = s.words.map(w => w.w).join(" "); });

    // 2. L'IA lit le prompt et décide
    steps[2].st = "doing"; show();
    const lib = await libList().catch(() => []);
    let plan = null, note = "";
    try {
      const list = segs.map(s => `${s.id} (rush ${s.rush}, ${(s.out - s.in).toFixed(1)} s) : ${s.text ? "« " + s.text + " »" : "[plan sans parole]"}`).join("\n");
      const sys = `Tu es un monteur vidéo TikTok expert. On te donne les morceaux d'une vidéo (dans l'ordre où ils ont été filmés) et la demande de l'utilisateur.
Décide du montage. Par défaut : garde l'ordre, et si une phrase a été dite plusieurs fois (prises ratées, répétitions), ne garde que la meilleure version (en général la dernière). Garde les plans sans parole utiles. Respecte une durée maximale si elle est demandée.
Réponds UNIQUEMENT avec un objet JSON, sans texte autour :
{"keep":["S1","S3"],"speed":{"S2":2},"volume":{"S1":1.2},"captions":{"on":true,"style":"box|karaoke|pop|classic","position":"haut|milieu|bas","size":1},"sfx":[{"name":"nom exact d'un bruitage","at":"S3","where":"start|end"}],"summary":"1 ou 2 phrases en français qui expliquent ce que tu as fait"}
"speed" et "volume" seulement si demandé. Vitesse entre 0.5 et 100. Bruitages disponibles : ${lib.length ? lib.map(s => s.name).join(", ") : "aucun"} (n'en invente pas).`;
      const answer = await askModel([{ role: "system", content: sys }, { role: "user", content: `Demande : ${prompt || "montage dynamique, coupe les blancs et les répétitions, légendes style Boîte"}\n\nMorceaux :\n${list}` }]);
      plan = JSON.parse(answer.slice(answer.indexOf("{"), answer.lastIndexOf("}") + 1));
      if (!Array.isArray(plan.keep) || !plan.keep.length) throw new Error("plan vide");
      steps[2].st = "done"; steps[2].info = plan.summary || `${plan.keep.length} morceaux gardés sur ${segs.length}`;
    } catch (e) {
      plan = { keep: segs.map(s => s.id), captions: { on: true, style: "box" } };
      steps[2].st = "fail"; steps[2].info = "IA indisponible (" + String(e.message).slice(0, 80) + ") : montage simple, blancs coupés";
    }

    // 3. Application
    steps[3].st = "doing"; show();
    save();
    const byId = Object.fromEntries(segs.map(s => [s.id, s]));
    const kept = plan.keep.map(id => byId[String(id).trim()]).filter(Boolean);
    const newClips = [], mapped = [], startAt = {};
    let at = 0;
    kept.forEach(s => {
      const speed = Math.min(100, Math.max(0.5, +((plan.speed || {})[s.id]) || 1));
      const vol = Math.min(2, Math.max(0, +((plan.volume || {})[s.id] ?? s.c.vol ?? 1)));
      const clip = { ...s.c, in: +s.in.toFixed(3), out: +s.out.toFixed(3), speed, vol };
      startAt[s.id] = at;
      s.words.forEach(w => mapped.push({ word: w.w, start: at + (w.s - s.in) / speed, end: at + (w.e - s.in) / speed }));
      newClips.push(clip);
      at += len(clip);
    });
    if (newClips.length) clips = newClips;
    resetPlayers();
    const cap = plan.captions || { on: true };
    caps = cap.on === false ? [] : chunkWords(mapped.map(m => ({ word: m.word, start: Math.max(0, m.start), end: Math.max(m.start + 0.05, m.end) })));
    if (CAP_STYLES.some(s => s[0] === cap.style)) capStyle.style = cap.style;
    if (cap.position) capStyle.y = /haut/i.test(cap.position) ? 0.2 : /milieu|centre/i.test(cap.position) ? 0.5 : 0.75;
    if (+cap.size) capStyle.size = Math.min(1.8, Math.max(0.6, +cap.size));
    // bruitages demandés
    let sfxDone = 0;
    for (const f of plan.sfx || []) {
      const s = lib.find(x => x.name.toLowerCase() === String(f.name || "").toLowerCase()) || lib.find(x => x.name.toLowerCase().includes(String(f.name || "").toLowerCase()));
      const seg = byId[f.at];
      if (!s || !seg || startAt[f.at] === undefined) continue;
      const ref = libRefs.get(s.id) || { lib: s.id, file: new File([s.blob], s.name + ".audio", { type: s.type || s.blob.type }), url: URL.createObjectURL(s.blob), label: s.name };
      libRefs.set(s.id, ref);
      const segLen = len(newClips[kept.indexOf(seg)]);
      if (!refs.includes(ref)) refs.push(ref);
      const d = await mediaDuration(ref);
      audios.push({ ref, kind: "sfx", start: Math.max(0, startAt[f.at] + (f.where === "end" ? segLen - Math.min(d, segLen) : 0)), in: 0, out: d, vol: 1 });
      sfxDone++;
    }
    const gain = before - total();
    steps[3].st = "done";
    steps[3].info = [`${kept.length} morceaux`, caps.length ? `${caps.length} légendes (${CAP_STYLES.find(s => s[0] === capStyle.style)[1]})` : "sans légendes", sfxDone ? `${sfxDone} bruitage(s)` : ""].filter(Boolean).join(" · ");
    sel = null; draw(); seek(0);
    aiSheet(steps, `<div style="margin-top:6px;font-size:15px">Ton montage est prêt : <b>${total().toFixed(1)} s</b>${gain > 0.05 ? ` (au lieu de ${before.toFixed(1)} s)` : ""}.</div>
      <button class="main" id="aiPlay">Regarder</button>
      <button class="main alt" id="aiExport">Exporter directement</button>
      <div class="small" style="color:#999">Tu peux tout retoucher dans l'éditeur, et annuler avec ↶.</div>`);
    $("aiPlay").onclick = () => { closeSheet(); seek(0); play(); };
    $("aiExport").onclick = () => { closeSheet(); $("edExport").click(); };
  }

  // ---------- Légendes : styles animés (dessinés pareil dans l'aperçu et l'export) ----------
  const CAP_STYLES = [["box", "Boîte"], ["karaoke", "Karaoké"], ["pop", "Pop"], ["classic", "Classique"]];
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const activeCap = time => caps.find(c => time >= c.start && time < c.start + len(c));
  // Mots d'une légende avec leurs temps absolus
  function capWords(c) {
    const o = c.start - c.in;
    let ws = c.words && c.words.length ? c.words : null;
    if (!ws) { // pas de temps par mot : on répartit
      const parts = c.text.split(/\s+/).filter(Boolean), d = (c.out - c.in) / Math.max(1, parts.length);
      ws = parts.map((w, i) => ({ w, s: c.in + i * d, e: c.in + (i + 1) * d }));
    }
    return ws.map(x => ({ w: x.w, s: o + x.s, e: o + x.e })).filter(x => x.e > c.start && x.s < c.start + len(c));
  }
  function withScale(g, cx, cy, s, fn) { g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); fn(); g.restore(); }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function drawCaps(g, W, H, time) {
    const c = activeCap(time);
    if (!c) return;
    const style = capStyle.style || "box";
    const words = capWords(c);
    if (!words.length) return;
    let ai = words.findIndex(w => time >= w.s && time < w.e);
    if (ai < 0) ai = Math.max(0, words.filter(w => w.s <= time).length - 1);
    const base = H * CAP_RATIO * capStyle.size, cx = capStyle.x * W, cy = capStyle.y * H, maxW = W * 0.88;
    const age = time - c.start;
    g.textBaseline = "middle"; g.lineJoin = "round";
    if (style === "classic") { drawCapText(g, W, H, c.text); return; }
    if (style === "pop") {   // un mot à la fois, qui arrive un peu plus gros puis se pose
      const w = words[ai], text = w.w.toUpperCase();
      let size = base * 1.5;
      g.font = `400 ${size}px Anton, Impact, sans-serif`;
      const tw = g.measureText(text).width;
      if (tw > maxW) { size *= maxW / tw; g.font = `400 ${size}px Anton, Impact, sans-serif`; }
      const s = 1 + 0.15 * (1 - ease((time - w.s) / 0.14));
      withScale(g, cx, cy, s, () => {
        g.textAlign = "center";
        g.lineWidth = size * 0.14; g.strokeStyle = "#000"; g.strokeText(text, cx, cy);
        g.fillStyle = "#fff"; g.fillText(text, cx, cy);
      });
      return;
    }
    const box = style === "box";
    let size = box ? base * 0.95 : base * 1.05;
    const font = sz => (box ? `800 ${sz}px "JetBrains Mono", ui-monospace, Menlo, monospace` : `900 ${sz}px Montserrat, system-ui, sans-serif`);
    const texts = words.map(w => w.w.toUpperCase());
    g.font = font(size);
    const gap = () => g.measureText(" ").width + (box ? 0 : size * 0.18);   // karaoké : place pour le mot qui grossit
    let space = gap(), widths = texts.map(x => g.measureText(x).width);
    let tw = widths.reduce((a, b) => a + b, 0) + space * (texts.length - 1);
    if (tw > maxW) { size *= maxW / tw; g.font = font(size); space = gap(); widths = texts.map(x => g.measureText(x).width); tw = widths.reduce((a, b) => a + b, 0) + space * (texts.length - 1); }
    const s = 1 + (box ? 0.06 : 0.12) * (1 - ease(age / 0.16));   // petit zoom d'arrivée
    withScale(g, cx, cy, s, () => {
      if (box) {
        const pad = size * 0.35, h = size * 1.35;
        g.fillStyle = "rgba(15,15,15,0.88)";
        roundRect(g, cx - tw / 2 - pad, cy - h / 2, tw + pad * 2, h, size * 0.28); g.fill();
      }
      let x = cx - tw / 2;
      g.textAlign = "left";
      texts.forEach((txt, i) => {
        const on = i === ai;
        if (box) { g.fillStyle = on ? "#ffffff" : "#8c8c8c"; g.fillText(txt, x, cy); }
        else {
          const k = on ? 1 + 0.12 * ease((time - words[i].s) / 0.12) : 1;   // le mot prononcé grossit un peu
          withScale(g, x + widths[i] / 2, cy, k, () => {
            g.lineWidth = size * 0.16; g.strokeStyle = "#000"; g.strokeText(txt, x, cy);
            g.fillStyle = on ? "#FFE11A" : "#ffffff"; g.fillText(txt, x, cy);
          });
        }
        x += widths[i] + space;
      });
    });
  }
  function styleSheet() {
    sheet(`<b>Style des légendes</b>
      <div class="elib">${CAP_STYLES.map(([id, label]) => `<button class="main ${(capStyle.style || "box") === id ? "" : "alt"}" data-st="${id}" style="width:100%;height:auto">${label}</button>`).join("")}</div>
      <b>Taille</b><input type="range" id="edCapSize2" min="60" max="180" step="5" value="${Math.round(capStyle.size * 100)}">`);
    $("edSheetBody").querySelectorAll("[data-st]").forEach(b => b.onclick = () => { save(); capStyle.style = b.dataset.st; styleSheet(); draw(); seek(t); });
    $("edCapSize2").oninput = () => { capStyle.size = +$("edCapSize2").value / 100; renderStill(t); drawCaption(); };
  }

  // ---------- Export sur le téléphone (Mediabunny), pleine qualité, sans serveur ni logo ----------
  // Texte des légendes dessiné comme dans l'aperçu
  function drawCapText(g, W, H, text) {
    const size = H * CAP_RATIO * capStyle.size, maxW = W * 0.86;
    g.font = `800 ${size}px system-ui, -apple-system, "Helvetica Neue", sans-serif`;
    g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
    const lines = [];
    let line = "";
    text.split(/\s+/).forEach(w => { const test = line ? line + " " + w : w; if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; });
    if (line) lines.push(line);
    const lh = size * 1.1, y0 = capStyle.y * H - (lines.length - 1) * lh / 2;
    lines.forEach((l, i) => {
      g.lineWidth = size * 0.16; g.strokeStyle = "#000"; g.strokeText(l, capStyle.x * W, y0 + i * lh);
      g.fillStyle = "#fff"; g.fillText(l, capStyle.x * W, y0 + i * lh);
    });
  }
  // Mélange final du son (48 kHz stéréo)
  async function renderMix() {
    const SR = 48000, dur = total();
    const ctx = new OfflineAudioContext(2, Math.ceil(dur * SR), SR);
    const add = async (ref, startTl, bufIn, bufOut, rate, vol) => {
      if (!vol) return;
      const buf = await decodeAudio(ref);
      if (!buf) return;
      const s = ctx.createBufferSource(), g = ctx.createGain();
      s.buffer = buf; s.playbackRate.value = rate; g.gain.value = vol;
      s.connect(g).connect(ctx.destination);
      s.start(startTl, bufIn, Math.max(0.01, bufOut - bufIn));
    };
    let at = 0;
    for (const c of clips) { if (!clipMute && sp(c) <= 2) await add(c.ref, at, c.in, c.out, sp(c), c.vol); at += len(c); }
    for (const o of overlays) if (!o.ref.image) await add(o.ref, o.start, o.in, o.out, sp(o), o.vol);
    for (const a of audios) await add(a.ref, a.start, a.in, a.out, 1, a.vol);
    return ctx.startRendering();
  }
  // Images d'un élément en pleine qualité, une par image de la vidéo finale
  function fullFrames(item, n0, n1, startTl) {
    const m = item.ref._m;
    const sink = new MB.CanvasSink(m.v, { width: EW, height: EH, fit: "contain", poolSize: 3 });
    return sink.canvasesAtTimestamps((function* () {
      for (let n = n0; n < n1; n++) yield Math.min(item.out - 0.001, item.in + (n / FPS - startTl) * sp(item));
    })());
  }

  let exporting = false;
  $("edExport").onclick = async () => {
    if (!clips.length || exporting) return;
    pause();
    exporting = true;
    const say = txt => sheet(`<div style="font-size:15px;color:#ddd">⏳ ${txt}</div>`, false);
    try {
      say("Préparation…");
      await loadMB();
      for (const x of [...clips, ...overlays, ...audios]) await media(x.ref);
      if (!(await MB.canEncodeAudio("aac"))) (await import("./vendor/mediabunny-aac-encoder.min.mjs")).registerAacEncoder();
      const out = new MB.Output({ format: new MB.Mp4OutputFormat({ fastStart: "in-memory" }), target: new MB.BufferTarget() });
      const cv = document.createElement("canvas"); cv.width = EW; cv.height = EH;
      const g = cv.getContext("2d");
      await document.fonts.ready;
      const vs = new MB.CanvasSource(cv, { codec: "avc", bitrate: 14e6, keyFrameInterval: 2 });   // ~ qualité appareil photo iPhone
      out.addVideoTrack(vs, { frameRate: FPS });
      say("Mixage du son…");
      const mix = await renderMix();
      const as = new MB.AudioBufferSource({ codec: "aac", bitrate: 192e3 });
      out.addAudioTrack(as);
      await out.start();
      await as.add(mix);
      as.close();

      const N = Math.max(1, Math.round(total() * FPS));
      const clipRange = clips.map((c, i) => { const s0 = startOf(i); return [Math.round(s0 * FPS), Math.round((s0 + len(c)) * FPS), s0]; });
      const ovRange = overlays.map(o => [Math.max(0, Math.round(o.start * FPS)), Math.min(N, Math.round((o.start + len(o)) * FPS))]);
      let ci = -1, it = null, frame = null;
      const ovIt = overlays.map(() => null), ovFrame = overlays.map(() => null);
      for (let n = 0; n < N; n++) {
        const tt = n / FPS;
        // plan principal
        while (ci < clips.length - 1 && n >= clipRange[ci + 1][0]) {
          ci++;
          it = clips[ci].ref._m.v ? fullFrames(clips[ci], clipRange[ci][0], clipRange[ci][1], clipRange[ci][2]) : null;
        }
        if (it) { const r = await it.next(); if (!r.done && r.value) frame = r.value.canvas; }
        g.fillStyle = "#000"; g.fillRect(0, 0, EW, EH);
        if (frame && ci >= 0) drawMain(g, EW, EH, frame, clips[ci], tt - clipRange[ci][2]);
        // superpositions
        for (let j = 0; j < overlays.length; j++) {
          const o = overlays[j], [a, b] = ovRange[j];
          if (n < a || n >= b) continue;
          if (o.ref.image) { drawOverlayImg(g, EW, EH, o.ref._m.image, o, tt - o.start); continue; }
          if (!ovIt[j] && o.ref._m.v) ovIt[j] = fullFrames(o, a, b, o.start);
          if (ovIt[j]) { const r = await ovIt[j].next(); if (!r.done && r.value) ovFrame[j] = r.value.canvas; }
          if (ovFrame[j]) drawOverlayImg(g, EW, EH, ovFrame[j], o, tt - o.start);
        }
        // légendes
        drawTexts(g, EW, EH, tt);
        drawCaps(g, EW, EH, tt);
        await vs.add(tt, 1 / FPS);
        if (n % 10 === 0) say(`Export : ${Math.round(n / N * 100)} %`);
      }
      vs.close();
      say("Finalisation…");
      await out.finalize();
      const file = new File([out.target.buffer], "montage.mp4", { type: "video/mp4" });
      const url = URL.createObjectURL(file);
      sheet(`<div>Vidéo prête ! (${(file.size / 1e6).toFixed(1)} Mo)</div>
        <video src="${url}" controls playsinline style="width:100%;max-height:50vh;border-radius:8px;background:#000"></video>
        <button class="main" id="edSave">Enregistrer dans mes photos</button>
        <a style="display:block;text-align:center;color:#888;font-size:13px" href="${url}" download="montage.mp4">Télécharger le fichier</a>`);
      $("edSave").onclick = async () => {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] });
          else { const a = document.createElement("a"); a.href = url; a.download = "montage.mp4"; a.click(); }
        } catch (e) { /* annulé */ }
      };
    } catch (err) {
      sheet(`<div style="color:#f87171">Export : ${esc(err.message || String(err))}</div>`);
    } finally {
      exporting = false;
    }
  };

  window.addEventListener("resize", () => { if (!$("ed").classList.contains("hidden")) { draw(); seek(t); } });
})();
