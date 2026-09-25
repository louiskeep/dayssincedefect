/* Boot + wiring. Loaded last, after every other src/*.js file. */

function boot() {
  applySeasonConfig();
  buildShelf();
  accrue();
  fullRender();
  syncSetupInputs();

  document.getElementById("helpBtn").onclick = () => open("helpModal");
  document.getElementById("helpClose").onclick = () => close("helpModal");
  document.getElementById("settingsBtn").onclick = () => open("settingsModal");
  document.getElementById("settingsClose").onclick = () => close("settingsModal");

  document.getElementById("logBtn").onclick = openLog;
  document.getElementById("logGo").onclick = submitLog;
  document.getElementById("logCancel").onclick = () => close("logModal");

  document.getElementById("retrieveBtn").onclick = submitRetrieve;

  document.getElementById("defectBtn").onclick = openDefect;
  document.getElementById("defectGo").onclick = openPostmortem;
  document.getElementById("defectCancel").onclick = () => close("defectModal");
  document.getElementById("pmGo").onclick = () => finishDefect(true);
  document.getElementById("pmSkip").onclick = () => finishDefect(false);

  document.getElementById("finaleBtn").onclick = openFinale;
  document.getElementById("finaleAttack").onclick = doFinaleAttack;
  document.getElementById("finaleClose").onclick = () => close("finaleModal");
  document.getElementById("finaleNewSeason").onclick = runNewSeason;

  document.getElementById("sprintWeeks").onchange = applySetup;
  document.getElementById("avgPoints").onchange = applySetup;
  document.getElementById("seasonSprints").onchange = applySetup;

  ["logModal", "defectModal", "pmModal", "cardModal", "helpModal", "settingsModal", "finaleModal"].forEach(id => {
    document.getElementById(id).addEventListener("click", e => { if (e.target.id === id) close(id); });
  });

  setInterval(() => { accrue(); renderHUD(); }, 1000);
  setInterval(save, 15000);
}
document.addEventListener("DOMContentLoaded", boot);
