/* Boot + wiring. Loaded last, after every other src/*.js file. */
function boot(){
  applySeasonConfig();
  accrue();fullRender();
  syncSetupInputs();

  document.getElementById("helpBtn").onclick=()=>open("helpModal");
  document.getElementById("helpClose").onclick=()=>close("helpModal");

  document.getElementById("calProp").onclick=openLog;
  document.getElementById("logGo").onclick=doLog;
  document.getElementById("logCancel").onclick=()=>close("logModal");
  document.getElementById("ptMinus").onclick=()=>{const e=document.getElementById("ptInput");e.value=Math.max(1,(+e.value||0)-5);};
  document.getElementById("ptPlus").onclick=()=>{const e=document.getElementById("ptInput");e.value=Math.min(999,(+e.value||0)+5);};

  document.getElementById("tendProp").onclick=doTend;

  document.getElementById("alarmProp").onclick=openDefect;
  document.getElementById("defectGo").onclick=doDefect;
  document.getElementById("defectCancel").onclick=()=>close("defectModal");

  document.getElementById("recapNext").onclick=newSeason;
  document.getElementById("trophyBox").addEventListener("click",e=>{if(e.target.id==="trophyModal")close("trophyModal");});

  ["logModal","defectModal","cardModal","trophyModal","helpModal","recapModal","devModal"].forEach(id=>{
    document.getElementById(id).addEventListener("click",e=>{if(e.target.id===id)close(id);});});

  document.getElementById("devBtn").onclick=()=>open("devModal");
  document.getElementById("devClose").onclick=()=>close("devModal");
  document.getElementById("addBits").onclick=()=>{S.bits+=500;save();fullRender();};
  document.getElementById("addPoints").onclick=()=>{S.points+=S.pointsPerFlower;const p=plantFlowers();save();fullRender();if(p.length)showReveal(p[p.length-1],"flower");};
  document.getElementById("wipe").onclick=()=>{
    if(!confirm("Reset this season's garden? Points, bits, and every planted species are cleared."))return;
    const keep={sprintWeeks:S.sprintWeeks,avgPoints:S.avgPoints,seasonSprints:S.seasonSprints,baseTreeCost:S.baseTreeCost};
    S=defState();Object.assign(S,keep);applySeasonConfig();save();fullRender();};

  const swEl=document.getElementById("sprintWeeks"),apEl=document.getElementById("avgPoints"),ssEl=document.getElementById("seasonSprints");
  const applySetup=()=>{
    S.sprintWeeks=parseFloat(swEl.value)||S.sprintWeeks;
    S.avgPoints=parseFloat(apEl.value)||S.avgPoints;
    S.seasonSprints=parseFloat(ssEl.value)||S.seasonSprints;
    applySeasonConfig();save();syncSetupInputs();fullRender();
  };
  swEl.onchange=applySetup;apEl.onchange=applySetup;ssEl.onchange=applySetup;
  document.getElementById("setupReset").onclick=()=>{Object.assign(S,SETUP_DEFAULTS);applySeasonConfig();save();syncSetupInputs();fullRender();};

  setInterval(()=>{accrue();renderHUD();},1000);
  setInterval(save,15000);
}
document.addEventListener("DOMContentLoaded",boot);
