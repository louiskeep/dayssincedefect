/* Office Aquarium: boot + wiring. Loaded last, after every other src/*.js
   file. Builds the tank, does a first render, then binds every button to its
   handler. The 1s and 15s intervals keep food accruing and autosave. */

function boot() {
  applySeasonConfig();
  buildTank(); accrue(); fullRender();

  document.getElementById("helpBtn").onclick = () => open("helpModal");
  document.getElementById("helpClose").onclick = () => close("helpModal");
  document.getElementById("settingsBtn").onclick = () => { syncSetupInputs(); syncDefectInputs(); open("settingsModal"); };
  document.getElementById("settingsClose").onclick = () => close("settingsModal");

  document.getElementById("logBtn").onclick = openLog;
  document.getElementById("logGo").onclick = doLogClick;
  document.getElementById("logCancel").onclick = () => close("logModal");
  document.getElementById("ptMinus").onclick = () => { const e = document.getElementById("ptInput"); e.value = Math.max(1, (+e.value || 0) - 5); };
  document.getElementById("ptPlus").onclick = () => { const e = document.getElementById("ptInput"); e.value = Math.min(999, (+e.value || 0) + 5); };

  document.getElementById("feedBtn").onclick = doFeedClick;
  document.getElementById("feedClose").onclick = () => close("feedModal");

  document.getElementById("defectBtn").onclick = openDefect;
  document.getElementById("defectGo").onclick = doDefectClick;
  document.getElementById("defectCancel").onclick = () => close("defectModal");

  document.getElementById("recapNext").onclick = doNewSeasonClick;

  ["logModal", "feedModal", "defectModal", "cardModal", "helpModal", "settingsModal", "recapModal"].forEach(id => {
    document.getElementById(id).addEventListener("click", e => { if (e.target.id === id) close(id); });
  });

  const swEl = document.getElementById("sprintWeeks"), apEl = document.getElementById("avgPoints"), ssEl = document.getElementById("seasonSprints");
  swEl.onchange = applySetup; apEl.onchange = applySetup; ssEl.onchange = applySetup;
  document.getElementById("setupReset").onclick = () => { Object.assign(S, SETUP_DEFAULTS); applySeasonConfig(); save(); syncSetupInputs(); renderHUD(); };
  document.getElementById("defBits").onchange = applyDefectSetting;

  setInterval(() => { accrue(); renderHUD(); }, 1000);
  setInterval(save, 15000);
}
document.addEventListener("DOMContentLoaded", boot);
