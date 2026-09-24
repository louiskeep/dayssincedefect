/* Boot + wiring. Loaded last, after every other src/*.js file. On DOMContentLoaded
   it builds the shelves, does a first render, then binds every prop and button to
   its handler. The 1s and 15s intervals keep the counter accruing and autosave. */

/* ---------- boot ---------- */
function fullRender(){renderHUD();renderHero(false);renderShelf();renderGear();applyPartyMode();}
// match the header's width to the gear+room+shelf row below it (3-column desktop only)
function syncHeaderWidth(){
  const g=document.querySelector(".gear-side"),s=document.querySelector(".shelf-side"),h=document.querySelector(".hbar");
  if(!g||!s||!h)return;
  if(window.innerWidth<=820){h.style.width="";h.style.marginLeft="";h.style.marginRight="";return;}
  const w=Math.round(s.getBoundingClientRect().right-g.getBoundingClientRect().left);
  if(w>0){h.style.width=w+"px";h.style.marginLeft="auto";h.style.marginRight="auto";}
}
function boot(){
  applySeasonConfig();
  buildShelf();buildGear();accrue();loadProps();loadCookie();applyPropLayout();fullRender();
  document.getElementById("lvRange").value=S.level;
  syncHeaderWidth();
  window.addEventListener("resize",syncHeaderWidth);
  window.addEventListener("load",syncHeaderWidth);

  document.getElementById("helpBtn").onclick=()=>open("helpModal");
  document.getElementById("helpClose").onclick=()=>close("helpModal");
  document.getElementById("bossBtn").onclick=openBoss;
  document.getElementById("attackBtn").onclick=attack;
  document.getElementById("celebrateBtn").onclick=celebrate;
  document.getElementById("newSeasonBtn").onclick=newSeason;
  document.getElementById("recapNext").onclick=()=>close("recapModal");
  // fortune cookie prop on the counter: lifts on hover (CSS), click cracks it open + reveals a question
  document.getElementById("cookieProp").onclick=openFortune;
  document.getElementById("cookieImg").onclick=rerollFortune;
  document.getElementById("cookieAgain").onclick=rerollFortune;
  document.getElementById("fortuneClose").onclick=()=>close("fortuneModal");

  document.getElementById("calProp").onclick=openLog;
  document.getElementById("vendProp").onclick=openSpin;
  document.getElementById("alarmProp").onclick=openDefect;
  // fridge magnets: click the fridge door to view earned achievements
  document.getElementById("fridgeProp").onclick=openFridge;
  document.getElementById("fridgeClose").onclick=()=>close("fridgeModal");

  document.getElementById("logGo").onclick=doLog;
  document.getElementById("logCancel").onclick=()=>close("logModal");
  document.getElementById("ptMinus").onclick=()=>{const e=document.getElementById("ptInput");e.value=Math.max(1,(+e.value||0)-5);};
  document.getElementById("ptPlus").onclick=()=>{const e=document.getElementById("ptInput");e.value=Math.min(999,(+e.value||0)+5);};
  document.getElementById("spinGo").onclick=doSpin;
  document.getElementById("spinCancel").onclick=()=>close("spinModal");
  document.getElementById("defectGo").onclick=openPostmortem;
  document.getElementById("defectCancel").onclick=()=>close("defectModal");
  document.getElementById("pmGo").onclick=()=>finishDefect(true);
  document.getElementById("pmSkip").onclick=()=>finishDefect(false);

  // team to-do list (wall board prop) + post-mortem log tab
  document.getElementById("todoProp").onclick=openIdeas;
  document.getElementById("ideaAdd").onclick=addIdea;
  document.getElementById("ideaClose").onclick=()=>close("ideaModal");
  document.getElementById("tabTodo").onclick=()=>showIdeaTab("todo");
  document.getElementById("tabPm").onclick=()=>showIdeaTab("pm");

  ["logModal","spinModal","defectModal","pmModal","ideaModal","cardModal","trophyModal","devModal","fortuneModal","helpModal","fridgeModal","recapModal"].forEach(id=>{
    document.getElementById(id).addEventListener("click",e=>{if(e.target.id===id)close(id);});});

  // dev (in its own popup, opened by the ⚙ cog)
  document.getElementById("devBtn").onclick=()=>open("devModal");
  document.getElementById("devClose").onclick=()=>close("devModal");
  document.getElementById("lvRange").oninput=e=>{S.level=+e.target.value;S.points=0;save();renderHUD();renderHero(true);renderGear();};
  document.getElementById("addBits").onclick=()=>{S.bits+=500;save();renderHUD();};
  document.getElementById("addDay").onclick=()=>{S.start-=DAY;S.bits+=bitsPerDay();save();renderHUD();};
  document.getElementById("subDay").onclick=()=>{S.bits=Math.max(0,S.bits-bitsPerDay());S.start=Math.min(Date.now(),S.start+DAY);save();renderHUD();};
  document.getElementById("fillShelf").onclick=()=>{S.owned=Array(24).fill(true);save();renderShelf();renderHUD();};
  document.getElementById("wipe").onclick=()=>{
    if(!confirm("Reset this season's progress? Your level, bobbleheads, streak and bits are cleared. Season history, magnets, to-dos and questions are kept."))return;
    const keep={sprintWeeks:S.sprintWeeks,avgPoints:S.avgPoints,seasonSprints:S.seasonSprints,ptsPerLevel:S.ptsPerLevel,bobblesPerSprint:S.bobblesPerSprint,defBits:S.defBits,defLevels:S.defLevels,defAll:S.defAll};
    S=defState();Object.assign(S,keep);save();document.getElementById("lvRange").value=0;
    syncSetupInputs();syncDefectInputs();fullRender();};

  // dev tabs
  const showTab=t=>{
    for(const[k,tab,pane]of[["dev","tabDev","paneDev"],["setup","tabSetup","paneSetup"],["fortunes","tabFortunes","paneFortunes"],["seasons","tabSeasons","paneSeasons"],["def","tabDefect","paneDefect"]]){
      document.getElementById(tab).classList.toggle("on",t===k);
      document.getElementById(pane).hidden=t!==k;}
    if(t==="seasons")renderSeasons();
    if(t==="fortunes")renderFortunes();};
  document.getElementById("tabDev").onclick=()=>showTab("dev");
  document.getElementById("tabSetup").onclick=()=>showTab("setup");
  document.getElementById("tabFortunes").onclick=()=>showTab("fortunes");
  document.getElementById("tabSeasons").onclick=()=>showTab("seasons");
  document.getElementById("tabDefect").onclick=()=>showTab("def");
  document.getElementById("fortuneAdd").onclick=addFortune;
  document.getElementById("fortuneReset").onclick=resetFortunes;

  // setup: PO configures the season by sprint length, team velocity, and desired length; dials are derived
  const swEl=document.getElementById("sprintWeeks"),apEl=document.getElementById("avgPoints"),ssEl=document.getElementById("seasonSprints");
  syncSetupInputs();
  const applySetup=()=>{
    S.sprintWeeks=parseFloat(swEl.value)||S.sprintWeeks;
    S.avgPoints=parseFloat(apEl.value)||S.avgPoints;
    S.seasonSprints=parseFloat(ssEl.value)||S.seasonSprints;
    applySeasonConfig();save();syncSetupInputs();renderHUD();
  };
  swEl.onchange=applySetup;apEl.onchange=applySetup;ssEl.onchange=applySetup;
  document.getElementById("setupReset").onclick=()=>{Object.assign(S,SETUP_DEFAULTS);applySeasonConfig();save();syncSetupInputs();renderHUD();};

  // defect punishment controls
  const bEl=document.getElementById("defBits"),lEl=document.getElementById("defLevels"),aEl=document.getElementById("defAll");
  syncDefectInputs();
  const applyDefect=()=>{
    S.defBits=Math.max(0,Math.min(100,parseInt(bEl.value)||0));
    S.defLevels=Math.max(0,Math.min(12,parseInt(lEl.value)||0));
    S.defAll=aEl.checked;
    lEl.disabled=S.defAll;
    save();renderDefNote();};
  bEl.onchange=applyDefect;lEl.onchange=applyDefect;aEl.onchange=applyDefect;

  setInterval(()=>{accrue();renderHUD();},1000);
  setInterval(save,15000);
}
document.addEventListener("DOMContentLoaded",boot);
