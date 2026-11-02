// ===== TABLE DE MONTAGE (style CapCut, version simple) =====
// Partie 1 : vidéos (couper, supprimer, déplacer, ajouter) + export.
(() => {
  const PPS = 60; // pixels par seconde sur la ligne du temps
  const $ = id => document.getElementById(id);

  // Style
  document.head.insertAdjacentHTML("beforeend", `<style>
  #ed { position: fixed; inset: 0; background: #0b0b0b; z-index: 70; display: flex; flex-direction: column; color: #eee; }
  #ed .etop { display: flex; align-items: center; gap: 10px; padding: max(10px, env(safe-area-inset-top)) 12px 8px; }
  #ed .etop .etitle { flex: 1; text-align: center; font-weight: 600; color: #aaa; }
  #edClose { width: 38px; height: 38px; border: 0; border-radius: 19px; background: #222; color: #fff; font-size: 17px; }
  #edExport { padding: 9px 16px; border: 0; border-radius: 10px; background: #5cc8e0; color: #000; font-weight: 700; font-size: 15px; }
  #ed .eprev { flex: 1; min-height: 0; display: flex; justify-content: center; align-items: center; padding: 4px 0; }
  #edVideo { max-width: 100%; max-height: 100%; aspect-ratio: 9 / 16; background: #000; }
  #ed .ectrl { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 6px 14px; font-size: 13px; color: #aaa; }
  #edPlay { width: 44px; height: 44px; border: 0; background: none; color: #fff; font-size: 22px; }
  #ed .eundo { justify-self: end; }
  #ed .eundo button { border: 0; background: none; color: #ccc; font-size: 22px; padding: 0 6px; }
  #edTl { position: relative; overflow-x: auto; overflow-y: hidden; height: 112px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  #edTl::-webkit-scrollbar { display: none; }
  #edRuler { position: absolute; top: 0; left: 0; height: 18px; }
  #edRuler span { position: absolute; top: 2px; font-size: 10px; color: #666; transform: translateX(-50%); }
  #edTrack { position: absolute; top: 26px; left: 0; display: flex; align-items: center; gap: 2px; height: 70px; white-space: nowrap; }
  .eclip { flex-shrink: 0; height: 64px; border-radius: 6px; background: #333 repeat-x left center / auto 100%; position: relative; box-sizing: border-box; border: 2px solid transparent; }
  .eclip span { position: absolute; left: 4px; bottom: 2px; font-size: 10px; color: #fff; text-shadow: 0 1px 2px #000; }
  .eclip.sel { border-color: #fff; }
  .eadd { flex-shrink: 0; width: 44px; height: 44px; margin-left: 8px; border-radius: 8px; background: #fff; color: #000; font-size: 26px; display: flex; align-items: center; justify-content: center; }
  #edHead { position: relative; height: 0; }
  #edHead::before { content: ""; position: absolute; left: 50%; bottom: 4px; width: 2px; height: 92px; margin-left: -1px; background: #fff; border-radius: 1px; pointer-events: none; }
  #ed .etools { display: flex; justify-content: space-around; padding: 10px 6px max(12px, env(safe-area-inset-bottom)); border-top: 1px solid #1f1f1f; }
  #ed .etools button { border: 0; background: none; color: #ddd; font-size: 11px; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 56px; }
  #ed .etools button b { font-size: 20px; font-weight: 400; }
  #ed .etools button:disabled { opacity: .3; }
  #edSheet { position: absolute; inset: 0; background: #0009; display: flex; align-items: flex-end; z-index: 2; }
  #edSheet .sheet { width: 100%; background: #1c1c1c; border-radius: 16px 16px 0 0; padding: 16px 16px max(16px, env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 10px; }
  </style>`);

  // Interface
  document.body.insertAdjacentHTML("beforeend", `
  <div id="ed" class="hidden">
    <div class="etop">
      <button id="edClose">✕</button>
      <span class="etitle">Montage</span>
      <button id="edExport">Exporter</button>
    </div>
    <div class="eprev"><video id="edVideo" playsinline></video></div>
    <div class="ectrl">
      <span id="edTime">00:00 / 00:00</span>
      <button id="edPlay">▶</button>
      <span class="eundo"><button id="edUndo">↶</button><button id="edRedo">↷</button></span>
    </div>
    <div id="edTl">
      <div id="edTrack"></div>
      <div id="edRuler"></div>
    </div>
    <div id="edHead"></div>
    <div class="etools">
      <button data-t="add"><b>＋</b>Ajouter</button>
      <button data-t="split"><b>✂︎</b>Diviser</button>
      <button data-t="left"><b>◀</b>Avant</button>
      <button data-t="right"><b>▶</b>Après</button>
      <button data-t="del"><b>🗑</b>Supprimer</button>
    </div>
    <input id="edFile" type="file" accept="video/*" multiple class="hidden">
    <div id="edSheet" class="hidden"><div class="sheet"><div id="edSheetBody"></div><button class="main alt" id="edSheetClose">Fermer</button></div></div>
  </div>`);

  const video = $("edVideo"), tl = $("edTl"), track = $("edTrack");
  let clips = [];      // [{ref, in, out}] ; ref = rush {file,url,src?,thumb?,dur?}
  let sel = -1;        // plan sélectionné
  let t = 0;           // temps courant (s)
  let playing = false, cur = -1, userScroll = true;
  const past = [], future = [];

  const total = () => clips.reduce((s, c) => s + (c.out - c.in), 0);
  const fmt = s => { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };

  // Trouve le plan et la position dans ce plan pour un temps global
  function locate(time) {
    let acc = 0;
    for (let i = 0; i < clips.length; i++) {
      const len = clips[i].out - clips[i].in;
      if (time < acc + len || i === clips.length - 1) return { i, off: Math.min(Math.max(0, time - acc), len), start: acc };
      acc += len;
    }
    return { i: -1, off: 0, start: 0 };
  }

  function duration(ref) {
    if (ref.dur) return Promise.resolve(ref.dur);
    return new Promise(ok => {
      const v = document.createElement("video");
      v.preload = "metadata"; v.muted = true; v.playsInline = true; v.src = ref.url;
      v.onloadedmetadata = () => ok(ref.dur = isFinite(v.duration) ? v.duration : 5);
      v.onerror = () => ok(ref.dur = 5);
      setTimeout(() => ok(ref.dur || (ref.dur = 5)), 8000);
    });
  }

  // ----- Historique (annuler / rétablir) -----
  const snap = () => JSON.stringify(clips.map(c => [refs.indexOf(c.ref), c.in, c.out]));
  let refs = [];
  function save() { past.push(snap()); if (past.length > 50) past.shift(); future.length = 0; }
  function restore(str) { clips = JSON.parse(str).map(([r, a, b]) => ({ ref: refs[r], in: a, out: b })); sel = -1; draw(); seek(Math.min(t, total())); }
  $("edUndo").onclick = () => { if (past.length) { future.push(snap()); restore(past.pop()); } };
  $("edRedo").onclick = () => { if (future.length) { past.push(snap()); restore(future.pop()); } };

  // ----- Ouvrir / fermer -----
  window.openEditor = async list => {
    $("ed").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    refs = [];
    clips = [];
    past.length = future.length = 0;
    await addRefs(list, false);
    sel = -1;
    seek(0);
  };
  $("edClose").onclick = () => { pause(); $("ed").classList.add("hidden"); document.body.style.overflow = ""; };

  async function addRefs(list, record = true) {
    if (record) save();
    for (const r of list) {
      refs.push(r);
      const d = await duration(r);
      clips.push({ ref: r, in: 0, out: d });
      if (!r.thumb && r.file instanceof File && typeof makeThumb === "function") makeThumb(r).then(draw);
    }
    draw();
  }

  // ----- Dessin de la ligne du temps -----
  function draw() {
    const half = tl.clientWidth / 2;
    track.style.padding = `0 ${half}px`;
    track.innerHTML = clips.map((c, i) => {
      const w = Math.max(8, (c.out - c.in) * PPS);
      const bg = c.ref.thumb ? `background-image:url(${c.ref.thumb})` : "";
      return `<div class="eclip${i === sel ? " sel" : ""}" data-i="${i}" style="width:${w}px;${bg}"><span>${fmt(c.out - c.in)}</span></div>`;
    }).join("") + `<div class="eadd" data-add="1">＋</div>`;
    const tot = total();
    $("edRuler").style.padding = `0 ${half}px`;
    let marks = "";
    for (let s = 0; s <= Math.ceil(tot); s += 2) marks += `<span style="left:${half + s * PPS}px">${fmt(s)}</span>`;
    $("edRuler").innerHTML = marks;
    $("edRuler").style.width = (tot * PPS + 2 * half) + "px";
    document.querySelectorAll("#ed .etools button").forEach(b => {
      const need = ["split", "left", "right", "del"].includes(b.dataset.t);
      b.disabled = need && sel < 0;
    });
    $("edTime").textContent = fmt(t) + " / " + fmt(tot);
  }

  track.addEventListener("click", e => {
    if (e.target.closest("[data-add]")) return $("edFile").click();
    const c = e.target.closest(".eclip");
    sel = c ? (+c.dataset.i === sel ? -1 : +c.dataset.i) : -1;
    draw();
  });

  // ----- Lecture -----
  function show(time, andPlay) {
    const { i, off } = locate(time);
    if (i < 0) { video.removeAttribute("src"); return; }
    const c = clips[i];
    if (cur !== i || video.dataset.url !== c.ref.url) {
      cur = i;
      video.dataset.url = c.ref.url;
      video.src = c.ref.url;
    }
    const target = c.in + off;
    const go = () => { video.currentTime = target; if (andPlay) video.play().catch(() => {}); };
    if (video.readyState >= 1) go(); else video.onloadedmetadata = () => { video.onloadedmetadata = null; go(); };
  }
  function seek(time) {
    t = Math.min(Math.max(0, time), total());
    userScroll = false;
    tl.scrollLeft = t * PPS;
    requestAnimationFrame(() => (userScroll = true));
    show(t, false);
    $("edTime").textContent = fmt(t) + " / " + fmt(total());
  }
  function play() {
    if (!clips.length) return;
    if (t >= total() - 0.05) t = 0;
    playing = true;
    $("edPlay").textContent = "❚❚";
    show(t, true);
  }
  function pause() {
    playing = false;
    $("edPlay").textContent = "▶";
    video.pause();
  }
  $("edPlay").onclick = () => (playing ? pause() : play());
  video.addEventListener("click", () => (playing ? pause() : play()));

  video.addEventListener("timeupdate", () => {
    if (!playing || cur < 0) return;
    const c = clips[cur];
    if (!c) return;
    const start = clips.slice(0, cur).reduce((s, x) => s + (x.out - x.in), 0);
    if (video.currentTime >= c.out - 0.03) {
      if (cur >= clips.length - 1) { pause(); seek(total()); return; }
      t = start + (c.out - c.in) + 0.001;
      show(t, true);
    } else {
      t = start + video.currentTime - c.in;
    }
    userScroll = false;
    tl.scrollLeft = t * PPS;
    requestAnimationFrame(() => (userScroll = true));
    $("edTime").textContent = fmt(t) + " / " + fmt(total());
  });
  video.addEventListener("ended", () => {
    if (!playing) return;
    if (cur >= clips.length - 1) { pause(); return; }
    t = clips.slice(0, cur + 1).reduce((s, x) => s + (x.out - x.in), 0) + 0.001;
    show(t, true);
  });

  // Faire défiler la ligne du temps = se déplacer dans la vidéo
  let scrollTimer;
  tl.addEventListener("scroll", () => {
    if (!userScroll) return;
    if (playing) pause();
    t = Math.min(tl.scrollLeft / PPS, total());
    $("edTime").textContent = fmt(t) + " / " + fmt(total());
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => show(t, false), 60);
  });

  // ----- Outils -----
  document.querySelectorAll("#ed .etools button").forEach(b => b.onclick = () => {
    const tool = b.dataset.t;
    if (tool === "add") return $("edFile").click();
    if (sel < 0) return;
    pause();
    if (tool === "split") {
      const { i, off } = locate(t);
      const c = clips[i];
      if (off < 0.1 || off > c.out - c.in - 0.1) return;
      save();
      clips.splice(i, 1, { ref: c.ref, in: c.in, out: c.in + off }, { ref: c.ref, in: c.in + off, out: c.out });
      sel = i + 1;
    } else if (tool === "del") {
      save();
      clips.splice(sel, 1);
      sel = -1;
    } else if (tool === "left" && sel > 0) {
      save();
      [clips[sel - 1], clips[sel]] = [clips[sel], clips[sel - 1]];
      sel--;
    } else if (tool === "right" && sel < clips.length - 1) {
      save();
      [clips[sel + 1], clips[sel]] = [clips[sel], clips[sel + 1]];
      sel++;
    }
    cur = -1;
    draw();
    seek(Math.min(t, total()));
  });

  $("edFile").addEventListener("change", async e => {
    const list = [...e.target.files].map(f => ({ file: f, url: URL.createObjectURL(f) }));
    e.target.value = "";
    await addRefs(list);
    seek(t);
  });

  // ----- Export (via Shotstack) -----
  const sheet = (html, closable = true) => {
    $("edSheetBody").innerHTML = html;
    $("edSheetClose").classList.toggle("hidden", !closable);
    $("edSheet").classList.remove("hidden");
  };
  $("edSheetClose").onclick = () => $("edSheet").classList.add("hidden");

  $("edExport").onclick = async () => {
    if (!clips.length) return;
    pause();
    const say = txt => sheet(`<div class="small" style="font-size:15px;color:#ddd">⏳ ${txt}</div>`, false);
    try {
      const used = [...new Set(clips.map(c => c.ref))];
      for (let n = 0; n < used.length; n++) await uploadRush(used[n], `vidéo ${n + 1}/${used.length}`, say);
      let start = 0;
      const timeline = { tracks: [{ clips: clips.map(c => {
        const len = +(c.out - c.in).toFixed(3);
        const clip = { asset: { type: "video", src: c.ref.src, trim: +c.in.toFixed(3) }, start: +start.toFixed(3), length: len };
        start += len;
        return clip;
      }) }] };
      say("Montage envoyé…");
      const url = await renderTimeline(timeline, say);
      sheet(`<div style="margin-bottom:8px">✅ Vidéo prête !</div>
        <video src="${url}" controls playsinline style="width:100%;max-height:50vh;border-radius:8px;background:#000"></video>
        <a class="main" style="display:block;text-align:center;text-decoration:none;margin-top:8px;padding:10px;border-radius:8px;background:#3b82f6;color:#fff" href="${url}" target="_blank" rel="noopener">Télécharger</a>`);
    } catch (err) {
      sheet(`<div style="color:#f87171">❌ ${err.message}</div>`);
    }
  };

  window.addEventListener("resize", () => { if (!$("ed").classList.contains("hidden")) { draw(); seek(t); } });
})();
