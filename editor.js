// ===== TABLE DE MONTAGE (organisation façon CapCut, version simple) =====
// Moteur : Mediabunny (vendor/, licence MPL-2.0) pour décoder et exporter en MP4 sur le téléphone.
// Plans : appui long pour déplacer, poignées pour rallonger/raccourcir, diviser, vitesse x0,5 à x100, volume.
// Sons : bibliothèque de bruitages perso (gardée sur le téléphone) + voix off (appui maintenu).
// Légendes façon TikTok (transcription Groq Whisper), superpositions. Lecture sans écran noir ni latence.
(() => {
  const PPS = 60;                                    // pixels par seconde
  const RULER_H = 20, VIDEO_Y = 24, VIDEO_H = 56, ROW_H = 30;
  const SPEEDS = [0.5, 0.75, 1, 1.5, 2, 3, 5, 10, 20, 50, 100];
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
  #edCanvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .eov { position: absolute; aspect-ratio: 9 / 16; box-sizing: border-box; transform: translate(-50%, -50%); touch-action: none; z-index: 2; }
    .eov.sel { outline: 2px solid #fff; }
  .eov .ox, .eov .orz { display: none; position: absolute; width: 28px; height: 28px; border-radius: 14px; background: #222; color: #fff; align-items: center; justify-content: center; }
  .eov.sel .ox, .eov.sel .orz { display: flex; }
  .eov .ox { top: -14px; left: -14px; } .eov .orz { bottom: -14px; right: -14px; }
  #edCap { position: absolute; transform: translate(-50%, -50%); width: 86%; text-align: center; color: transparent; font-weight: 800; line-height: 1.3; touch-action: none; z-index: 3; border-radius: 6px; }
  #edCap.sel { outline: 1px dashed #fffa; }
  #edPip { position: absolute; top: 10px; right: 10px; width: 34%; aspect-ratio: 9 / 16; object-fit: cover; border-radius: 10px; border: 2px solid #ef4444; transform: scaleX(-1); z-index: 5; background: #000; }
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
    <div class="etop"><button id="edClose">${ic("x", 26)}</button><span class="grow" id="edProxy" style="font-size:12px;color:#888"></span><span class="epill">1080p</span><button id="edExport">Exporter</button></div>
    <div class="eprev"><div class="stage" id="edStage">
      <canvas id="edCanvas"></canvas>
      <div id="edOvs"></div><div id="edCap" class="hidden"></div>
      <video id="edPip" class="hidden" playsinline muted autoplay></video>
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

  const tl = $("edTl"), inner = $("edInner"), items = $("edItems"), stage = $("edStage");

  // ---------- État ----------
  let clips = [];      // plans : {ref, in, out, speed, vol}
  let audios = [];     // sons : {ref, kind:"sfx"|"voice", start, in, out, vol}
  let overlays = [];   // superpositions : {ref, start, in, out, vol, x, y, scale}
  let caps = [];       // légendes : {text, start, in, out}
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
  const arr = k => (k === "a" ? audios : k === "o" ? overlays : caps);
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
      refs = []; clips = []; audios = []; overlays = []; caps = []; sel = null;
      capStyle = { x: 0.5, y: 0.7, size: 1, style: "box" }; clipMute = false;
      past.length = future.length = 0; updUndo();
      resetPlayers();
      await addVideos(list, false);
      seek(0);
    }
    if (opts.message) toast(opts.message, 4000);
    if (opts.captions && !caps.length) setTimeout(() => captionSheet(true), 600);   // légendes déjà faites : on ne redemande pas
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
      + b("voice", "mic", voiceRec ? "Parle…" : "Voix off", voiceRec ? "rec" : "") + b("captions", "captions", "Légendes") + b("overlay", "overlay", "Superposition")
      + b("camera", "cam", camRec ? "Filme…" : "Caméra", camRec ? "rec" : "");
    else if (sel.type === "v") html = back + b("split", "split", "Diviser") + b("speed", "speed", "Vitesse") + b("volume", "vol", "Volume") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    else if (sel.type === "a") html = back + b("split", "split", "Diviser") + b("volume", "vol", "Volume") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    else if (sel.type === "o") html = back + b("volume", "vol", "Volume") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
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
      e.box.style.left = o.x * 100 + "%";
      e.box.style.top = o.y * 100 + "%";
      e.box.style.width = o.scale * 100 + "%";
      e.box.style.display = t >= o.start && t < o.start + len(o) ? "" : "none";
    });
    ovEls.forEach((e, o) => { if (!overlays.includes(o)) { e.box.remove(); ovEls.delete(o); } });
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
        drawCaption(); if (!playing) renderStill(t);
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
      if (m.v) { m.prev = new MB.CanvasSink(m.v, { width: PW, height: PH, fit: "contain", poolSize: 16 }); m.off = 0; }
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
        m.prev = new MB.CanvasSink(pv, { width: PW, height: PH, fit: "contain", poolSize: 16 });
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
    constructor(sink, item, k0, off = 0) {
      this.sink = sink; this.k0 = k0; this.k = -1; this.q = []; this.cur = null; this.done = false; this.busy = false;
      const self = this;
      this.it = sink.canvasesAtTimestamps((function* () {
        for (let k = k0; ; k++) { const ts = item.in + (k / FPS) * sp(item); if (ts >= item.out || self.done) return; yield ts + off; }
      })());
      this.pump();
    }
    async pump() {
      if (this.busy) return;
      this.busy = true;
      try { while (!this.done && this.q.length < 8) { const r = await this.it.next(); if (r.done) this.done = true; else this.q.push(r.value); } }
      catch (e) { this.done = true; }
      this.busy = false;
    }
    frame(kAbs) {   // image pour le numéro d'image demandé (garde la dernière si le décodage a du retard)
      const want = kAbs - this.k0;
      while (this.k < want && this.q.length) { const f = this.q.shift(); this.k++; if (f) this.cur = f.canvas; }
      this.pump();
      return this.cur;
    }
    close() { this.done = true; this.q = []; }
  }
  const feeds = new Map();   // élément -> Feed
  function feedFor(item, kAbs) {
    const m = item.ref && item.ref._m;
    if (!m || !m.prev) return null;
    let f = feeds.get(item);
    if (!f || f.sink !== m.prev || kAbs < f.k0 + f.k || kAbs - (f.k0 + Math.max(0, f.k)) > 20) {   // trop loin : on recommence ici
      if (f) f.close();
      f = new Feed(m.prev, item, Math.max(0, kAbs), m.off || 0);
      feeds.set(item, f);
    }
    return f;
  }
  function closeFeeds() { feeds.forEach(f => f.close()); feeds.clear(); }

  // Dessin d'une image complète (plan + superpositions) sur un canvas
  function drawOverlayImg(g, W, H, src, o) {
    const bw = o.scale * W, bh = bw * 16 / 9, x = o.x * W - bw / 2, y = o.y * H - bh / 2;
    if (src instanceof HTMLImageElement) {
      const r = Math.min(bw / src.naturalWidth, bh / src.naturalHeight), w = src.naturalWidth * r, h = src.naturalHeight * r;
      g.drawImage(src, x + (bw - w) / 2, y + (bh - h) / 2, w, h);
    } else g.drawImage(src, x, y, bw, bh);
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
    vg.drawImage(lastMain, 0, 0, PW, PH);
    // prépare le plan suivant à l'avance : zéro latence au passage
    if (clips[i + 1] && len(c) - off < 1.5) feedFor(clips[i + 1], 0);
    overlays.forEach(o => {
      if (time < o.start || time >= o.start + len(o)) return;
      if (o.ref.image) { if (o.ref._m) drawOverlayImg(vg, PW, PH, o.ref._m.image, o); return; }
      const ko = Math.floor((time - o.start) * FPS + 1e-6), fo = feedFor(o, ko), im = fo && fo.frame(ko);
      if (im) drawOverlayImg(vg, PW, PH, im, o);
    });
    drawCaps(vg, PW, PH, time);
    // libère les flux qui ne servent plus
    feeds.forEach((f, item) => {
      const keep = item === c || item === clips[i + 1] || (overlays.includes(item) && time >= item.start - 1.5 && time < item.start + len(item));
      if (!keep) { f.close(); feeds.delete(item); }
    });
  }
  let stillToken = 0;
  async function renderStill(time) {   // image fixe (pause, défilement)
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
      else if (mo.prev) { const wo = await mo.prev.getCanvas(o.in + (time - o.start) * sp(o) + (mo.off || 0)).catch(() => null); if (wo) ovs.push([wo.canvas, o]); }
    }
    if (my !== stillToken) return;
    vg.fillStyle = "#000"; vg.fillRect(0, 0, PW, PH);
    if (w) { vg.drawImage(w.canvas, 0, 0, PW, PH); lastMain = null; }
    ovs.forEach(([src, o]) => drawOverlayImg(vg, PW, PH, src, o));
    drawCaps(vg, PW, PH, time);
  }

  // ---------- Lecture : horloge du son = image et son parfaitement calés ----------
  let nodes = [], playT0 = 0, ac0 = 0;
  function resetPlayers() { closeFeeds(); lastMain = null; }
  function scheduleAudio(from, when) {
    const ac = audioCtx();
    const add = (buf, startTl, bufIn, bufOut, rate, vol) => {
      if (!buf || !vol) return;
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
      if (!clipMute && !voiceRec && sp(c) <= 2) add(c.ref._abReady, at, c.in, c.out, sp(c), c.vol);
      at += len(c);
    });
    overlays.forEach(o => { if (!o.ref.image && !voiceRec) add(o.ref._abReady, o.start, o.in, o.out, sp(o), o.vol); });
    audios.forEach(a => add(a.ref._abReady, a.start, a.in, a.out, 1, a.vol));
  }
  function stopAudio() { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); nodes = []; }
  function setScroll(time) {
    programmatic = true;
    tl.scrollLeft = time * PPS;
    requestAnimationFrame(() => (programmatic = false));
  }
  function refreshAt() { drawOverlays(); drawCaption(); showTime(); }
  function seek(time) {
    t = Math.min(Math.max(0, time), total());
    setScroll(t);
    renderStill(t);
    refreshAt();
  }
  async function play() {
    if (!clips.length || playing) return;
    const need = [...clips, ...overlays, ...audios].filter(x => x.ref && !x.ref.image && x.ref._abReady === undefined);
    if (need.length) {
      audioCtx().resume();
      toast("Préparation du son…", 1500);
      await Promise.all(need.map(x => decodeAudio(x.ref)));
      need.forEach(x => { if (x.ref._abReady === undefined) x.ref._abReady = null; });
    }
    if (t >= total() - 0.05) t = 0;
    const ac = audioCtx();
    ac.resume();
    playing = true;
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
    $("edPlay").innerHTML = ic("play", 30);
    stopAudio();
    closeFeeds();
    renderStill(t);
  }
  $("edPlay").onclick = () => (playing ? pause() : play());
  view.addEventListener("click", () => (playing ? pause() : play()));

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
    else if (name === "style") return styleSheet();
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
      toast("✅ Légendes prêtes : touche-les pour corriger, glisse-les sur l'écran", 3500);
    } catch (err) {
      sheet(`<div style="color:#f87171">❌ ${esc(err.message)}</div>`);
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
    [...audios, ...overlays, ...caps].forEach(x => { if (x.start >= at - 0.01) x.start += added; });   // le reste suit
    sel = null; resetPlayers(); draw(); seek(at + added);   // la barre passe après le nouveau rush
    toast("Rush ajouté ✅");
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
        if (frame) g.drawImage(frame, 0, 0, EW, EH);
        // superpositions
        for (let j = 0; j < overlays.length; j++) {
          const o = overlays[j], [a, b] = ovRange[j];
          if (n < a || n >= b) continue;
          if (o.ref.image) { drawOverlayImg(g, EW, EH, o.ref._m.image, o); continue; }
          if (!ovIt[j] && o.ref._m.v) ovIt[j] = fullFrames(o, a, b, o.start);
          if (ovIt[j]) { const r = await ovIt[j].next(); if (!r.done && r.value) ovFrame[j] = r.value.canvas; }
          if (ovFrame[j]) drawOverlayImg(g, EW, EH, ovFrame[j], o);
        }
        // légendes
        drawCaps(g, EW, EH, tt);
        await vs.add(tt, 1 / FPS);
        if (n % 10 === 0) say(`Export : ${Math.round(n / N * 100)} %`);
      }
      vs.close();
      say("Finalisation…");
      await out.finalize();
      const file = new File([out.target.buffer], "montage.mp4", { type: "video/mp4" });
      const url = URL.createObjectURL(file);
      sheet(`<div>✅ Vidéo prête ! (${(file.size / 1e6).toFixed(1)} Mo)</div>
        <video src="${url}" controls playsinline style="width:100%;max-height:50vh;border-radius:8px;background:#000"></video>
        <button class="main" id="edSave">💾 Enregistrer dans mes photos</button>
        <a style="display:block;text-align:center;color:#888;font-size:13px" href="${url}" download="montage.mp4">Télécharger le fichier</a>`);
      $("edSave").onclick = async () => {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] });
          else { const a = document.createElement("a"); a.href = url; a.download = "montage.mp4"; a.click(); }
        } catch (e) { /* annulé */ }
      };
    } catch (err) {
      sheet(`<div style="color:#f87171">❌ Export : ${esc(err.message || String(err))}</div>`);
    } finally {
      exporting = false;
    }
  };

  window.addEventListener("resize", () => { if (!$("ed").classList.contains("hidden")) { draw(); seek(t); } });
})();
