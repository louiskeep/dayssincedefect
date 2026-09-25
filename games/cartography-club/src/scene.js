/* Scene rendering: paints the current `S` onto the HUD, the room (current
   biome), and the artifact shelf. Reads state, writes DOM, no logic here. */

function renderHUD() {
  document.getElementById("count").textContent = fmtDur(Date.now() - S.start);
  document.getElementById("rec").textContent = `best ${S.best}d · ${S.screwups} defects`;
  document.getElementById("bits").textContent = fmtBits(S.bits);
  document.getElementById("rate").textContent = fmtBitsWord(bitsPerDay());
  document.getElementById("jumphud").textContent = `${Math.min(S.jump, 12)}/12`;
  document.getElementById("col").textContent = `${ownedCount()}/24`;
  const need = chargeToJump(S.jump);
  document.getElementById("jumpbar").style.width = (S.jump >= 12 ? 100 : Math.min(100, S.points / need * 100)) + "%";
  const retrieveBtn = document.getElementById("retrieveBtn");
  const full = ownedCount() >= 24, cost = retrieveCost(), afford = S.bits >= cost;
  retrieveBtn.textContent = full ? "Retrieve Artifact · shelf complete" : `Retrieve Artifact · ${fmtBitsWord(cost)}`;
  retrieveBtn.disabled = full || !afford;
  document.getElementById("finaleBtn").hidden = !readyForFinale() && !isWon();
  if (isWon()) document.getElementById("finaleBtn").textContent = "The loop is sealed. Start a new season?";
  else document.getElementById("finaleBtn").textContent = "Seal the Loop (The Temporal Paradox)";
}

function renderRoom() {
  const jumpIdx = Math.min(S.jump, 11); /* biome shown = the era just reached, capped at 12 */
  const [name, flavor] = BIOMES[jumpIdx];
  document.getElementById("biomeName").textContent = name;
  document.getElementById("biomeFlavor").textContent = flavor;
  document.getElementById("biomeCount").textContent = `Jump ${Math.min(S.jump, 12)} of 12`;
}

let slotEls = [];
function buildShelf() {
  const shelf = document.getElementById("shelf");
  shelf.innerHTML = "";
  slotEls = [];
  for (let i = 0; i < 24; i++) {
    const cell = document.createElement("div");
    cell.className = "aslot";
    cell.textContent = "?";
    shelf.appendChild(cell);
    slotEls.push(cell);
  }
}
function renderShelf() {
  for (let i = 0; i < 24; i++) {
    const cell = slotEls[i];
    if (S.artifacts[i]) {
      cell.classList.add("owned");
      cell.textContent = ARTIFACTS[i];
      cell.onclick = () => openArtifactCard(i);
    } else {
      cell.classList.remove("owned");
      cell.textContent = "?";
      cell.onclick = null;
    }
  }
}

function fullRender() { renderHUD(); renderRoom(); renderShelf(); }
