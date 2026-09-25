/* Office Aquarium: rendering: the HUD numbers and the tank grid of 24 fish
   slots. Placeholder visuals only (colored circles + labels, no art assets
   yet); state lives in state.js, this file only reads it and writes the DOM. */

function renderHUD() {
  document.getElementById("streak").textContent = fmtDur(Date.now() - S.start);
  document.getElementById("rec").textContent = `best ${S.best}d · ${S.screwups} defects`;
  document.getElementById("bits").textContent = fmtBits(S.bits);
  document.getElementById("rate").textContent = fmtBitsWord(bitsPerDay());
  document.getElementById("col").textContent = `${ownedCount()}/24`;
  document.getElementById("colsub").textContent = `${ownedCount()} / 24 fish`;
  const nextIdx = ownedCount();
  const bar = document.getElementById("ptbar");
  if (nextIdx >= 24) { bar.style.width = "100%"; document.getElementById("ptnote").textContent = "The reef is complete."; }
  else {
    const have = S.points - S.pointsPerFish * nextIdx, need = S.pointsPerFish;
    bar.style.width = Math.max(0, Math.min(100, have / need * 100)) + "%";
    document.getElementById("ptnote").textContent = `${Math.max(0, need - have)} pts to the next fish`;
  }
  const feedBtn = document.getElementById("feedBtn");
  feedBtn.disabled = ownedCount() === 0 || S.bits < FEED_COST;
  feedBtn.textContent = ownedCount() === 0 ? "🍽 Feed the Tank (no fish yet)" : `🍽 Feed the Tank · ${fmtBitsWord(FEED_COST)}`;
}

let slotEls = [];
function buildTank() {
  const tank = document.getElementById("tank"); tank.innerHTML = ""; slotEls = [];
  for (let i = 0; i < 24; i++) {
    const cell = document.createElement("div"); cell.className = "fcell";
    cell.innerHTML = '<div class="ghost">?</div>';
    tank.appendChild(cell); slotEls.push(cell);
  }
}
const FISH_COLORS = ["#ff8a5c","#ffd23f","#5cc9ff","#9b6cff","#37c06a","#ff5c9d","#5ce0c6","#ffb02e"];
function renderTank() {
  for (let i = 0; i < 24; i++) {
    const cell = slotEls[i];
    if (S.fishOwned[i]) {
      const [name] = FISH[i];
      const hat = S.fishHat[i];
      const hatLabel = hat != null ? `<div class="hatbadge" title="${HATS[hat][0]}">🎩</div>` : "";
      if (!cell.classList.contains("on")) {
        cell.classList.add("on");
        cell.style.background = FISH_COLORS[i % FISH_COLORS.length];
        cell.innerHTML = `${hatLabel}<div class="fbody" title="${name}"></div><div class="flabel">${name}</div>`;
        cell.onclick = () => openFishCard(i);
      } else {
        const existingHat = cell.querySelector(".hatbadge");
        if (hat != null && !existingHat) cell.insertAdjacentHTML("afterbegin", hatLabel);
      }
    } else if (!cell.querySelector(".ghost")) {
      cell.classList.remove("on"); cell.style.background = ""; cell.onclick = null;
      cell.innerHTML = '<div class="ghost">?</div>';
    }
  }
}
function fullRender() { renderHUD(); renderTank(); }

function openFishCard(i) {
  const [name, flavor] = FISH[i];
  const hat = S.fishHat[i];
  document.getElementById("cardBox").innerHTML = `
    <div class="card-head"><span class="card-no">Fish ${i + 1} / 24</span><h3>${name}</h3></div>
    <div class="card-art"><div class="card-fish" style="background:${FISH_COLORS[i % FISH_COLORS.length]}"></div></div>
    <p class="card-line">"${flavor}"</p>
    ${hat != null ? `<div class="card-skill">Wearing: ${HATS[hat][0]}</div>` : ""}
    <button class="btn" id="cardClose">Nice</button>`;
  document.getElementById("cardBox").querySelector("#cardClose").onclick = () => close("cardModal");
  open("cardModal");
}
