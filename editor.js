// ===== TABLE DE MONTAGE (style CapCut, version simple) =====
// Vidéos : glisser pour déplacer (appui long), poignées pour rallonger/raccourcir, diviser, supprimer.
// Sons : effets intégrés, voix off (pas de musique : elle s'ajoute sur TikTok). Sous-titres auto (IA). Export via Shotstack.
(() => {
  const PPS = 60;                 // pixels par seconde
  const VIDEO_Y = 24, VIDEO_H = 60, ROW_H = 30;
  const SITE = "https://uba-babu92.github.io/Viral-search/";
  const SFX = [
    ["whoosh", "💨 Whoosh"], ["pop", "🫧 Pop"], ["ding", "🔔 Ding"],
    ["clic", "🖱 Clic"], ["boom", "💥 Boom"], ["riser", "📈 Montée"],
  ];
  const $ = id => document.getElementById(id);

  // ---------- Style ----------
  document.head.insertAdjacentHTML("beforeend", `<style>
  #ed { position: fixed; inset: 0; background: #0b0b0b; z-index: 70; display: flex; flex-direction: column; color: #eee; -webkit-user-select: none; user-select: none; }
  #ed .etop { display: flex; align-items: center; gap: 10px; padding: max(10px, env(safe-area-inset-top)) 12px 8px; }
  #ed .etop .etitle { flex: 1; text-align: center; font-weight: 600; color: #aaa; }
  #edClose { width: 38px; height: 38px; border: 0; border-radius: 19px; background: #222; color: #fff; font-size: 17px; }
  #edExport { padding: 9px 16px; border: 0; border-radius: 10px; background: #5cc8e0; color: #000; font-weight: 700; font-size: 15px; }
  #ed .eprev { flex: 1; min-height: 0; display: flex; justify-content: center; align-items: center; padding: 4px 0; }
  #edVideo { max-width: 100%; max-height: 100%; aspect-ratio: 9 / 16; background: #000; }
  #ed .ectrl { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 4px 14px; font-size: 13px; color: #aaa; }
  #edPlay { width: 44px; height: 44px; border: 0; background: none; color: #fff; font-size: 22px; }
  #ed .eundo { justify-self: end; }
  #ed .eundo button { border: 0; background: none; color: #ccc; font-size: 22px; padding: 0 6px; }
  #ed .ewrap { position: relative; }
  #edTl { position: relative; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  #edTl::-webkit-scrollbar { display: none; }
  #edInner { position: relative; }
  #edRuler span { position: absolute; top: 3px; font-size: 10px; color: #666; transform: translateX(-50%); }
  .eclip { position: absolute; border-radius: 6px; background: #333 repeat-x left center / auto 100%; box-sizing: border-box; border: 2px solid transparent; transition: left .15s; touch-action: pan-x; }
  .eclip span, .eaud span { position: absolute; left: 6px; bottom: 2px; font-size: 10px; color: #fff; text-shadow: 0 1px 2px #000; white-space: nowrap; overflow: hidden; max-width: calc(100% - 10px); }
  .eclip.sel, .eaud.sel, .ecap.sel { border-color: #fff; }
  .eclip.drag, .eaud.drag { transition: none; z-index: 5; opacity: .85; transform: scale(1.04); box-shadow: 0 6px 18px #000; }
  .ehandle { position: absolute; top: -2px; bottom: -2px; width: 16px; background: #fff; touch-action: none; display: flex; align-items: center; justify-content: center; color: #000; font-size: 11px; font-weight: 700; z-index: 3; }
  .ehandle.l { left: -10px; border-radius: 6px 0 0 6px; }
  .ehandle.r { right: -10px; border-radius: 0 6px 6px 0; }
  .eaud { position: absolute; height: ${ROW_H - 6}px; border-radius: 5px; box-sizing: border-box; border: 2px solid transparent; touch-action: pan-x; }
  .eaud.sfx { background: #7c3aed; } .eaud.voice { background: #059669; } .eaud.music { background: #2563eb; }
  .ecap { position: absolute; height: 18px; border-radius: 4px; background: #b45309; font-size: 10px; line-height: 14px; padding-left: 6px; box-sizing: border-box; border: 2px solid transparent; color: #fff; white-space: nowrap; overflow: hidden; }
  #edAdd { position: absolute; right: 8px; top: ${VIDEO_Y + 8}px; width: 44px; height: 44px; border-radius: 8px; border: 0; background: #fff; color: #000; font-size: 26px; z-index: 4; box-shadow: -8px 0 12px #0b0b0b; }
  #edHead { position: absolute; left: 50%; top: 18px; bottom: 0; width: 2px; margin-left: -1px; background: #fff; border-radius: 1px; pointer-events: none; z-index: 6; }
  #ed .etools { display: flex; overflow-x: auto; gap: 2px; padding: 10px 6px max(12px, env(safe-area-inset-bottom)); border-top: 1px solid #1f1f1f; scrollbar-width: none; }
  #ed .etools button { flex: 1 0 auto; border: 0; background: none; color: #ddd; font-size: 11px; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 58px; }
  #ed .etools button b { font-size: 20px; font-weight: 400; }
  #ed .etools button:disabled { opacity: .3; }
  #ed .etools button.rec b { color: #ef4444; }
  #edSheet { position: absolute; inset: 0; background: #0009; display: flex; align-items: flex-end; z-index: 10; }
  #edSheet .sheet { width: 100%; max-height: 75vh; overflow-y: auto; background: #1c1c1c; border-radius: 16px 16px 0 0; padding: 16px 16px max(16px, env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; }
  .esfx { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .esfx div { display: flex; gap: 4px; }
  .esfx button { flex: 1; padding: 10px 6px; border: 1px solid #333; border-radius: 8px; background: #111; color: #eee; font-size: 13px; }
  .esfx button.add { flex: 0 0 38px; background: #fff; color: #000; font-weight: 700; }
  #edToast { position: absolute; top: 40%; left: 20px; right: 20px; text-align: center; background: #000c; color: #fff; padding: 12px; border-radius: 10px; z-index: 9; pointer-events: none; }
  </style>`);

  // ---------- Interface ----------
  document.body.insertAdjacentHTML("beforeend", `
  <div id="ed" class="hidden">
    <div class="etop"><button id="edClose">✕</button><span class="etitle">Montage</span><button id="edExport">Exporter</button></div>
    <div class="eprev"><video id="edVideo" playsinline></video></div>
    <div class="ectrl"><span id="edTime">00:00 / 00:00</span><button id="edPlay">▶</button>
      <span class="eundo"><button id="edUndo">↶</button><button id="edRedo">↷</button></span></div>
    <div class="ewrap">
      <div id="edTl"><div id="edInner"><div id="edRuler"></div><div id="edItems"></div></div></div>
      <div id="edHead"></div>
      <button id="edAdd">＋</button>
    </div>
    <div class="etools">
      <button data-t="sound"><b>♪</b>Son</button>
      <button data-t="voice" id="edVoiceBtn"><b>🎙</b>Voix off</button>
      <button data-t="captions"><b>Aa</b>Sous-titres</button>
      <button data-t="split"><b>✂︎</b>Diviser</button>
      <button data-t="del"><b>🗑</b>Supprimer</button>
    </div>
    <input id="edFile" type="file" accept="video/*" multiple class="hidden">
    <div id="edToast" class="hidden"></div>
    <div id="edSheet" class="hidden"><div class="sheet"><div id="edSheetBody"></div><button class="main alt" id="edSheetClose">Fermer</button></div></div>
  </div>`);

  const video = $("edVideo"), tl = $("edTl"), inner = $("edInner"), items = $("edItems");

  // ---------- État ----------
  let clips = [];      // vidéos : {ref, in, out}
  let audios = [];     // sons : {ref, kind, start, in, out}
  let captions = false;
  let sel = null;      // {type:"v"|"a"|"c", i}
  let t = 0, playing = false, cur = -1, programmatic = false;
  let refs = [];
  const past = [], future = [];
  const audioEls = new Map();

  const len = c => c.out - c.in;
  const total = () => clips.reduce((s, c) => s + len(c), 0);
  const startOf = i => clips.slice(0, i).reduce((s, c) => s + len(c), 0);
  const half = () => tl.clientWidth / 2;
  const fmt = s => { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
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
      const done = d => { m.onloadedmetadata = m.onerror = null; ok(ref.dur = d); };
      m.onloadedmetadata = () => {
        if (isFinite(m.duration) && m.duration > 0) return done(m.duration);
        // Enregistrements du navigateur : durée inconnue au début, on la force
        m.currentTime = 1e6;
        m.ontimeupdate = () => { m.ontimeupdate = null; done(isFinite(m.duration) ? m.duration : 5); };
      };
      m.onerror = () => done(5);
      m.src = ref.url;
      setTimeout(() => ref.dur || done(5), 8000);
    });
  }

  // ---------- Historique ----------
  const snap = () => JSON.stringify({
    c: clips.map(c => [refs.indexOf(c.ref), c.in, c.out]),
    a: audios.map(a => [refs.indexOf(a.ref), a.kind, a.start, a.in, a.out]),
    cap: captions,
  });
  function save() { past.push(snap()); if (past.length > 60) past.shift(); future.length = 0; }
  function restore(str) {
    const s = JSON.parse(str);
    clips = s.c.map(([r, a, b]) => ({ ref: refs[r], in: a, out: b }));
    audios = s.a.map(([r, k, st, a, b]) => ({ ref: refs[r], kind: k, start: st, in: a, out: b }));
    captions = s.cap;
    sel = null; cur = -1;
    draw(); seek(Math.min(t, total()));
  }
  $("edUndo").onclick = () => { if (past.length) { future.push(snap()); restore(past.pop()); } };
  $("edRedo").onclick = () => { if (future.length) { past.push(snap()); restore(future.pop()); } };

  // ---------- Ouvrir / fermer ----------
  window.openEditor = async (list, opts = {}) => {
    $("ed").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    refs = []; clips = []; audios = []; sel = null; cur = -1;
    captions = !!opts.captions;
    past.length = future.length = 0;
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
    const h = half(), tot = total();
    const lane = lanes();
    const nLanes = Math.max(1, ...lane.map(l => l + 1));
    const capY = VIDEO_Y + VIDEO_H + 6;
    const audY = capY + (captions ? 24 : 0);
    const height = audY + nLanes * ROW_H + 8;
    inner.style.width = (tot * PPS + 2 * h) + "px";   // la ligne s'arrête à la fin du montage
    inner.style.height = tl.style.height = height + "px";

    let ruler = "";
    for (let s = 0; s <= Math.ceil(tot); s += 2) ruler += `<span style="left:${h + s * PPS}px">${fmt(s)}</span>`;
    $("edRuler").innerHTML = ruler;

    let html = "", x = h;
    clips.forEach((c, i) => {
      const w = Math.max(6, len(c) * PPS), on = sel && sel.type === "v" && sel.i === i;
      const bg = c.ref.thumb ? `background-image:url(${c.ref.thumb});` : "";
      html += `<div class="eclip${on ? " sel" : ""}" data-v="${i}" style="left:${x}px;top:${VIDEO_Y}px;width:${w}px;height:${VIDEO_H}px;${bg}"><span>${fmt(len(c))}</span>
        ${on ? `<div class="ehandle l" data-h="l">‹</div><div class="ehandle r" data-h="r">›</div>` : ""}</div>`;
      x += w;
    });
    if (captions) {
      const on = sel && sel.type === "c";
      html += `<div class="ecap${on ? " sel" : ""}" data-c="1" style="left:${h}px;top:${capY}px;width:${Math.max(30, tot * PPS)}px">Aa Sous-titres auto (IA)</div>`;
    }
    audios.forEach((a, i) => {
      const on = sel && sel.type === "a" && sel.i === i;
      const name = a.ref.label || "Son";
      html += `<div class="eaud ${a.kind}${on ? " sel" : ""}" data-a="${i}" style="left:${h + a.start * PPS}px;top:${audY + lane[i] * ROW_H}px;width:${Math.max(10, len(a) * PPS)}px"><span>${name}</span>
        ${on ? `<div class="ehandle l" data-h="l">‹</div><div class="ehandle r" data-h="r">›</div>` : ""}</div>`;
    });
    items.innerHTML = html;

    const need = !!sel;
    document.querySelector('#ed [data-t="del"]').disabled = !need;
    document.querySelector('#ed [data-t="split"]').disabled = !(sel && sel.type === "v");
    $("edTime").textContent = fmt(t) + " / " + fmt(tot);
  }

  // ---------- Lecture ----------
  function show(time, andPlay) {
    const { i, off } = locate(time);
    if (i < 0) { video.removeAttribute("src"); video.dataset.url = ""; return; }
    const c = clips[i];
    if (video.dataset.url !== c.ref.url) { video.dataset.url = c.ref.url; video.src = c.ref.url; }
    cur = i;
    const go = () => { video.currentTime = c.in + off; if (andPlay) video.play().catch(() => {}); };
    if (video.readyState >= 1) go(); else video.onloadedmetadata = () => { video.onloadedmetadata = null; go(); };
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
    $("edTime").textContent = fmt(t) + " / " + fmt(total());
  }
  function play() {
    if (!clips.length) return;
    if (t >= total() - 0.05) t = 0;
    playing = true; $("edPlay").textContent = "❚❚";
    show(t, true);
    requestAnimationFrame(loop);
  }
  function pause() {
    playing = false; $("edPlay").textContent = "▶";
    video.pause(); syncAudio(false);
  }
  $("edPlay").onclick = () => (playing ? pause() : play());
  video.addEventListener("click", () => (playing ? pause() : play()));

  function loop() {
    if (!playing) return;
    const c = clips[cur];
    if (c && !video.seeking) {
      if (video.currentTime >= c.out - 0.04 || video.ended) {
        if (cur >= clips.length - 1) { pause(); seek(total()); return; }
        t = startOf(cur + 1) + 0.001;
        show(t, true);
      } else if (!video.paused) {
        t = startOf(cur) + Math.max(0, video.currentTime - c.in);
      }
      setScroll(t);
      syncAudio(true);
      $("edTime").textContent = fmt(t) + " / " + fmt(total());
    }
    requestAnimationFrame(loop);
  }

  function syncAudio(on) {
    audios.forEach(a => {
      let el = audioEls.get(a.ref);
      const inside = on && t >= a.start && t < a.start + len(a);
      if (!inside) { if (el && !el.paused && !audios.some(b => b !== a && b.ref === a.ref && t >= b.start && t < b.start + len(b))) el.pause(); return; }
      if (!el) { el = new Audio(a.ref.url); el.preload = "auto"; audioEls.set(a.ref, el); }
      const want = a.in + (t - a.start);
      if (el.paused) { el.currentTime = want; el.play().catch(() => {}); }
      else if (Math.abs(el.currentTime - want) > 0.35) el.currentTime = want;
    });
  }

  // Faire défiler = se déplacer (bloqué à la fin du montage)
  let scrollTimer;
  tl.addEventListener("scroll", () => {
    const max = total() * PPS;
    if (tl.scrollLeft > max) { tl.scrollLeft = max; }
    if (programmatic || dragging) return;
    if (playing) pause();
    t = Math.min(tl.scrollLeft / PPS, total());
    $("edTime").textContent = fmt(t) + " / " + fmt(total());
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => show(t, false), 60);
  });

  // ---------- Gestes : toucher, appui long pour déplacer, poignées ----------
  let dragging = null, press = null;
  tl.addEventListener("touchmove", e => { if (dragging) e.preventDefault(); }, { passive: false });

  items.addEventListener("pointerdown", e => {
    const handle = e.target.closest(".ehandle");
    const el = e.target.closest(".eclip, .eaud, .ecap");
    if (!el) return;
    const kind = el.dataset.v !== undefined ? "v" : el.dataset.a !== undefined ? "a" : "c";
    const i = +(el.dataset.v ?? el.dataset.a ?? 0);
    if (handle) { e.preventDefault(); return startTrim(e, kind, i, handle.dataset.h); }
    press = { x: e.clientX, y: e.clientY, kind, i, el, id: e.pointerId, moved: false };
    press.timer = setTimeout(() => { if (press && !press.moved && kind !== "c") startMove(press); }, 380);
  });
  items.addEventListener("pointermove", e => {
    if (press && !dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) { press.moved = true; clearTimeout(press.timer); }
  });
  items.addEventListener("pointerup", () => {
    if (press && !press.moved && !dragging) {
      clearTimeout(press.timer);
      const same = sel && sel.type === press.kind && sel.i === press.i;
      sel = same ? null : { type: press.kind, i: press.i };
      draw();
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
      // vidéos : on calcule la nouvelle place et on décale les autres
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
    const end = e => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (p.kind === "v") {
        const c = clips.splice(p.i, 1)[0];
        clips.splice(target, 0, c);
        sel = { type: "v", i: target };
      } else {
        const a = audios[p.i];
        a.start = Math.max(0, Math.min(total() - 0.1, (parseFloat(el.style.left) - half()) / PPS));
      }
      dragging = null; cur = -1;
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
      } else {
        item.out = Math.max(Math.min(dur, out0 + d), in0 + 0.2);
      }
      draw();
      $("edTime").textContent = "Durée : " + (item.out - item.in).toFixed(1) + " s";
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      dragging = null; cur = -1;
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

  document.querySelectorAll("#ed .etools button").forEach(b => b.onclick = () => tool(b.dataset.t));

  function tool(name) {
    if (name !== "voice") pause();
    if (name === "split" && sel && sel.type === "v") {
      const { i, off } = locate(t);
      const c = clips[i];
      if (off < 0.1 || off > len(c) - 0.1) return toast("Place la barre blanche au milieu d'un plan");
      save();
      clips.splice(i, 1, { ref: c.ref, in: c.in, out: c.in + off }, { ref: c.ref, in: c.in + off, out: c.out });
      sel = { type: "v", i: i + 1 }; cur = -1;
    } else if (name === "del" && sel) {
      save();
      if (sel.type === "v") clips.splice(sel.i, 1);
      if (sel.type === "a") audios.splice(sel.i, 1);
      if (sel.type === "c") captions = false;
      sel = null; cur = -1;
    } else if (name === "captions") {
      save();
      captions = !captions;
      toast(captions ? "Sous-titres auto ajoutés (écrits à l'export)" : "Sous-titres retirés");
    } else if (name === "sound") {
      return soundSheet();
    } else if (name === "voice") {
      return toggleVoice();
    }
    draw(); seek(Math.min(t, total()));
  }

  // ----- Sons -----
  function soundSheet() {
    sheet(`<b>Effets sonores</b>
      <div class="esfx">${SFX.map(([id, label]) => `<div><button data-p="${id}">${label}</button><button class="add" data-s="${id}">＋</button></div>`).join("")}</div>
      <div class="small">Ajouté à l'endroit de la barre blanche.</div>`);
    const preview = new Audio();
    $("edSheetBody").querySelectorAll("[data-p]").forEach(b => b.onclick = () => { preview.src = SITE + "sfx/" + b.dataset.p + ".wav"; preview.play().catch(() => {}); });
    $("edSheetBody").querySelectorAll("[data-s]").forEach(b => b.onclick = () => {
      const id = b.dataset.s, label = SFX.find(s => s[0] === id)[1];
      let ref = refs.find(r => r.sfx === id);
      if (!ref) ref = { sfx: id, url: "sfx/" + id + ".wav", src: SITE + "sfx/" + id + ".wav", label };
      addAudio(ref, "sfx", t);
      closeSheet();
    });
  }

  // ----- Voix off -----
  let voiceRec = null, voiceStream = null, voiceStart = 0, voiceChunks = [], voiceTime = 0;
  async function toggleVoice() {
    const btn = $("edVoiceBtn");
    if (voiceRec) { voiceRec.stop(); return; }
    try {
      voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) { return toast("Micro refusé : autorise-le dans les réglages Safari"); }
    const mime = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find(m => MediaRecorder.isTypeSupported(m)) || "";
    voiceChunks = [];
    voiceRec = new MediaRecorder(voiceStream, mime ? { mimeType: mime } : undefined);
    voiceRec.ondataavailable = e => e.data.size && voiceChunks.push(e.data);
    voiceRec.onstop = async () => {
      voiceStream.getTracks().forEach(tr => tr.stop());
      const type = voiceRec.mimeType || mime || "audio/mp4";
      const blob = new Blob(voiceChunks, { type });
      const recDur = (Date.now() - voiceTime) / 1000;
      voiceRec = null;
      btn.classList.remove("rec"); btn.lastChild.textContent = "Voix off";
      video.muted = false;
      pause();
      if (recDur < 0.4) return;
      const f = new File([blob], "voix-off." + (type.includes("mp4") ? "m4a" : "webm"), { type });
      const ref = { file: f, url: URL.createObjectURL(f), label: "🎙 Voix off", dur: recDur };
      await addAudio(ref, "voice", voiceStart);
    };
    voiceStart = t;
    voiceRec.start(250);
    voiceTime = Date.now();
    btn.classList.add("rec"); btn.lastChild.textContent = "Stop";
    video.muted = true;        // on coupe le son de la vidéo pendant qu'on parle
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
          const l = +len(c).toFixed(3);
          const clip = { asset: { type: "video", src: c.ref.src, trim: +c.in.toFixed(3) }, start: +start.toFixed(3), length: l, alias: `v${i}` };
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
        const nl = Math.max(0, ...lane.map(l => l + 1));
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
        say("Pas de voix trouvée : je refais sans sous-titres…");
        url = await renderTimeline(build(false), say);
        note = " (sans sous-titres : pas de voix détectée)";
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
