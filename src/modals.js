/* Modal helpers and the three core action dialogs the room props open: log a
   sprint (calendar), buy a box (vending machine), and report a defect + its
   post-mortem prompt (fire alarm). Also the ⚙ settings sync for the season and
   defect-punishment inputs. open()/close() toggle the .open class on any modal. */

/* ---------- modals ---------- */
const open=id=>document.getElementById(id).classList.add("open");
const close=id=>document.getElementById(id).classList.remove("open");

/* ---------- log a sprint (calendar) ---------- */
function openLog(){
  const need=pointsToClear(S.level);
  document.getElementById("logNeed").textContent=S.level>=12?"You're at max level, but sprint points still count for the record.":
    `${Math.max(0,need-S.points)} pts to reach level ${S.level+1}`;
  open("logModal");
}
function doLog(){
  const n=Math.max(1,Math.min(999,parseInt(document.getElementById("ptInput").value)||0));
  S.points+=n;let last=0;
  S.sprintsLogged=(S.sprintsLogged||0)+1;
  S.seasonPoints=(S.seasonPoints||0)+n;
  while(S.level<12&&S.points>=pointsToClear(S.level)){S.points-=pointsToClear(S.level);S.level++;last=S.level;}
  if(S.level>(S.peakLevel||0))S.peakLevel=S.level;
  save();close("logModal");renderHUD();renderGear();
  if(last){renderHero(true);showTrophy(last);}
}

/* ---------- buy a box (vending machine) ---------- */
function openSpin(){
  const full=ownedCount()>=24,cost=spinCost(),afford=S.bits>=cost;
  document.getElementById("spinCost").textContent=fmtBitsWord(cost);
  const go=document.getElementById("spinGo");go.disabled=full||!afford;
  document.getElementById("spinBody").textContent=full?"Every bobblehead is on the shelf. Nothing left to pull.":
    afford?`Pop the flap and a random office bobblehead tumbles out. ${24-ownedCount()} left to collect.`:
    `You need ${fmtBitsWord(cost)} for a box and you've got ${fmtBitsWord(S.bits)}. Let it accrue a bit longer.`;
  open("spinModal");
}
function doSpin(){
  const cost=spinCost();if(ownedCount()>=24||S.bits<cost)return;
  S.bits-=cost;
  const pool=[];S.owned.forEach((o,i)=>{if(!o)pool.push(i);});
  const idx=pool[Math.floor(Math.random()*pool.length)];
  S.owned[idx]=true;save();close("spinModal");renderHUD();renderShelf();openCard(idx,true);
}

/* ---------- report a defect (fire alarm) + post-mortem prompt ---------- */
function defectResultLevel(){return S.defAll?0:Math.max(0,S.level-S.defLevels);}
function openDefect(){
  const lvl=S.defAll?"reset your level to 0":`drop ${S.defLevels} level${S.defLevels===1?"":"s"} (to ${defectResultLevel()})`;
  document.getElementById("defectLose").textContent=
    `You'd ${lvl}, lose ${S.defBits}% of your bits (${Math.floor(S.bits*S.defBits/100)}), and reset the counter from ${fmtDur(Date.now()-S.start)}.`;
  open("defectModal");
}
/* post-mortem: after confirming the defect, answer one reflective prompt before the hit lands */
let pmQuestion="";
function openPostmortem(){
  close("defectModal");
  pmQuestion=POSTMORTEM_Q;
  document.getElementById("pmQ").textContent=pmQuestion;
  document.getElementById("pmNote").value="";
  open("pmModal");
}
function finishDefect(saveNote){
  if(saveNote){const t=document.getElementById("pmNote").value.trim();
    if(t)(S.pmNotes=S.pmNotes||[]).push({q:pmQuestion,note:t,ts:Date.now()});}
  close("pmModal");doDefect();
}
function doDefect(){
  const d=Math.floor(daysSince());if(d>S.best)S.best=d;
  const oldLevel=S.level, bitsLost=Math.floor(S.bits*S.defBits/100);
  S.screwups++;S.start=Date.now();S.last=Date.now();
  S.bits-=bitsLost;
  S.level=defectResultLevel();S.points=0;
  const levelsLost=oldLevel-S.level;
  document.getElementById("lvRange").value=S.level;
  save();close("defectModal");renderHUD();renderHero(true);renderGear();
  defectFx(levelsLost,bitsLost);
}
/* puff of smoke + floating "-N levels / -M bits" popups as the character regresses */
function defectFx(levelsLost,bitsLost){
  const room=document.getElementById("room");if(!room)return;
  const smoke=document.createElement("div");smoke.className="smokepuff";
  smoke.style.left="25%";smoke.style.top="58%";
  room.appendChild(smoke);setTimeout(()=>smoke.remove(),950);
  const pops=[];
  if(levelsLost>0)pops.push(["fx-lvl",`−${levelsLost} level${levelsLost>1?"s":""}`]);
  if(bitsLost>0)pops.push(["fx-bits",`−${bitsLost.toLocaleString()} bits`]);
  pops.forEach(([cls,txt],idx)=>{
    const el=document.createElement("div");el.className="fxpop "+cls;el.textContent=txt;
    el.style.left="35%";el.style.top=(52-idx*9)+"%";el.style.animationDelay=(idx*0.12)+"s";
    room.appendChild(el);setTimeout(()=>el.remove(),1900);
  });
}

/* ---------- settings sync (⚙ Setup + Defect tabs) ---------- */
function syncDefectInputs(){
  const b=document.getElementById("defBits"),l=document.getElementById("defLevels"),a=document.getElementById("defAll");
  if(!b)return;
  b.value=S.defBits;l.value=S.defLevels;a.checked=S.defAll;l.disabled=S.defAll;
  renderDefNote();
}
function renderDefNote(){
  const n=document.getElementById("defNote");if(!n)return;
  const lvl=S.defAll?"reset to level 0":`−${S.defLevels} level${S.defLevels===1?"":"s"}`;
  n.textContent=`Each defect currently costs −${S.defBits}% bits and ${lvl}.`;
}
function renderSetupNote(){
  const n=document.getElementById("setupNote");if(!n)return;
  const N=S.seasonSprints, wks=N*S.sprintWeeks;
  const months=(wks/4.345).toFixed(1).replace(/\.0$/,"");
  const bps=S.bobblesPerSprint.toFixed(1).replace(/\.0$/,"");
  n.textContent=`A season runs ${N} sprints (${wks} weeks, about ${months} months). `
    +`Level 12 and all 24 bobbleheads both land on sprint ${N}, so the season ends on a retro. `
    +`Under the hood: ${S.ptsPerLevel} points per level, ${bps} bobbleheads per sprint.`;
}
function syncSetupInputs(){
  const w=document.getElementById("sprintWeeks"),p=document.getElementById("avgPoints"),s=document.getElementById("seasonSprints");
  if(!w)return;w.value=S.sprintWeeks;p.value=S.avgPoints;s.value=S.seasonSprints;renderSetupNote();
}
