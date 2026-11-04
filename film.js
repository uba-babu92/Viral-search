// ===== FILM : caméra simple, plan par plan (comme TikTok, sans poster) =====
(() => {
  const $ = id => document.getElementById(id);
  const cam = $("cam"), video = $("camVideo");
  let stream = null, recorder = null, chunks = [], recStart = 0, timer = null;
  let facing = "environment";   // "user" = devant, "environment" = derrière
  let mode = "hold";            // "hold" = appui long, "tap" = appui simple
  let lenses = [];              // objectifs arrière : [{label, deviceId?, zoom?}]
  let lensIdx = 0;
  const clips = [];             // plans filmés : {blob, dur}

  const mime = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"]
    .find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
  const ext = mime.includes("mp4") ? "mp4" : "webm";

  async function start(constraints) {
    stop();
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },   // son naturel, pas « appel »
      // Pas de format imposé : sinon l'iPhone recadre (effet zoom). Il tourne l'image tout seul.
      video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 }, ...constraints },
    });
    video.srcObject = stream;
    video.classList.toggle("mirror", facing === "user");
  }
  function stop() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
  }

  // Trouve les objectifs arrière (0.5x / 1x / 3x)
  async function findLenses() {
    lenses = [];
    const track = stream && stream.getVideoTracks()[0];
    const caps = track && track.getCapabilities ? track.getCapabilities() : {};
    // Cas 2 : un appareil par objectif (on les choisit par leur nom)
    const devs = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === "videoinput");
    const back = devs.filter(d => !/avant|front|facetime|user/i.test(d.label));
    const ultra = back.find(d => /ultra/i.test(d.label));
    const tele = back.find(d => /t[ée]l[ée]|tele/i.test(d.label));
    const wide = back.find(d => d !== ultra && d !== tele && !/double|dual|triple/i.test(d.label));
    if (ultra) lenses.push({ label: "0.5", deviceId: ultra.deviceId });
    if (wide) lenses.push({ label: "1", deviceId: wide.deviceId });
    if (tele) lenses.push({ label: "3", deviceId: tele.deviceId });
    lensIdx = Math.max(0, lenses.findIndex(l => l.label === "1"));
    if (lenses.length >= 2) return;
    lenses = [];
    // Cas 1 : la caméra gère le zoom (passe d'un objectif à l'autre toute seule)
    if (caps.zoom && caps.zoom.max > 1) {
      const min = caps.zoom.min, max = caps.zoom.max;
      // Sur iPhone, zoom 1 = ultra grand-angle si min = 1 et objectif "0.5x" présent
      const ultra = min < 1 || /ultra|triple|double|dual/i.test(track.label);
      const base = ultra && min >= 1 ? 2 : 1;
      if (ultra) lenses.push({ label: "0.5", zoom: min });
      lenses.push({ label: "1", zoom: base });
      if (max >= base * 2) lenses.push({ label: "2", zoom: base * 2 });
      if (max >= base * 3) lenses.push({ label: "3", zoom: base * 3 });
      lensIdx = lenses.findIndex(l => l.label === "1");
    }
  }

  function drawLenses() {
    const box = $("camLenses");
    box.innerHTML = "";
    if (facing === "user" || lenses.length < 2) return;
    lenses.forEach((l, i) => {
      const b = document.createElement("button");
      b.textContent = (i === lensIdx ? l.label + "x" : l.label);
      b.className = i === lensIdx ? "on" : "";
      b.onclick = () => setLens(i);
      box.appendChild(b);
    });
  }

  async function setLens(i) {
    if (recorder) return; // pas pendant l'enregistrement
    const l = lenses[i];
    try {
      if (l.zoom !== undefined) await stream.getVideoTracks()[0].applyConstraints({ advanced: [{ zoom: l.zoom }] });
      else await start({ deviceId: { exact: l.deviceId } });
      lensIdx = i;
    } catch (e) { msg("Objectif indisponible"); }
    drawLenses();
  }

  async function open() {
    cam.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    try {
      await start({ facingMode: facing });
      if (facing === "environment") await findLenses();
      drawLenses();
    } catch (e) {
      msg("Caméra refusée : autorise la caméra et le micro pour ce site (réglages Safari).");
    }
    drawClips();
  }
  function close() {
    if (recorder) stopRec();
    stop();
    cam.classList.add("hidden");
    document.body.style.overflow = "";
  }

  async function flip() {
    if (recorder) return;
    facing = facing === "user" ? "environment" : "user";
    try {
      await start({ facingMode: facing });
      lenses = [];
      if (facing === "environment") await findLenses();
    } catch (e) { msg("Impossible de changer de caméra"); }
    drawLenses();
  }

  // ----- Enregistrement -----
  function startRec() {
    if (!stream || recorder) return;
    chunks = [];
    // Haute qualité : ~12 Mbit/s, comme l'appareil photo de l'iPhone
    recorder = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 12e6, audioBitsPerSecond: 192e3 });
    recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      const dur = (Date.now() - recStart) / 1000;
      if (dur > 0.3) { clips.push({ blob: new Blob(chunks, { type: recorder.mimeType || mime }), dur }); promptGo(1); }   // plan filmé : le prompteur passe au plan suivant
      recorder = null;
      drawClips();
    };
    recorder.start(250);
    recStart = Date.now();
    promptRoll(true);
    $("camShoot").classList.add("rec");
    timer = setInterval(drawClips, 100);
  }
  function stopRec() {
    latched = false;
    if (!recorder) return;
    promptRoll(false);
    clearInterval(timer);
    $("camShoot").classList.remove("rec");
    recorder.stop();
  }

  const shoot = $("camShoot");
  // Un seul bouton, deux façons de filmer (comme TikTok) :
  // - tu maintiens : ça filme tant que tu restes appuyé ;
  // - tu touches juste : ça filme en continu, et tu retouches pour arrêter.
  let pressAt = 0, latched = false;
  shoot.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (latched) { latched = false; stopRec(); return; }   // 2e toucher : on arrête
    pressAt = Date.now();
    startRec();
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(ev =>
    shoot.addEventListener(ev, () => {
      if (!recorder || latched) return;
      if (ev === "pointerup" && Date.now() - pressAt < 350) { latched = true; return; }   // simple toucher : on continue
      stopRec();
    }));
  shoot.addEventListener("contextmenu", e => e.preventDefault());

  // ----- Barre des plans -----
  function drawClips() {
    const total = clips.reduce((s, c) => s + c.dur, 0) + (recorder ? (Date.now() - recStart) / 1000 : 0);
    const bar = $("camBar");
    bar.innerHTML = clips.map(c => `<span style="flex:${c.dur}"></span>`).join("")
      + (recorder ? `<span class="live" style="flex:${(Date.now() - recStart) / 1000}"></span>` : "");
    $("camTime").textContent = total ? total.toFixed(1) + " s · " + clips.length + " plan(s)" : "";
    $("camUndo").classList.toggle("hidden", !clips.length || !!recorder);
    $("camNext").classList.toggle("hidden", !clips.length || !!recorder);
  }

  $("camUndo").onclick = () => { clips.pop(); drawClips(); promptGo(-1); };

  // (les deux modes sont maintenant sur le même bouton)

  // ----- Suivant : Montage IA, Table de montage, ou Galerie -----
  function files() {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return clips.map((c, i) => new File([c.blob], `plan-${stamp}-${i + 1}.${ext}`, { type: c.blob.type }));
  }
  function toMontage() {
    files().forEach(f => rushes.push({ file: f, url: URL.createObjectURL(f), cam: true })); // cam : on coupera l'image figée du début
    clips.length = 0;
    close();
    setRubrique("montage");
    drawRushes();
    makeThumbs();
  }
  // Mode « ajout depuis l'éditeur » : Suivant renvoie directement les plans à l'éditeur
  let insertCb = null;
  window.openCameraFor = cb => {
    insertCb = cb;
    $("cam").style.zIndex = 90;   // au-dessus de l'éditeur
    open();
  };
  $("camNext").onclick = () => {
    if (!insertCb) return toMontage();   // Suivant : les plans partent directement dans Montage
    const fs = files(), cb = insertCb;
    clips.length = 0;
    insertCb = null; $("cam").style.zIndex = "";
    close();
    cb(fs.map(f => ({ file: f, url: URL.createObjectURL(f), cam: true })));
  };
  $("camChoiceClose").onclick = () => $("camChoice").classList.add("hidden");
  $("camToAI").onclick = () => {
    $("camChoice").classList.add("hidden");
    toMontage();
    $("montageGo").click();
  };
  $("camToEditor").onclick = () => {
    $("camChoice").classList.add("hidden");
    toMontage();
    openEditor(rushes.slice());
  };
  $("camSave").onclick = async () => {
    const fs = files();
    try {
      if (navigator.canShare && navigator.canShare({ files: fs })) await navigator.share({ files: fs });
      else fs.forEach(f => { const a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); });
    } catch (e) { /* annulé */ }
  };


  // ----- Prompteur : ton script défile pendant que tu filmes, un plan à la fois -----
  let plans = [], pIdx = 0, pOff = 0, pRaf = 0, pLast = 0;
  let pSpeed = +(localStorage.getItem("cpSpeed") || 3), pSize = +(localStorage.getItem("cpSize") || 1);
  const SPEEDS = [0, 18, 26, 36, 48, 62, 80];   // pixels par seconde
  const SIZES = [22, 27, 33];
  const lastPlans = () => { try { return JSON.parse(localStorage.getItem("lastScript") || "[]"); } catch (e) { return []; } };
  function loadPrompt(list, show) {
    plans = (list || []).filter(Boolean); pIdx = 0;
    $("camPromptBtn").classList.toggle("hidden", !plans.length);
    $("camPrompt").classList.toggle("hidden", !(plans.length && show));
    promptDraw(); promptCls();
  }
  const promptCls = () => cam.classList.toggle("wp", !$("camPrompt").classList.contains("hidden"));
  function promptDraw() {
    if (!plans.length) return;
    const tx = $("cpText");
    tx.style.fontSize = SIZES[pSize] + "px";
    tx.innerHTML = "";
    tx.append(plans[pIdx] || "");
    if (plans[pIdx + 1]) { const n = document.createElement("i"); n.textContent = "\n\n" + plans[pIdx + 1]; tx.append(n); }
    $("cpNum").textContent = `Plan ${Math.min(pIdx + 1, plans.length)}/${plans.length}`;
    $("cpSpeed").textContent = "Vitesse " + pSpeed;
    pOff = $("cpView").clientHeight * 0.22;
    tx.style.transform = `translateY(${pOff}px)`;
  }
  function promptGo(d) { if (!plans.length) return; pIdx = Math.max(0, Math.min(plans.length - 1, pIdx + d)); promptDraw(); }
  function promptRoll(on) {
    cancelAnimationFrame(pRaf);
    if (!on || !plans.length || $("camPrompt").classList.contains("hidden")) return;
    pLast = performance.now();
    const tick = now => {
      pOff -= SPEEDS[pSpeed] * (now - pLast) / 1000; pLast = now;
      const tx = $("cpText"), min = -tx.scrollHeight + 20;
      if (pOff < min) pOff = min;
      tx.style.transform = `translateY(${pOff}px)`;
      pRaf = requestAnimationFrame(tick);
    };
    pRaf = requestAnimationFrame(tick);
  }
  $("cpPrev").onclick = () => promptGo(-1);
  $("cpNext").onclick = () => promptGo(1);
  $("cpSlow").onclick = () => { pSpeed = Math.max(1, pSpeed - 1); localStorage.setItem("cpSpeed", pSpeed); $("cpSpeed").textContent = "Vitesse " + pSpeed; };
  $("cpFast").onclick = () => { pSpeed = Math.min(6, pSpeed + 1); localStorage.setItem("cpSpeed", pSpeed); $("cpSpeed").textContent = "Vitesse " + pSpeed; };
  $("cpSize").onclick = () => { pSize = (pSize + 1) % SIZES.length; localStorage.setItem("cpSize", pSize); promptDraw(); };
  $("cpHide").onclick = () => { $("camPrompt").classList.add("hidden"); promptRoll(false); promptCls(); };
  $("camPromptBtn").onclick = () => { $("camPrompt").classList.toggle("hidden"); promptDraw(); promptCls(); };
  // Depuis Script : la caméra s'ouvre avec ton script en prompteur
  window.openCameraWithScript = list => { loadPrompt(list, true); open(); setTimeout(promptDraw, 300); };

  function msg(t) {
    const m = $("camMsg");
    m.textContent = t;
    m.classList.remove("hidden");
    setTimeout(() => m.classList.add("hidden"), 3500);
  }

  $("filmOpen").onclick = () => { loadPrompt(lastPlans(), false); open(); };
  $("camClose").onclick = () => { if (insertCb) { insertCb = null; $("cam").style.zIndex = ""; } close(); };
  $("camFlip").onclick = flip;
  document.addEventListener("visibilitychange", () => { if (document.hidden && recorder) stopRec(); });
})();
