/* Modal helpers and the action dialogs: log a sprint, retrieve an artifact
   reveal, report a defect + its post-mortem prompt, settings, and the
   finale fight. open()/close() toggle the .open class on any modal. */

const open = id => document.getElementById(id).classList.add("open");
const close = id => document.getElementById(id).classList.remove("open");

/* ---------- log a sprint ---------- */
function openLog() {
  const need = chargeToJump(S.jump);
  document.getElementById("logNeed").textContent = S.jump >= 12
    ? "The machine is fully charged, but points still count for the record."
    : `${Math.max(0, need - S.points)} pts to the next jump`;
  open("logModal");
}
function submitLog() {
  const n = parseInt(document.getElementById("ptInput").value) || 0;
  const jumped = doLog(n);
  close("logModal");
  fullRender();
  if (jumped) showJumpReveal(jumped);
}
function showJumpReveal(jump) {
  const [name, flavor] = BIOMES[jump - 1];
  document.getElementById("cardBox").innerHTML = `
    <div class="card-head"><span class="card-no">Jump ${jump} / 12</span><h3>${name}</h3></div>
    <div class="card-art"><p class="card-line">"${flavor}"</p></div>
    <button class="btn" id="cardClose">Onward</button>`;
  document.getElementById("cardBox").querySelector("#cardClose").onclick = () => close("cardModal");
  open("cardModal");
}

/* ---------- Retrieve Artifact ---------- */
function submitRetrieve() {
  const idx = doRetrieve();
  if (idx === null) return;
  fullRender();
  document.getElementById("cardBox").innerHTML = `
    <div class="card-head"><span class="card-no">Artifact ${ownedCount()} / 24</span><h3>Retrieved</h3></div>
    <div class="card-art"><p class="card-line">"${ARTIFACTS[idx]}"</p></div>
    <button class="btn" id="cardClose">Nice</button>`;
  document.getElementById("cardBox").querySelector("#cardClose").onclick = () => close("cardModal");
  open("cardModal");
}
function openArtifactCard(i) {
  document.getElementById("cardBox").innerHTML = `
    <div class="card-head"><span class="card-no">Artifact ${i + 1} / 24</span><h3>On the shelf</h3></div>
    <div class="card-art"><p class="card-line">"${ARTIFACTS[i]}"</p></div>
    <button class="btn" id="cardClose">Close</button>`;
  document.getElementById("cardBox").querySelector("#cardClose").onclick = () => close("cardModal");
  open("cardModal");
}

/* ---------- report a defect ---------- */
function openDefect() {
  const lvl = S.defAll ? "reset the machine's charge to jump 0" : `drop ${S.defJumps} jump${S.defJumps === 1 ? "" : "s"} (to ${defectResultJump()})`;
  document.getElementById("defectLose").textContent =
    `You'd ${lvl}, lose ${S.defBits}% of your bits (${Math.floor(S.bits * S.defBits / 100)}), and reset the streak from ${fmtDur(Date.now() - S.start)}.`;
  open("defectModal");
}
function openPostmortem() {
  close("defectModal");
  document.getElementById("pmQ").textContent = POSTMORTEM_Q;
  document.getElementById("pmNote").value = "";
  open("pmModal");
}
function finishDefect(saveNote) {
  if (saveNote) {
    const t = document.getElementById("pmNote").value.trim();
    if (t) (S.pmNotes = S.pmNotes || []).push({ q: POSTMORTEM_Q, note: t, ts: Date.now() });
  }
  close("pmModal");
  const { jumpsLost, bitsLost } = doDefect();
  fullRender();
  document.getElementById("pmQ").textContent = "";
  alert(`Defect logged. -${jumpsLost} jump${jumpsLost === 1 ? "" : "s"}, -${bitsLost.toLocaleString()} bits.`);
}

/* ---------- finale ---------- */
function openFinale() {
  if (isWon()) { runNewSeason(); return; }
  resetFinale();
  document.getElementById("paradoxHp").style.width = "100%";
  document.getElementById("finaleWin").hidden = true;
  document.getElementById("finaleAttack").disabled = false;
  open("finaleModal");
}
function doFinaleAttack() {
  const dmg = attackParadox();
  if (dmg <= 0) return;
  document.getElementById("paradoxHp").style.width = (paradoxHP / 24 * 100) + "%";
  if (paradoxHP <= 0) {
    document.getElementById("finaleAttack").disabled = true;
    document.getElementById("finaleWin").hidden = false;
  }
}
function runNewSeason() {
  const recap = newSeason();
  close("finaleModal");
  fullRender();
  alert(`Season complete. ${recap.points} pts, best streak ${recap.best}d, ${recap.defects} defects, ${recap.artifacts}/24 artifacts, ${recap.jumps}/12 jumps.${recap.won ? " Loop sealed!" : ""}`);
}

/* ---------- settings ---------- */
function syncSetupInputs() {
  document.getElementById("sprintWeeks").value = S.sprintWeeks;
  document.getElementById("avgPoints").value = S.avgPoints;
  document.getElementById("seasonSprints").value = S.seasonSprints;
}
function applySetup() {
  S.sprintWeeks = parseFloat(document.getElementById("sprintWeeks").value) || S.sprintWeeks;
  S.avgPoints = parseFloat(document.getElementById("avgPoints").value) || S.avgPoints;
  S.seasonSprints = parseFloat(document.getElementById("seasonSprints").value) || S.seasonSprints;
  applySeasonConfig();
  save();
  syncSetupInputs();
  fullRender();
}
