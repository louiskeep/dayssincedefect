/* Office Aquarium: modal helpers and the action dialogs: log a sprint, feed
   the tank (result reveal), report a defect, settings, and the reef-complete
   recap. open()/close() toggle the .open class on any modal. */

const open = id => document.getElementById(id).classList.add("open");
const close = id => document.getElementById(id).classList.remove("open");

/* ---------- log a sprint ---------- */
function openLog() {
  const nextIdx = ownedCount();
  document.getElementById("logNeed").textContent = nextIdx >= 24
    ? "The reef is already complete, but sprint points still count for the record."
    : `${Math.max(0, S.pointsPerFish * (nextIdx + 1) - S.points)} pts to the next fish`;
  open("logModal");
}
function doLogClick() {
  const n = Math.max(1, Math.min(999, parseInt(document.getElementById("ptInput").value) || 0));
  const revealed = doLog(n);
  close("logModal"); fullRender();
  if (revealed >= 0) openFishReveal(revealed);
  if (S.reefComplete) setTimeout(openReefComplete, revealed >= 0 ? 900 : 0);
}
function openFishReveal(i) {
  const [name, flavor] = FISH[i];
  document.getElementById("cardBox").innerHTML = `
    <div class="card-head"><span class="card-no">New fish! ${i + 1} / 24</span><h3>${name}</h3></div>
    <div class="card-art"><div class="card-fish" style="background:${FISH_COLORS[i % FISH_COLORS.length]}"></div></div>
    <p class="card-line">"${flavor}"</p>
    <button class="btn" id="cardClose">Nice</button>`;
  document.getElementById("cardBox").querySelector("#cardClose").onclick = () => close("cardModal");
  open("cardModal");
}

/* ---------- feed the tank ---------- */
function doFeedClick() {
  const result = feedTank();
  fullRender();
  if (!result) return;
  const { fishIdx, factIdx, hatAwarded } = result;
  const [name] = FISH[fishIdx];
  const fact = FISH[fishIdx][2][factIdx];
  let body = `<h2>🍽 ${name}</h2><p class="lbl">${fact}</p>`;
  if (hatAwarded) body += `<p class="lbl hat-note">Also: a ${HATS[hatAwarded.hatIdx][0]} washed up and landed on ${FISH[hatAwarded.fishIdx][0]}.</p>`;
  document.getElementById("feedBody").innerHTML = body;
  open("feedModal");
}

/* ---------- report a defect ---------- */
function openDefect() {
  const foodLost = Math.floor(S.bits * S.defBits / 100);
  document.getElementById("defectLose").textContent =
    `You'd lose ${S.defBits}% of your food (${foodLost}) and reset the counter from ${fmtDur(Date.now() - S.start)}. Fish and hats are safe.`;
  open("defectModal");
}
function doDefectClick() {
  doDefect();
  close("defectModal"); fullRender();
}

/* ---------- reef complete ---------- */
function openReefComplete() {
  document.getElementById("recapBody").innerHTML = `
    <p><b>${S.seasonPoints || 0}</b> sprint points across <b>${S.sprintsLogged || 0}</b> sprints</p>
    <p><b>${ownedCount()}/24</b> fish, <b>${S.hatsFound || 0}</b> hats, <b>${S.factsLearned || 0}</b> facts learned</p>
    <p><b>${S.screwups || 0}</b> defects reported</p>`;
  open("recapModal");
}
function doNewSeasonClick() {
  newSeason();
  close("recapModal"); document.getElementById("logModal") && close("cardModal");
  buildTank(); fullRender();
}

/* ---------- settings ---------- */
function syncSetupInputs() {
  document.getElementById("sprintWeeks").value = S.sprintWeeks;
  document.getElementById("avgPoints").value = S.avgPoints;
  document.getElementById("seasonSprints").value = S.seasonSprints;
  renderSetupNote();
}
function renderSetupNote() {
  const wks = S.seasonSprints * S.sprintWeeks;
  document.getElementById("setupNote").textContent =
    `A season runs ${S.seasonSprints} sprints (${wks} weeks). All 24 fish land by the last sprint. `
    + `Under the hood: ${S.pointsPerFish} points per fish.`;
}
function applySetup() {
  S.sprintWeeks = parseFloat(document.getElementById("sprintWeeks").value) || S.sprintWeeks;
  S.avgPoints = parseFloat(document.getElementById("avgPoints").value) || S.avgPoints;
  S.seasonSprints = parseFloat(document.getElementById("seasonSprints").value) || S.seasonSprints;
  applySeasonConfig(); save(); syncSetupInputs(); renderHUD();
}
function syncDefectInputs() {
  document.getElementById("defBits").value = S.defBits;
  renderDefNote();
}
function renderDefNote() {
  document.getElementById("defNote").textContent = `Each defect currently costs -${S.defBits}% food.`;
}
function applyDefectSetting() {
  S.defBits = Math.max(0, Math.min(100, parseInt(document.getElementById("defBits").value) || 0));
  save(); renderDefNote();
}
