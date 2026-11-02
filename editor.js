// ===== TABLE DE MONTAGE (organisation façon CapCut, version simple) =====
// Vidéos : appui long pour déplacer, poignées pour rallonger/raccourcir, diviser, dupliquer, supprimer.
// Sons : effets intégrés + voix off (pas de musique : elle s'ajoute sur TikTok). Légendes auto (IA).
// Lecture sans écran noir : deux lecteurs vidéo qui se passent le relais.
(() => {
  const PPS = 60;                                   // pixels par seconde
  const RULER_H = 20, VIDEO_Y = 24, VIDEO_H = 56, ROW_H = 30;
  const SITE = "https://uba-babu92.github.io/Viral-search/";
  const SFX = [["whoosh", "Whoosh"], ["pop", "Pop"], ["ding", "Ding"], ["clic", "Clic"], ["boom", "Boom"], ["riser", "Montée"]];
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
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/>',
    vol: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    mute: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
  };
  const ic = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;

  // ---------- Style ----------
  document.head.insertAdjacentHTML("beforeend", `<style>
  #ed { position: fixed; inset: 0; background: #0f0f0f; z-index: 70; display: flex; flex-direction: column; color: #eee; -webkit-user-select: none; user-select: none; font-family: system-ui, sans-serif; }
  #ed button { font-family: inherit; }
  #ed .etop { display: flex; align-items: center; gap: 10px; padding: max(10px, env(safe-area-inset-top)) 14px 8px; }
  #ed .etop .grow { flex: 1; }
  #edClose { border: 0; background: none; color: #fff; padding: 4px; display: flex; }
  #ed .epill { padding: 7px 12px; border-radius: 8px; background: #1f1f1f; font-size: 14px; font-weight: 600; }
  #edExport { padding: 8px 16px; border: 0; border-radius: 8px; background: #5cc8e0; color: #000; font-weight: 700; font-size: 15px; }
  #ed .eprev { flex: 1; min-height: 0; position: relative; display: flex; justify-content: center; align-items: center; }
  #ed .eprev .stage { position: relative; height: 100%; aspect-ratio: 9 / 16; max-width: 100%; background: #000; }
  #ed .eprev video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: transparent; opacity: 0; }
  #ed .eprev video.front { opacity: 1; }
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
  .eclip span, .eaud span { position: absolute; left: 5px; bottom: 2px; font-size: 10px; color: #fff; text-shadow: 0 1px 2px #000; white-space: nowrap; overflow: hidden; max-width: calc(100% - 8px); }
  .eclip.sel, .eaud.sel, .ecap.sel { border-color: #fff; }
  .eclip.drag, .eaud.drag { transition: none; z-index: 5; opacity: .85; transform: scale(1.04); box-shadow: 0 6px 18px #000; }
  .ehandle { position: absolute; top: -2px; bottom: -2px; width: 14px; background: #fff; touch-action: none; display: flex; align-items: center; justify-content: center; color: #000; font-size: 12px; font-weight: 700; z-index: 3; }
  .ehandle.l { left: -12px; border-radius: 4px 0 0 4px; } .ehandle.r { right: -12px; border-radius: 0 4px 4px 0; }
  .eaud { position: absolute; height: ${ROW_H - 6}px; border-radius: 4px; box-sizing: border-box; border: 2px solid transparent; touch-action: pan-x pan-y; }
  .eaud.sfx { background: #6d4bd8; } .eaud.voice { background: #12936b; }
  .ecap { position: absolute; height: ${ROW_H - 6}px; line-height: ${ROW_H - 10}px; border-radius: 4px; background: #c2760c; font-size: 11px; padding-left: 6px; box-sizing: border-box; border: 2px solid transparent; color: #fff; white-space: nowrap; overflow: hidden; }
  .eph { position: absolute; height: ${ROW_H - 6}px; line-height: ${ROW_H - 6}px; border-radius: 4px; background: #1c1c1c; color: #bbb; font-size: 13px; padding-left: 10px; box-sizing: border-box; white-space: nowrap; }
  #edLeft { position: absolute; left: 0; top: ${VIDEO_Y}px; width: 58px; height: ${VIDEO_H}px; display: flex; align-items: center; justify-content: center; background: linear-gradient(90deg, #0f0f0f 75%, #0f0f0f00); z-index: 4; }
  #edLeft button { border: 0; background: none; color: #ddd; display: flex; flex-direction: column; align-items: center; font-size: 9px; gap: 2px; }
  #edAdd { position: absolute; right: 10px; top: ${VIDEO_Y + 8}px; width: 40px; height: 40px; border-radius: 6px; border: 0; background: #fff; color: #000; display: flex; align-items: center; justify-content: center; z-index: 4; box-shadow: -10px 0 12px #0f0f0f; }
  #edHead { position: absolute; left: 50%; top: ${RULER_H - 2}px; bottom: 0; width: 2px; margin-left: -1px; background: #fff; border-radius: 1px; pointer-events: none; z-index: 6; }
  #ed .etools { display: flex; align-items: stretch; overflow-x: auto; gap: 4px; padding: 10px 8px max(12px, env(safe-area-inset-bottom)); scrollbar-width: none; }
  #ed .etools::-webkit-scrollbar { display: none; }
  #ed .etools button { flex: 1 0 auto; border: 0; background: none; color: #eee; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 62px; padding: 2px 0; }
  #ed .etools button.back { flex: 0 0 44px; min-width: 44px; justify-content: center; background: #1f1f1f; border-radius: 8px; }
  #ed .etools button.rec { color: #ef4444; }
  #edSheet { position: absolute; inset: 0; background: #0009; display: flex; align-items: flex-end; z-index: 10; }
  #edSheet .sheet { width: 100%; max-height: 75vh; overflow-y: auto; background: #1c1c1c; border-radius: 16px 16px 0 0; padding: 16px 16px max(16px, env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; }
  .esfx { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .esfx div { display: flex; gap: 4px; }
  .esfx button { flex: 1; padding: 10px 6px; border: 1px solid #333; border-radius: 8px; background: #111; color: #eee; font-size: 13px; }
  .esfx button.add { flex: 0 0 40px; background: #fff; color: #000; display: flex; align-items: center; justify-content: center; }
  #edToast { position: absolute; top: 35%; left: 20px; right: 20px; text-align: center; background: #000c; color: #fff; padding: 12px; border-radius: 10px; z-index: 9; pointer-events: none; }
  </style>`);

  // ---------- Interface ----------
  document.body.insertAdjacentHTML("beforeend", `
  <div id="ed" class="hidden">
    <div class="etop"><button id="edClose">${ic("x", 26)}</button><span class="grow"></span><span class="epill">1080p</span><button id="edExport">Exporter</button></div>
    <div class="eprev"><div class="stage"><video id="edV0" playsinline preload="auto" class="front"></video><video id="edV1" playsinline preload="auto"></video></div></div>
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
    <div id="edToast" class="hidden"></div>
    <div id="edSheet" class="hidden"><div class="sheet"><div id="edSheetBody"></div><button class="main alt" id="edSheetClose">Fermer</button></div></div>
  </div>`);

  const players = [$("edV0"), $("edV1")];
  const tl = $("edTl"), inner = $("edInner"), items = $("edItems");

  // ---------- État ----------
  let clips = [];      // vidéos : {ref, in, out}
  let audios = [];     // sons : {ref, kind, start, in, out}
  let captions = false, clipMute = false;
  let sel = null;      // {type:"v"|"a"|"c", i}
  let t = 0, playing = false, cur = -1, front = 0, programmatic = false, token = 0;
  let refs = [];
  const past = [], future = [];
  const audioEls = new Map();

  const len = c => c.out - c.in;
  const total = () => clips.reduce((s, c) => s + len(c), 0);
  const startOf = i => clips.slice(0, i).reduce((s, c) => s + len(c), 0);
  const half = () => tl.clientWidth / 2;
  const fmt = s => { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
  const showTime = () => { $("edTime").innerHTML = `<b>${fmt(t)}</b> / ${fmt(total())}`; };
  const toast = (msg, ms = 2500) => { const e = $("edToast"); e.textContent = msg; e.classList.remove("hidden"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.add("hidden"), ms); };

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

  // ---------- Historique ----------
  const snap = () => JSON.stringify({
    c: clips.map(c => [refs.indexOf(c.ref), c.in, c.out]),
    a: audios.map(a => [refs.indexOf(a.ref), a.kind, a.start, a.in, a.out]),
    cap: captions, mute: clipMute,
  });
  function save() { past.push(snap()); if (past.length > 60) past.shift(); future.length = 0; updUndo(); }
  function updUndo() { $("edUndo").disabled = !past.length; $("edRedo").disabled = !future.length; }
  function restore(str) {
    const s = JSON.parse(str);
    clips = s.c.map(([r, a, b]) => ({ ref: refs[r], in: a, out: b }));
    audios = s.a.map(([r, k, st, a, b]) => ({ ref: refs[r], kind: k, start: st, in: a, out: b }));
    captions = s.cap; clipMute = s.mute;
    sel = null; resetPlayers();
    draw(); seek(Math.min(t, total())); updUndo();
  }
  $("edUndo").onclick = () => { if (past.length) { future.push(snap()); restore(past.pop()); } };
  $("edRedo").onclick = () => { if (future.length) { past.push(snap()); restore(future.pop()); } };

  // ---------- Ouvrir / fermer ----------
  window.openEditor = async (list, opts = {}) => {
    $("ed").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    refs = []; clips = []; audios = []; sel = null;
    captions = !!opts.captions; clipMute = false;
    past.length = future.length = 0; updUndo();
    resetPlayers();
    await addVideos(list, false);
    seek(0);
    if (opts.message) toast(opts.message, 4000);
  };
  $("edClose").onclick = () => { pause(); $("ed").classList.add("hidden"); document.body.style.overflow = ""; };

  async function addVideos(list, record = true) {
    if (record) save();
    for (const r of list) {
      if (!refs.includes(r)) refs.push(r);
      clips.push({ ref: r, in: 0, out: await mediaDuration(r) });
      if (!r.thumb && r.file instanceof File && typeof makeThumb === "function") makeThumb(r).then(draw);
    }
    draw();
  }
  async function addAudio(ref, kind, start) {
    if (!refs.includes(ref)) refs.push(ref);
    const d = await mediaDuration(ref, "audio");
    save();
    audios.push({ ref, kind, start, in: 0, out: d });
    sel = { type: "a", i: audios.length - 1 };
    draw();
  }

  // ---------- Dessin ----------
  function lanes() { // place les sons sur des lignes sans chevauchement
    const ends = [];
    return audios.map(a => {
      let l = ends.findIndex(e => e <= a.start + 0.01);
      if (l < 0) { l = ends.length; ends.push(0); }
      ends[l] = a.start + len(a);
      return l;
    });
  }

  function draw() {
    const h = half(), tot = total(), w = Math.max(tot * PPS, 150);
    const lane = lanes();
    const nLanes = lane.length ? Math.max(...lane) + 1 : 0;
    const capY = VIDEO_Y + VIDEO_H + 8;
    const audY = capY + ROW_H;
    const height = audY + (nLanes + 1) * ROW_H + 6;
    inner.style.width = (tot * PPS + 2 * h) + "px";   // la ligne s'arrête à la fin du montage
    inner.style.height = height + "px";

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
      html += `<div class="eclip${on ? " sel" : ""}" data-v="${i}" style="left:${x}px;top:${VIDEO_Y}px;width:${cw}px;height:${VIDEO_H}px;${bg}"><span>${fmt(len(c))}</span>
        ${on ? `<div class="ehandle l" data-h="l">‹</div><div class="ehandle r" data-h="r">›</div>` : ""}</div>`;
      x += cw;
    });
    if (captions) html += `<div class="ecap${sel && sel.type === "c" ? " sel" : ""}" data-c="1" style="left:${h}px;top:${capY}px;width:${w}px">Aa  Légendes auto (IA)</div>`;
    else html += `<div class="eph" data-ph="cap" style="left:${h}px;top:${capY}px;width:${w}px">+ Ajouter des légendes</div>`;
    audios.forEach((a, i) => {
      const on = sel && sel.type === "a" && sel.i === i;
      html += `<div class="eaud ${a.kind}${on ? " sel" : ""}" data-a="${i}" style="left:${h + a.start * PPS}px;top:${audY + lane[i] * ROW_H}px;width:${Math.max(10, len(a) * PPS)}px"><span>${a.ref.label || "Son"}</span>
        ${on ? `<div class="ehandle l" data-h="l">‹</div><div class="ehandle r" data-h="r">›</div>` : ""}</div>`;
    });
    html += `<div class="eph" data-ph="sound" style="left:${h}px;top:${audY + nLanes * ROW_H}px;width:${w}px">+ Ajouter un son</div>`;
    items.innerHTML = html;

    $("edMute").innerHTML = `${ic(clipMute ? "mute" : "vol", 20)}<span>${clipMute ? "Son coupé" : "Son du clip"}</span>`;
    players.forEach(p => (p.muted = clipMute || !!voiceRec));
    drawTools();
    showTime();
  }

  // Barre d'outils du bas : change selon ce qui est sélectionné (comme CapCut)
  function drawTools() {
    const b = (t, icon, label, cls = "") => `<button data-t="${t}" class="${cls}">${ic(icon)}<span>${label}</span></button>`;
    let html;
    if (!sel) {
      html = b("edit", "scissors", "Modifier") + b("sound", "note", "Son")
        + b("voice", "mic", voiceRec ? "Stop" : "Voix off", voiceRec ? "rec" : "") + b("captions", "captions", "Légendes");
    } else if (sel.type === "c") {
      html = `<button data-t="back" class="back">${ic("back")}</button>` + b("del", "trash", "Supprimer");
    } else {
      html = `<button data-t="back" class="back">${ic("back")}</button>`
        + b("split", "split", "Diviser") + b("dup", "copy", "Dupliquer") + b("del", "trash", "Supprimer");
    }
    $("edTools").innerHTML = html;
  }

  // ---------- Lecture sans écran noir (deux lecteurs) ----------
  function resetPlayers() {
    token++;
    players.forEach(p => { p.pause(); p.removeAttribute("src"); p.dataset.url = ""; p.clip = -1; p.load(); });
    front = 0; cur = -1;
    players[0].classList.add("front"); players[1].classList.remove("front");
  }
  // Prépare un lecteur sur un plan, à une position ; résout quand l'image est prête
  function prepare(p, i, off) {
    const c = clips[i];
    p.clip = i;
    return new Promise(ok => {
      const at = c.in + off;
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
  function preloadNext() {
    const n = cur + 1, back = players[1 - front];
    if (n >= clips.length) return;
    const c = clips[cur], nx = clips[n];
    if (nx.ref === c.ref && Math.abs(nx.in - c.out) < 0.05) return; // suite directe : même lecteur
    prepare(back, n, 0);
  }
  async function show(time, andPlay) {
    const { i, off } = locate(time);
    if (i < 0) return;
    const my = ++token;
    const f = players[front];
    if (f.clip === i && f.dataset.url === clips[i].ref.url) {
      await prepare(f, i, off);
    } else {
      const back = players[1 - front];
      await prepare(back, i, off);
      if (my !== token) return;
      swap();
    }
    if (my !== token) return;
    cur = i;
    if (andPlay) players[front].play().catch(() => {});
    preloadNext();
  }
  function setScroll(time) {
    programmatic = true;
    tl.scrollLeft = time * PPS;
    requestAnimationFrame(() => (programmatic = false));
  }
  function seek(time) {
    t = Math.min(Math.max(0, time), total());
    setScroll(t);
    show(t, false);
    syncAudio(false);
    showTime();
  }
  let unlocked = false;
  function unlock() { // iPhone : on « débloque » les lecteurs pendant le geste de l'utilisateur
    if (unlocked) return;
    unlocked = true;
    players.forEach(p => { if (p !== players[front] && p.src) p.play().then(() => p.pause()).catch(() => {}); });
    audios.forEach(a => getAudio(a.ref).play().then(e => getAudio(a.ref).pause()).catch(() => {}));
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
    playing = false;
    $("edPlay").innerHTML = ic("play", 30);
    players.forEach(p => p.pause());
    syncAudio(false);
  }
  $("edPlay").onclick = () => (playing ? pause() : play());
  players.forEach(p => p.addEventListener("click", () => (playing ? pause() : play())));

  function loop() {
    if (!playing) return;
    const c = clips[cur], v = players[front];
    if (c && v.clip === cur && !v.seeking) {
      if (v.currentTime >= c.out - 0.035 || v.ended) {
        if (cur >= clips.length - 1) { pause(); t = total(); setScroll(t); showTime(); return; } // garde la dernière image
        const n = cur + 1, nx = clips[n], back = players[1 - front];
        if (nx.ref === c.ref && Math.abs(nx.in - c.out) < 0.05) {
          cur = n; v.clip = n;                              // même vidéo : on continue
        } else if (back.clip === n && back.readyState >= 2 && !back.seeking) {
          back.play().catch(() => {}); swap(); cur = n;     // relais instantané
          preloadNext();
        } else {
          v.pause(); show(startOf(n) + 0.001, true);        // secours (l'image reste affichée)
          requestAnimationFrame(loop); return;
        }
      }
      t = startOf(cur) + Math.max(0, players[front].currentTime - clips[cur].in);
      setScroll(t);
      syncAudio(true);
      showTime();
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
    showTime();
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => show(t, false), 50);
  });

  // ---------- Gestes : toucher, appui long pour déplacer, poignées ----------
  let dragging = null, press = null;
  tl.addEventListener("touchmove", e => { if (dragging) e.preventDefault(); }, { passive: false });

  items.addEventListener("pointerdown", e => {
    const ph = e.target.closest(".eph");
    if (ph) { press = { ph: ph.dataset.ph, x: e.clientX, y: e.clientY }; return; }
    const handle = e.target.closest(".ehandle");
    const el = e.target.closest(".eclip, .eaud, .ecap");
    if (!el) return;
    const kind = el.dataset.v !== undefined ? "v" : el.dataset.a !== undefined ? "a" : "c";
    const i = +(el.dataset.v ?? el.dataset.a ?? 0);
    if (handle) { e.preventDefault(); return startTrim(e, kind, i, handle.dataset.h); }
    press = { x: e.clientX, y: e.clientY, kind, i, moved: false };
    press.timer = setTimeout(() => { if (press && !press.moved && kind !== "c") startMove(press); }, 380);
  });
  items.addEventListener("pointermove", e => {
    if (press && !dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) { press.moved = true; clearTimeout(press.timer); }
  });
  items.addEventListener("pointerup", () => {
    if (press && !press.moved && !dragging) {
      clearTimeout(press.timer);
      if (press.ph === "sound") soundSheet();
      else if (press.ph === "cap") tool("captions");
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
    const el = items.querySelector(p.kind === "v" ? `[data-v="${p.i}"]` : `[data-a="${p.i}"]`);
    el.classList.add("drag");
    const startX = p.x, startScroll = tl.scrollLeft, baseLeft = parseFloat(el.style.left);
    let target = p.i;
    const move = e => {
      autoScroll(e.clientX);
      const dx = e.clientX - startX + (tl.scrollLeft - startScroll);
      el.style.left = baseLeft + dx + "px";
      if (p.kind === "a") return;
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
        items.querySelector(`[data-v="${j}"]`).style.left = x + "px";
        x += len(clips[j]) * PPS; k++;
      }
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (p.kind === "v") {
        const c = clips.splice(p.i, 1)[0];
        clips.splice(target, 0, c);
        sel = { type: "v", i: target };
      } else {
        audios[p.i].start = Math.max(0, Math.min(total() - 0.1, (parseFloat(el.style.left) - half()) / PPS));
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
    const item = kind === "v" ? clips[i] : audios[i];
    const dur = item.ref.dur || item.out;
    const x0 = e.clientX, in0 = item.in, out0 = item.out, start0 = item.start;
    const move = ev => {
      const d = (ev.clientX - x0) / PPS;
      if (side === "l") {
        item.in = Math.min(Math.max(0, in0 + d), out0 - 0.2);
        if (kind === "a") item.start = Math.max(0, start0 + (item.in - in0));
      } else item.out = Math.max(Math.min(dur, out0 + d), in0 + 0.2);
      draw();
      $("edTime").innerHTML = `<b>${(item.out - item.in).toFixed(1)} s</b>`;
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
  $("edMute").onclick = () => { save(); clipMute = !clipMute; draw(); toast(clipMute ? "Son des vidéos coupé" : "Son des vidéos activé"); };
  $("edTools").addEventListener("click", e => { const b = e.target.closest("button"); if (b) tool(b.dataset.t); });

  function tool(name) {
    if (name !== "voice") pause();
    let changed = true;
    if (name === "back") { sel = null; changed = false; }
    else if (name === "edit") { if (!clips.length) return; sel = { type: "v", i: locate(t).i }; changed = false; }
    else if (name === "split" && sel && sel.type === "v") {
      const { i, off } = locate(t);
      if (i !== sel.i) return toast("Place la barre blanche sur le plan sélectionné");
      const c = clips[i];
      if (off < 0.1 || off > len(c) - 0.1) return toast("Place la barre blanche au milieu du plan");
      save();
      clips.splice(i, 1, { ref: c.ref, in: c.in, out: c.in + off }, { ref: c.ref, in: c.in + off, out: c.out });
      sel = { type: "v", i: i + 1 };
    } else if (name === "split" && sel && sel.type === "a") {
      const a = audios[sel.i], off = t - a.start;
      if (off < 0.1 || off > len(a) - 0.1) return toast("Place la barre blanche sur le son");
      save();
      audios.splice(sel.i, 1, { ...a, out: a.in + off }, { ...a, start: t, in: a.in + off });
    } else if (name === "dup" && sel) {
      save();
      if (sel.type === "v") { clips.splice(sel.i + 1, 0, { ...clips[sel.i] }); sel = { type: "v", i: sel.i + 1 }; }
      else { const a = audios[sel.i]; audios.push({ ...a, start: a.start + len(a) }); sel = { type: "a", i: audios.length - 1 }; }
    } else if (name === "del" && sel) {
      save();
      if (sel.type === "v") clips.splice(sel.i, 1);
      if (sel.type === "a") audios.splice(sel.i, 1);
      if (sel.type === "c") captions = false;
      sel = null;
    } else if (name === "captions") {
      save();
      captions = !captions;
      toast(captions ? "Légendes auto ajoutées (écrites à l'export)" : "Légendes retirées");
    } else if (name === "sound") return soundSheet();
    else if (name === "voice") return toggleVoice();
    if (changed) resetPlayers();
    draw(); seek(Math.min(t, total()));
  }

  // ----- Sons (effets) -----
  function soundSheet() {
    pause();
    sheet(`<b>Effets sonores</b>
      <div class="esfx">${SFX.map(([id, label]) => `<div><button data-p="${id}">▶ ${label}</button><button class="add" data-s="${id}">${ic("plus", 20)}</button></div>`).join("")}</div>
      <div class="small">Ajouté à l'endroit de la barre blanche.</div>`);
    const preview = new Audio();
    $("edSheetBody").querySelectorAll("[data-p]").forEach(b => b.onclick = () => { preview.src = "sfx/" + b.dataset.p + ".wav"; preview.play().catch(() => {}); });
    $("edSheetBody").querySelectorAll("[data-s]").forEach(b => b.onclick = () => {
      const id = b.dataset.s, label = SFX.find(s => s[0] === id)[1];
      const ref = refs.find(r => r.sfx === id) || { sfx: id, url: "sfx/" + id + ".wav", src: SITE + "sfx/" + id + ".wav", label };
      addAudio(ref, "sfx", t);
      closeSheet();
    });
  }

  // ----- Voix off -----
  let voiceRec = null, voiceStream = null, voiceStart = 0, voiceChunks = [], voiceTime = 0;
  async function toggleVoice() {
    if (voiceRec) { voiceRec.stop(); return; }
    try { voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { return toast("Micro refusé : autorise-le dans les réglages Safari"); }
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
      if (recDur < 0.4) return;
      const f = new File([new Blob(voiceChunks, { type })], "voix-off." + (type.includes("mp4") ? "m4a" : "webm"), { type });
      await addAudio({ file: f, url: URL.createObjectURL(f), label: "Voix off", dur: recDur }, "voice", voiceStart);
    };
    voiceStart = t;
    voiceRec.start(250);
    voiceTime = Date.now();
    draw();                      // le son des vidéos est coupé pendant qu'on parle
    toast("🎙 Parle ! Appuie sur Stop pour finir", 2000);
    play();
  }

  // ---------- Feuille (bas d'écran) ----------
  function sheet(html, closable = true) {
    $("edSheetBody").innerHTML = html;
    $("edSheetClose").classList.toggle("hidden", !closable);
    $("edSheet").classList.remove("hidden");
  }
  function closeSheet() { $("edSheet").classList.add("hidden"); }
  $("edSheetClose").onclick = closeSheet;

  // ---------- Export (Shotstack) ----------
  $("edExport").onclick = async () => {
    if (!clips.length) return;
    pause();
    const say = txt => sheet(`<div style="font-size:15px;color:#ddd">⏳ ${txt}</div>`, false);
    try {
      const used = [...new Set([...clips.map(c => c.ref), ...audios.map(a => a.ref)])];
      for (let n = 0; n < used.length; n++) await uploadRush(used[n], `fichier ${n + 1}/${used.length}`, say);
      const build = withCaps => {
        let start = 0;
        const videoTrack = { clips: clips.map((c, i) => {
          // durée arrondie vers le bas : jamais plus longue que la vidéo (sinon noir)
          const l = Math.floor(Math.min(len(c), (c.ref.dur || c.out) - c.in) * 1000) / 1000;
          const clip = { asset: { type: "video", src: c.ref.src, trim: +c.in.toFixed(3), volume: clipMute ? 0 : 1 }, start: +start.toFixed(3), length: l, alias: `v${i}` };
          start += l;
          return clip;
        }) };
        const tracks = [];
        if (withCaps) tracks.push({ clips: clips.map((_, i) => ({
          asset: { type: "caption", src: `alias://v${i}`,
            font: { family: "Montserrat ExtraBold", size: 64, color: "#ffffff", lineHeight: 0.9 },
            background: { color: "#000000", opacity: 0.6, padding: 20, borderRadius: 16 } },
          start: `alias://v${i}`, length: `alias://v${i}`, position: "center" })) });
        const lane = lanes();
        const nl = lane.length ? Math.max(...lane) + 1 : 0;
        for (let l = 0; l < nl; l++) tracks.push({ clips: audios.filter((a, i) => lane[i] === l).map(a => ({
          asset: { type: "audio", src: a.ref.src, trim: +a.in.toFixed(3), volume: 1 },
          start: +a.start.toFixed(3), length: +len(a).toFixed(3) })) });
        tracks.push(videoTrack);
        return { tracks };
      };
      let url, note = "";
      say("Montage envoyé…");
      try {
        url = await renderTimeline(build(captions), say);
      } catch (err) {
        if (!captions || !/spoken|speech|audio/i.test(err.message)) throw err;
        say("Pas de voix trouvée : je refais sans légendes…");
        url = await renderTimeline(build(false), say);
        note = " (sans légendes : pas de voix détectée)";
      }
      sheet(`<div>✅ Vidéo prête !${note}</div>
        <video src="${url}" controls playsinline style="width:100%;max-height:50vh;border-radius:8px;background:#000"></video>
        <a style="display:block;text-align:center;text-decoration:none;padding:10px;border-radius:8px;background:#3b82f6;color:#fff" href="${url}" target="_blank" rel="noopener">Télécharger</a>`);
    } catch (err) {
      sheet(`<div style="color:#f87171">❌ ${err.message}</div>`);
    }
  };

  window.addEventListener("resize", () => { if (!$("ed").classList.contains("hidden")) { draw(); seek(t); } });
})();
