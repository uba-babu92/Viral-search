// ===== TABLE DE MONTAGE (organisation façon CapCut, version simple) =====
// Plans : appui long pour déplacer, poignées pour rallonger/raccourcir, diviser, vitesse x0,5 à x100, volume.
// Sons : bibliothèque de bruitages perso (gardée sur le téléphone) + voix off (appui maintenu).
// Légendes façon TikTok (transcription Groq Whisper), superpositions. Lecture sans écran noir ni latence.
(() => {
  const PPS = 60;                                    // pixels par seconde
  const RULER_H = 20, VIDEO_Y = 24, VIDEO_H = 56, ROW_H = 30;
  const SPEEDS = [0.5, 0.75, 1, 1.5, 2, 3, 5, 10, 20, 50, 100];
  const NATIVE_MAX = 4;                              // au-delà : lecture image par image (timelapse)
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
    plus: '<path d="M12 5v14M5 12h14"/>',
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
  #edExport { padding: 8px 16px; border: 0; border-radius: 8px; background: #5cc8e0; color: #000; font-weight: 700; font-size: 15px; }
  #ed .eprev { flex: 1; min-height: 0; position: relative; display: flex; justify-content: center; align-items: center; }
  #ed .stage { position: relative; height: 100%; aspect-ratio: 9 / 16; max-width: 100%; background: #000; overflow: hidden; }
  #ed .stage > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0; }
  #ed .stage > video.front { opacity: 1; }
  .eov { position: absolute; aspect-ratio: 9 / 16; transform: translate(-50%, -50%); touch-action: none; z-index: 2; }
  .eov video { width: 100%; height: 100%; object-fit: contain; display: block; pointer-events: none; }
  .eov.sel { outline: 2px solid #fff; }
  .eov .ox, .eov .orz { display: none; position: absolute; width: 28px; height: 28px; border-radius: 14px; background: #222; color: #fff; align-items: center; justify-content: center; }
  .eov.sel .ox, .eov.sel .orz { display: flex; }
  .eov .ox { top: -14px; left: -14px; } .eov .orz { bottom: -14px; right: -14px; }
  #edCap { position: absolute; transform: translate(-50%, -50%); width: 86%; text-align: center; color: #fff; font-weight: 800; line-height: 1.1; touch-action: none; z-index: 3;
    text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px #000; }
  #edCap.sel { outline: 1px dashed #fffa; }
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
  #ed .etools button.rec { color: #ef4444; }
  #edSheet { position: absolute; inset: 0; background: #0009; display: flex; align-items: flex-end; z-index: 10; }
  #edSheet .sheet { width: 100%; max-height: 75vh; overflow-y: auto; background: #1c1c1c; border-radius: 16px 16px 0 0; padding: 16px 16px max(16px, env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; }
  #edSheet input[type=range] { width: 100%; accent-color: #5cc8e0; }
  #edSheet input[type=text] { margin: 0; }
  .elib { display: flex; flex-direction: column; gap: 6px; }
  .elib div { display: flex; gap: 6px; align-items: center; }
  .elib span { flex: 1; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .elib button { width: 40px; height: 36px; border: 1px solid #333; border-radius: 8px; background: #111; color: #eee; display: flex; align-items: center; justify-content: center; }
  .elib button.add { background: #fff; color: #000; }
  .estops { display: flex; justify-content: space-between; font-size: 11px; color: #888; }
  .ebig { text-align: center; font-size: 28px; font-weight: 700; }
  #edToast { position: absolute; top: 35%; left: 20px; right: 20px; text-align: center; background: #000c; color: #fff; padding: 12px; border-radius: 10px; z-index: 9; pointer-events: none; }
  </style>`);

  // ---------- Interface ----------
  document.body.insertAdjacentHTML("beforeend", `
  <div id="ed" class="hidden">
    <div class="etop"><button id="edClose">${ic("x", 26)}</button><span class="grow"></span><span class="epill">1080p</span><button id="edExport">Exporter</button></div>
    <div class="eprev"><div class="stage" id="edStage">
      <video id="edV0" playsinline preload="auto" class="front"></video><video id="edV1" playsinline preload="auto"></video>
      <div id="edOvs"></div><div id="edCap" class="hidden"></div>
    </div></div>
    <div class="ectrl"><span id="edTime"><b>00:00</b> / 00:00</span><button id="edPlay">${ic("play", 30)}</button>
      <span class="eundo"><button id="edUndo">${ic("undo")}</button><button id="edRedo">${ic("redo")}</button></span></div>
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

  const players = [$("edV0"), $("edV1")];
  const tl = $("edTl"), inner = $("edInner"), items = $("edItems"), stage = $("edStage");

  // ---------- État ----------
  let clips = [];      // plans : {ref, in, out, speed, vol}
  let audios = [];     // sons : {ref, kind:"sfx"|"voice", start, in, out, vol}
  let overlays = [];   // superpositions : {ref, start, in, out, vol, x, y, scale}
  let caps = [];       // légendes : {text, start, in, out}
  let capStyle = { x: 0.5, y: 0.7, size: 1 };
  let clipMute = false;
  let sel = null;      // {type:"v"|"a"|"o"|"c", i}
  let t = 0, playing = false, cur = -1, front = 0, programmatic = false, token = 0;
  let step = null;     // lecture image par image : {t0, clock}
  let waiting = false; // plan suivant en cours de chargement (secours)
  let refs = [];
  const past = [], future = [];
  const audioEls = new Map();

  const sp = x => x.speed || 1;
  const len = x => (x.out - x.in) / sp(x);              // durée sur la ligne du temps
  const total = () => clips.reduce((s, c) => s + len(c), 0);
  const startOf = i => clips.slice(0, i).reduce((s, c) => s + len(c), 0);
  const half = () => tl.clientWidth / 2;
  const arr = k => (k === "a" ? audios : k === "o" ? overlays : caps);
  const fmt = s => { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
  const showTime = () => { $("edTime").innerHTML = `<b>${fmt(t)}</b> / ${fmt(total())}`; };
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

  function mediaDuration(ref, tag = "video") {
    if (ref.dur) return Promise.resolve(ref.dur);
    if (ref.image) return Promise.resolve(ref.dur = 3);
    return new Promise(ok => {
      const m = document.createElement(tag);
      m.preload = "metadata"; m.muted = true; m.playsInline = true;
      let fired = false;
      const done = d => { if (fired) return; fired = true; m.onloadedmetadata = m.onerror = m.ontimeupdate = null; ok(ref.dur = d); };
      m.onloadedmetadata = () => {
        if (isFinite(m.duration) && m.duration > 0) return done(m.duration);
        m.currentTime = 1e6; // enregistrements du navigateur : on force la lecture de la durée
        m.ontimeupdate = () => done(isFinite(m.duration) && m.duration > 0 ? m.duration : 5);
      };
      m.onerror = () => done(5);
      m.src = ref.url;
      setTimeout(() => done(5), 8000);
    });
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
  const snap = () => JSON.stringify({ clips, audios, overlays, caps, capStyle, clipMute }, (k, v) => (k === "ref" ? refs.indexOf(v) : v));
  function save() { past.push(snap()); if (past.length > 60) past.shift(); future.length = 0; updUndo(); }
  function updUndo() { $("edUndo").disabled = !past.length; $("edRedo").disabled = !future.length; }
  function restore(str) {
    const s = JSON.parse(str, (k, v) => (k === "ref" ? refs[v] : v));
    ({ clips, audios, overlays, caps, capStyle, clipMute } = s);
    sel = null; resetPlayers();
    draw(); seek(Math.min(t, total())); updUndo();
  }
  $("edUndo").onclick = () => { if (past.length) { future.push(snap()); restore(past.pop()); } };
  $("edRedo").onclick = () => { if (future.length) { past.push(snap()); restore(future.pop()); } };

  // ---------- Ouvrir / fermer ----------
  window.openEditor = async (list, opts = {}) => {
    $("ed").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    refs = []; clips = []; audios = []; overlays = []; caps = []; sel = null;
    capStyle = { x: 0.5, y: 0.7, size: 1 }; clipMute = false;
    past.length = future.length = 0; updUndo();
    resetPlayers();
    await addVideos(list, false);
    seek(0);
    if (opts.message) toast(opts.message, 4000);
    if (opts.captions) setTimeout(() => captionSheet(true), 600);
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
    const d = await mediaDuration(ref, "audio");
    save();
    audios.push({ ref, kind, start, in: 0, out: d, vol: 1 });
    sel = { type: "a", i: audios.length - 1 };
    draw();
  }

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
    return `<div class="eit ${cls}${on ? " sel" : ""}" data-k="${k}" data-i="${i}" style="left:${h + x.start * PPS}px;top:${top}px;width:${Math.max(10, len(x) * PPS)}px;${bg}"><span>${label}</span>
      ${on ? `<div class="ehandle l" data-h="l">‹</div><div class="ehandle r" data-h="r">›</div>` : ""}</div>`;
  }

  function draw() {
    const h = half(), tot = total(), w = Math.max(tot * PPS, 170);
    const ovL = lanes(overlays), auL = lanes(audios);
    let y = VIDEO_Y + VIDEO_H + 8;
    const ovY = y; y += Math.max(1, nl(ovL)) * ROW_H;
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
      const badge = [sp(c) !== 1 ? "x" + sp(c) : "", c.vol === 0 ? "🔇" : ""].filter(Boolean).join(" ");
      html += `<div class="eclip${on ? " sel" : ""}" data-k="v" data-i="${i}" style="left:${x}px;top:${VIDEO_Y}px;width:${cw}px;height:${VIDEO_H}px;${bg}"><span>${fmt(len(c))}</span>${badge ? `<em>${badge}</em>` : ""}
        ${on ? `<div class="ehandle l" data-h="l">‹</div><div class="ehandle r" data-h="r">›</div>` : ""}</div>`;
      x += cw;
    });
    if (overlays.length) overlays.forEach((o, i) => html += itemHtml("o", o, i, ovY + ovL[i] * ROW_H, "ov", "Superposition", o.ref.thumb ? `background-image:url(${o.ref.thumb});` : ""));
    else html += `<div class="eph" data-ph="ov" style="left:${h}px;top:${ovY}px;width:${w}px">+ Ajouter une superposition</div>`;
    if (caps.length) caps.forEach((c, i) => html += itemHtml("c", c, i, capY, "cap", esc(c.text)));
    else html += `<div class="eph" data-ph="cap" style="left:${h}px;top:${capY}px;width:${w}px">+ Générer des légendes</div>`;
    audios.forEach((a, i) => html += itemHtml("a", a, i, auY + auL[i] * ROW_H, a.kind, esc(a.ref.label || "Son")));
    html += `<div class="eph" data-ph="sound" style="left:${h}px;top:${auY + nl(auL) * ROW_H}px;width:${w}px">+ Ajouter un son</div>`;
    items.innerHTML = html;

    $("edMute").innerHTML = `${ic(clipMute ? "mute" : "vol", 20)}<span>${clipMute ? "Son coupé" : "Son du clip"}</span>`;
    drawOverlays();
    drawCaption();
    drawTools();
    showTime();
  }

  // Barre d'outils du bas : change selon ce qui est sélectionné, défile si trop d'outils
  function drawTools() {
    const b = (t, icon, label, cls = "") => `<button data-t="${t}" class="${cls}">${ic(icon)}<span>${label}</span></button>`;
    const back = `<button data-t="back" class="back">${ic("back")}</button>`;
    let html;
    if (!sel) html = b("edit", "scissors", "Modifier") + b("sound", "note", "Son")
      + b("voice", "mic", voiceRec ? "Parle…" : "Voix off", voiceRec ? "rec" : "") + b("captions", "captions", "Légendes") + b("overlay", "overlay", "Superposition");
    else if (sel.type === "v") html = back + b("split", "split", "Diviser") + b("speed", "speed", "Vitesse") + b("volume", "vol", "Volume") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    else if (sel.type === "a") html = back + b("split", "split", "Diviser") + b("volume", "vol", "Volume") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    else if (sel.type === "o") html = back + b("volume", "vol", "Volume") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    else html = back + b("text", "text", "Modifier le texte") + b("del", "trash", "Supprimer") + b("delcaps", "captions", "Tout supprimer");
    $("edTools").innerHTML = html;
  }

  // ---------- Aperçu : superpositions et légendes ----------
  const ovEls = new Map();   // clé -> {box, media}
  function ovKey(o) { return refs.indexOf(o.ref) + "#" + overlays.filter(p => p.ref === o.ref).indexOf(o); }
  function drawOverlays() {
    const keep = new Set();
    overlays.forEach((o, i) => {
      const key = ovKey(o); keep.add(key);
      let e = ovEls.get(key);
      if (!e) {
        const box = document.createElement("div");
        box.className = "eov";
        const media = document.createElement(o.ref.image ? "img" : "video");
        if (!o.ref.image) { media.playsInline = true; media.preload = "auto"; }
        media.src = o.ref.url;
        box.append(media);
        box.insertAdjacentHTML("beforeend", `<div class="ox">${ic("x", 16)}</div><div class="orz">⤡</div>`);
        $("edOvs").append(box);
        e = { box, media };
        ovEls.set(key, e);
      }
      e.i = i;
      e.box.classList.toggle("sel", !!(sel && sel.type === "o" && sel.i === i));
      e.box.style.left = o.x * 100 + "%";
      e.box.style.top = o.y * 100 + "%";
      e.box.style.width = o.scale * 100 + "%";
      if (e.media.tagName === "VIDEO") e.media.muted = !o.vol;
    });
    ovEls.forEach((e, key) => { if (!keep.has(key)) { e.box.remove(); ovEls.delete(key); } });
    syncOverlays(false);
  }
  function syncOverlays(on) {
    overlays.forEach(o => {
      const e = ovEls.get(ovKey(o));
      if (!e) return;
      const inside = t >= o.start && t < o.start + len(o);
      e.box.style.display = inside ? "" : "none";
      if (e.media.tagName !== "VIDEO") return;
      const want = o.in + (t - o.start);
      if (!inside || !on) { if (!e.media.paused) e.media.pause(); if (inside && Math.abs(e.media.currentTime - want) > 0.05) e.media.currentTime = want; return; }
      if (e.media.paused) { e.media.currentTime = want; e.media.play().catch(() => {}); }
      else if (Math.abs(e.media.currentTime - want) > 0.3) e.media.currentTime = want;
    });
  }
  function drawCaption() {
    const el = $("edCap");
    const c = caps.find(c => t >= c.start && t < c.start + len(c));
    el.classList.toggle("hidden", !c);
    if (!c) return;
    el.textContent = c.text;
    el.style.left = capStyle.x * 100 + "%";
    el.style.top = capStyle.y * 100 + "%";
    el.style.fontSize = stage.clientHeight * CAP_RATIO * capStyle.size + "px";
    el.classList.toggle("sel", !!(sel && sel.type === "c"));
  }

  // Déplacer / agrandir sur l'aperçu (superpositions et légendes)
  stage.addEventListener("pointerdown", e => {
    const capEl = e.target.closest("#edCap"), box = e.target.closest(".eov");
    if (!capEl && !box) return;
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
        drawCaption();
      });
    }
    const entry = [...ovEls.values()].find(v => v.box === box);
    const o = overlays[entry.i];
    if (e.target.closest(".ox")) { save(); overlays.splice(entry.i, 1); sel = null; return draw(); }
    save();
    sel = { type: "o", i: entry.i }; draw();
    const x0 = e.clientX, y0 = e.clientY, ox = o.x, oy = o.y, os = o.scale;
    const resize = !!e.target.closest(".orz");
    dragOn(ev => {
      if (resize) o.scale = Math.min(1.5, Math.max(0.15, os + ((ev.clientX - x0) + (ev.clientY - y0) * 9 / 16) / r.width));
      else { o.x = Math.min(1, Math.max(0, ox + (ev.clientX - x0) / r.width)); o.y = Math.min(1, Math.max(0, oy + (ev.clientY - y0) / r.height)); }
      drawOverlays();
    });
  });
  function dragOn(move) {
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  // ---------- Lecture sans écran noir ni latence (deux lecteurs) ----------
  function resetPlayers() {
    token++; step = null; waiting = false;
    players.forEach(p => { p.pause(); p.removeAttribute("src"); p.dataset.url = ""; p.clip = -1; p.started = false; p.load(); });
    front = 0; cur = -1;
    players[0].classList.add("front"); players[1].classList.remove("front");
  }
  function applyClip(p, c) {   // vitesse et son du plan sur ce lecteur
    const native = sp(c) <= NATIVE_MAX;
    p.defaultPlaybackRate = p.playbackRate = native ? sp(c) : 1;
    p.muted = clipMute || !!voiceRec || !c.vol || sp(c) > 2;
    p.volume = Math.min(1, c.vol);
  }
  // Prépare un lecteur sur un plan, à une position ; résout quand l'image est prête
  function prepare(p, i, off) {
    const c = clips[i];
    p.clip = i; p.started = false;
    applyClip(p, c);
    return new Promise(ok => {
      const at = c.in + off * sp(c);
      const seekNow = () => {
        if (Math.abs(p.currentTime - at) < 0.02 && p.readyState >= 2) return ok();
        p.onseeked = () => { p.onseeked = null; ok(); };
        p.currentTime = at;
      };
      if (p.dataset.url !== c.ref.url) {
        p.dataset.url = c.ref.url;
        p.src = c.ref.url;
        p.onloadeddata = () => { p.onloadeddata = null; seekNow(); };
        p.load();
      } else if (p.readyState >= 1) seekNow();
      else p.onloadeddata = () => { p.onloadeddata = null; seekNow(); };
      setTimeout(ok, 2500);
    });
  }
  function swap() {
    players[front].classList.remove("front");
    players[front].pause();
    front = 1 - front;
    players[front].classList.add("front");
  }
  const continuous = (a, b) => b && b.ref === a.ref && Math.abs(b.in - a.out) < 0.05 && sp(a) === sp(b);
  function preloadNext() {
    const n = cur + 1;
    if (n >= clips.length || continuous(clips[cur], clips[n])) return;
    prepare(players[1 - front], n, 0);
  }
  function enterClip(andPlay) {
    const c = clips[cur], p = players[front];
    applyClip(p, c);
    if (!andPlay) return;
    if (sp(c) > NATIVE_MAX) { p.pause(); step = { t0: t, clock: performance.now() }; }
    else { step = null; p.play().catch(() => {}); }
  }
  async function show(time, andPlay) {
    const { i, off } = locate(time);
    if (i < 0) return;
    const my = ++token;
    const f = players[front];
    if (f.clip === i && f.dataset.url === clips[i].ref.url) await prepare(f, i, off);
    else {
      await prepare(players[1 - front], i, off);
      if (my !== token) return;
      swap();
    }
    if (my !== token) return;
    cur = i;
    t = time;
    enterClip(andPlay);
    preloadNext();
  }
  function setScroll(time) {
    programmatic = true;
    tl.scrollLeft = time * PPS;
    requestAnimationFrame(() => (programmatic = false));
  }
  function refreshAt() { syncAudio(false); syncOverlays(false); drawCaption(); showTime(); }
  function seek(time) {
    t = Math.min(Math.max(0, time), total());
    setScroll(t);
    show(t, false);
    refreshAt();
  }
  let unlocked = false;
  function unlock() { // iPhone : on « débloque » les lecteurs pendant le geste de l'utilisateur
    if (unlocked) return;
    unlocked = true;
    players.forEach(p => { if (p !== players[front] && p.src) p.play().then(() => p.pause()).catch(() => {}); });
  }
  function play() {
    if (!clips.length) return;
    if (t >= total() - 0.05) t = 0;
    playing = true;
    $("edPlay").innerHTML = ic("pause", 30);
    unlock();
    show(t, true).then(() => requestAnimationFrame(loop));
  }
  function pause() {
    playing = false; step = null;
    $("edPlay").innerHTML = ic("play", 30);
    players.forEach(p => p.pause());
    syncAudio(false); syncOverlays(false);
  }
  $("edPlay").onclick = () => (playing ? pause() : play());
  players.forEach(p => p.addEventListener("click", () => (playing ? pause() : play())));

  function loop() {
    if (!playing) return;
    const c = clips[cur], v = players[front];
    if (c && v.clip === cur) {
      const s0 = startOf(cur), end = s0 + len(c);
      // Temps courant
      if (step) {
        t = Math.min(end, step.t0 + (performance.now() - step.clock) / 1000);
        if (!v.seeking) { const want = c.in + (t - s0) * sp(c); if (v.fastSeek) v.fastSeek(want); else v.currentTime = want; }
      } else if (!v.seeking) t = s0 + Math.max(0, v.currentTime - c.in) / sp(c);
      const left = end - t;
      const n = cur + 1, nx = clips[n], back = players[1 - front];
      // Démarre le plan suivant un tout petit peu avant : zéro latence
      if (nx && !step && sp(nx) <= NATIVE_MAX && !continuous(c, nx) && back.clip === n && !back.started && left < 0.08 && back.readyState >= 2) {
        back.started = true; applyClip(back, nx); back.play().catch(() => {});
      }
      if (left <= 0.015 || (!step && v.ended)) {
        if (!nx) { pause(); t = total(); setScroll(t); refreshAt(); return; } // garde la dernière image
        if (continuous(c, nx)) { cur = n; v.clip = n; }
        else if (back.clip === n && back.readyState >= 2) { swap(); cur = n; t = startOf(n); enterClip(true); preloadNext(); }
        else if (!waiting) { waiting = true; v.pause(); step = null; show(startOf(n) + 0.001, true).finally(() => (waiting = false)); }
        if (waiting) { requestAnimationFrame(loop); return; }
      }
      setScroll(t);
      syncAudio(true); syncOverlays(true); drawCaption(); showTime();
    }
    requestAnimationFrame(loop);
  }

  function getAudio(ref) {
    let el = audioEls.get(ref);
    if (!el) { el = new Audio(ref.url); el.preload = "auto"; audioEls.set(ref, el); }
    return el;
  }
  function syncAudio(on) {
    const active = new Set();
    audios.forEach(a => {
      if (!(on && t >= a.start && t < a.start + len(a))) return;
      active.add(a.ref);
      const el = getAudio(a.ref), want = a.in + (t - a.start);
      el.muted = !a.vol;
      el.volume = Math.min(1, a.vol);
      if (el.paused) { el.currentTime = want; el.play().catch(() => {}); }
      else if (Math.abs(el.currentTime - want) > 0.35) el.currentTime = want;
    });
    audioEls.forEach((el, ref) => { if (!active.has(ref) && !el.paused) el.pause(); });
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
    scrollTimer = setTimeout(() => show(t, false), 50);
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
    const handle = e.target.closest(".ehandle");
    if (handle) { e.preventDefault(); return startTrim(e, kind, i, handle.dataset.h); }
    press = { x: e.clientX, y: e.clientY, kind, i, moved: false };
    press.timer = setTimeout(() => { if (press && !press.moved) startMove(press); }, 380);
  });
  items.addEventListener("pointermove", e => {
    if (press && !dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) { press.moved = true; clearTimeout(press.timer); }
  });
  items.addEventListener("pointerup", () => {
    if (press && !press.moved && !dragging) {
      clearTimeout(press.timer);
      if (press.ph === "sound") soundSheet();
      else if (press.ph === "cap") captionSheet();
      else if (press.ph === "ov") $("edOvFile").click();
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

  function startMove(p) {
    if (navigator.vibrate) navigator.vibrate(15);
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
      $("edTime").innerHTML = `<b>${len(item).toFixed(1)} s</b>`;
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
  $("edTools").addEventListener("pointerdown", e => { const b = e.target.closest('[data-t="voice"]'); if (b) { e.preventDefault(); startVoice(); } });
  ["pointerup", "pointercancel"].forEach(ev => window.addEventListener(ev, () => { if (voiceRec) stopVoice(); }));
  $("edTools").addEventListener("contextmenu", e => e.preventDefault());
  $("edTools").addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.t !== "voice") tool(b.dataset.t); });

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
      list.splice(sel.i, 1, { ...a, out: a.in + off }, { ...a, start: t, in: a.in + off });
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
    else if (name === "volume") return volumeSheet();
    else if (name === "text") return textSheet();
    else if (name === "captions") return captionSheet();
    else if (name === "sound") return soundSheet();
    else if (name === "overlay") return $("edOvFile").click();
    if (changed) resetPlayers();
    draw(); seek(Math.min(t, total()));
  }

  // ----- Vitesse (x0,5 à x100) -----
  function speedSheet() {
    const c = clips[sel.i];
    save();
    const idx = Math.max(0, SPEEDS.findIndex(s => s >= sp(c)));
    sheet(`<b>Vitesse</b><div class="ebig" id="edSpVal">x${sp(c)}</div>
      <input type="range" id="edSp" min="0" max="${SPEEDS.length - 1}" step="1" value="${idx}">
      <div class="estops">${SPEEDS.map(s => `<span>${s}</span>`).join("")}</div>
      <div class="small" id="edSpInfo"></div>`);
    const upd = () => {
      c.speed = SPEEDS[+$("edSp").value];
      $("edSpVal").textContent = "x" + c.speed;
      $("edSpInfo").textContent = `Durée du plan : ${len(c).toFixed(1)} s` + (c.speed > 2 ? " · son coupé (accéléré)" : "");
      resetPlayers(); draw(); seek(Math.min(t, total()));
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
    $("edCapSize").oninput = () => { capStyle.size = +$("edCapSize").value / 100; drawCaption(); };
    $("edCapOk").onclick = () => { save(); c.text = $("edCapTxt").value.trim() || c.text; closeSheet(); draw(); };
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
      const fd = new FormData();
      fd.append("file", new File([wav], "son.wav", { type: "audio/wav" }));
      fd.append("model", "whisper-large-v3-turbo");
      fd.append("response_format", "verbose_json");
      fd.append("language", "fr");
      const res = await fetch(RELAY + "/transcribe", { method: "POST", body: fd });
      const txt = await res.text();
      if (!res.ok) { if (typeof checkCredit === "function") checkCredit("IA", res.status, txt); throw new Error(res.status === 401 ? "clé IA (Groq) manquante ou invalide dans Cloudflare" : `transcription : ${res.status} ${txt.slice(0, 120)}`); }
      const data = JSON.parse(txt);
      const segs = data.segments && data.segments.length ? data.segments : [{ text: data.text || "", start: 0, end: total() }];
      save();
      caps = chunk(segs);
      sel = null;
      if (!caps.length) return sheet(`<div>Aucune parole entendue dans la vidéo.</div>`);
      closeSheet(); draw(); seek(t);
      toast("✅ Légendes prêtes : touche-les pour corriger, glisse-les sur l'écran", 3500);
    } catch (err) {
      sheet(`<div style="color:#f87171">❌ ${esc(err.message)}</div>`);
    }
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
  const decoded = new Map();
  async function mixAudio() {
    const SR = 16000, dur = Math.max(0.5, total());
    const ctx = new OfflineAudioContext(1, Math.ceil(dur * SR), SR);
    const decode = async ref => {
      if (!decoded.has(ref)) {
        const buf = await (ref.file ? ref.file.arrayBuffer() : fetch(ref.url).then(r => r.arrayBuffer()));
        decoded.set(ref, await ctx.decodeAudioData(buf).catch(() => null));
      }
      return decoded.get(ref);
    };
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
    const pcm = (await ctx.startRendering()).getChannelData(0);
    const view = new DataView(new ArrayBuffer(44 + pcm.length * 2));
    const w = (o, s) => [...s].forEach((ch, i) => view.setUint8(o + i, ch.charCodeAt(0)));
    w(0, "RIFF"); view.setUint32(4, 36 + pcm.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, SR, true); view.setUint32(28, SR * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    w(36, "data"); view.setUint32(40, pcm.length * 2, true);
    pcm.forEach((v, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 32767, true));
    return new Blob([view], { type: "audio/wav" });
  }

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
    try { voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { voiceWanted = false; return toast("Micro refusé : autorise-le dans les réglages Safari"); }
    if (!voiceWanted) { voiceStream.getTracks().forEach(tr => tr.stop()); return; } // relâché trop vite
    const mime = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find(m => MediaRecorder.isTypeSupported(m)) || "";
    voiceChunks = [];
    voiceRec = new MediaRecorder(voiceStream, mime ? { mimeType: mime } : undefined);
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

  // ---------- Feuille (bas d'écran) ----------
  function sheet(html, closable = true) {
    $("edSheetBody").innerHTML = html;
    $("edSheetClose").classList.toggle("hidden", !closable);
    $("edSheet").classList.remove("hidden");
  }
  function closeSheet() { $("edSheet").classList.add("hidden"); }
  $("edSheetClose").onclick = () => { closeSheet(); draw(); };

  // ---------- Export (Shotstack) ----------
  function videoClips(c, start) {   // un plan -> un ou plusieurs clips Shotstack
    const vol = clipMute || sp(c) > 2 ? 0 : +c.vol.toFixed(2);
    const maxIn = c.ref.dur || c.out;
    if (sp(c) < 10) {
      const l = Math.floor(Math.min(len(c), (maxIn - c.in) / sp(c)) * 1000) / 1000;   // jamais plus long que la vidéo
      const asset = { type: "video", src: c.ref.src, trim: +c.in.toFixed(3), volume: vol };
      if (sp(c) !== 1) asset.speed = sp(c);
      return [{ asset, start: +start.toFixed(3), length: l }];
    }
    // x10 à x100 : timelapse, une image toutes les « vitesse / 15 » secondes
    const out = [], L = 1 / 15, n = Math.max(1, Math.floor(len(c) / L));
    for (let k = 0; k < n; k++) {
      const trim = Math.min(maxIn - 0.05, c.in + k * L * sp(c));
      out.push({ asset: { type: "video", src: c.ref.src, trim: +trim.toFixed(3), volume: 0 }, start: +(start + k * L).toFixed(3), length: +L.toFixed(4) });
    }
    return out;
  }

  $("edExport").onclick = async () => {
    if (!clips.length) return;
    pause();
    const say = txt => sheet(`<div style="font-size:15px;color:#ddd">⏳ ${txt}</div>`, false);
    try {
      const used = [...new Set([...clips, ...audios, ...overlays].map(x => x.ref))];
      for (let n = 0; n < used.length; n++) await uploadRush(used[n], `fichier ${n + 1}/${used.length}`, say);
      const tracks = [];
      if (caps.length) tracks.push({ clips: caps.map(c => ({
        asset: { type: "text", text: c.text, width: 960, height: 400,
          font: { family: "Montserrat ExtraBold", size: Math.round(1920 * CAP_RATIO * capStyle.size), color: "#ffffff", lineHeight: 1.1 },
          stroke: { color: "#000000", width: 4 },
          alignment: { horizontal: "center", vertical: "center" } },
        start: +c.start.toFixed(3), length: +len(c).toFixed(3), position: "center",
        offset: { x: +(capStyle.x - 0.5).toFixed(3), y: +(0.5 - capStyle.y).toFixed(3) } })) });
      const ovL = lanes(overlays);
      for (let l = 0; l < nl(ovL); l++) tracks.push({ clips: overlays.filter((o, i) => ovL[i] === l).map(o => ({
        asset: o.ref.image ? { type: "image", src: o.ref.src } : { type: "video", src: o.ref.src, trim: +o.in.toFixed(3), volume: +o.vol.toFixed(2) },
        start: +o.start.toFixed(3), length: +len(o).toFixed(3), fit: "contain", scale: +o.scale.toFixed(3), position: "center",
        offset: { x: +(o.x - 0.5).toFixed(3), y: +(0.5 - o.y).toFixed(3) } })) });
      const auL = lanes(audios);
      for (let l = 0; l < nl(auL); l++) tracks.push({ clips: audios.filter((a, i) => auL[i] === l).map(a => ({
        asset: { type: "audio", src: a.ref.src, trim: +a.in.toFixed(3), volume: +a.vol.toFixed(2) },
        start: +a.start.toFixed(3), length: +len(a).toFixed(3) })) });
      let start = 0;
      const main = [];
      clips.forEach(c => { main.push(...videoClips(c, start)); start += len(c); });
      tracks.push({ clips: main });
      say("Montage envoyé…");
      const url = await renderTimeline({ background: "#000000", tracks }, say);
      sheet(`<div>✅ Vidéo prête !</div>
        <video src="${url}" controls playsinline style="width:100%;max-height:50vh;border-radius:8px;background:#000"></video>
        <a style="display:block;text-align:center;text-decoration:none;padding:10px;border-radius:8px;background:#3b82f6;color:#fff" href="${url}" target="_blank" rel="noopener">Télécharger</a>`);
    } catch (err) {
      sheet(`<div style="color:#f87171">❌ ${esc(err.message)}</div>`);
    }
  };

  window.addEventListener("resize", () => { if (!$("ed").classList.contains("hidden")) { draw(); seek(t); } });
})();
