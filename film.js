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
      audio: true,
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
    recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      const dur = (Date.now() - recStart) / 1000;
      if (dur > 0.3) clips.push({ blob: new Blob(chunks, { type: recorder.mimeType || mime }), dur });
      recorder = null;
      drawClips();
    };
    recorder.start(250);
    recStart = Date.now();
    $("camShoot").classList.add("rec");
    timer = setInterval(drawClips, 100);
  }
  function stopRec() {
    if (!recorder) return;
    clearInterval(timer);
    $("camShoot").classList.remove("rec");
    recorder.stop();
  }

  const shoot = $("camShoot");
  shoot.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (mode === "hold") startRec();
    else recorder ? stopRec() : startRec();
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(ev =>
    shoot.addEventListener(ev, () => { if (mode === "hold") stopRec(); }));
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

  $("camUndo").onclick = () => { clips.pop(); drawClips(); };

  function setMode(m) {
    mode = m;
    $("camModeHold").classList.toggle("on", m === "hold");
    $("camModeTap").classList.toggle("on", m === "tap");
  }
  $("camModeHold").onclick = () => setMode("hold");
  $("camModeTap").onclick = () => setMode("tap");

  // ----- Suivant : Montage IA, Table de montage, ou Galerie -----
  function files() {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return clips.map((c, i) => new File([c.blob], `plan-${stamp}-${i + 1}.${ext}`, { type: c.blob.type }));
  }
  function toMontage() {
    files().forEach(f => rushes.push({ file: f, url: URL.createObjectURL(f) }));
    clips.length = 0;
    close();
    setRubrique("montage");
    drawRushes();
    makeThumbs();
  }
  $("camNext").onclick = () => $("camChoice").classList.remove("hidden");
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

  function msg(t) {
    const m = $("camMsg");
    m.textContent = t;
    m.classList.remove("hidden");
    setTimeout(() => m.classList.add("hidden"), 3500);
  }

  $("filmOpen").onclick = open;
  $("camClose").onclick = close;
  $("camFlip").onclick = flip;
  document.addEventListener("visibilitychange", () => { if (document.hidden && recorder) stopRec(); });
})();
