/* Modal helpers and the two core action dialogs: log a sprint (plants
   flowers + ticks growth) and report a defect (a pest event). Also the
   season-config settings sync. open()/close() toggle the .open class. */

const open=id=>document.getElementById(id).classList.add("open");
const close=id=>document.getElementById(id).classList.remove("open");

/* ---------- log a sprint ---------- */
function openLog(){
  document.getElementById("logNeed").textContent=nextFlowerIdx()>=FLOWERS.length?
    "All flowers are planted, points still count toward the record.":
    `${Math.max(0,S.pointsPerFlower-S.points)} pts to the next flower`;
  open("logModal");
}
function doLog(){
  const n=Math.max(1,Math.min(999,parseInt(document.getElementById("ptInput").value)||0));
  S.points+=n;
  S.sprintsLogged=(S.sprintsLogged||0)+1;
  S.seasonPoints=(S.seasonPoints||0)+n;
  const planted=plantFlowers();
  tickGrowth();
  save();close("logModal");accrue();fullRender();
  if(planted.length)showReveal(planted[planted.length-1],"flower");
  if(isFullBloom())showFullBloom();
}

/* ---------- tend the garden (plant next tree) ---------- */
function doTend(){
  accrue();
  const name=tendGarden();
  save();fullRender();
  if(name)showReveal(name,"tree");
  if(isFullBloom())showFullBloom();
}

/* ---------- report a defect (pest event) ---------- */
function openDefect(){
  const growing=S.plants.filter(p=>p.level<3).length;
  document.getElementById("defectLose").textContent=growing?
    `A pest gets into the garden: your ${growing} still-growing plant${growing===1?"":"s"} skip${growing===1?"s":""} their next growth cycle. No points or bits lost.`:
    "A pest shows up, but every plant is already fully grown, nothing to skip.";
  open("defectModal");
}
function doDefect(){
  const hit=applyPestEvent();
  S.screwups++;
  save();close("defectModal");fullRender();
  pestFx(hit);
}
function pestFx(hit){
  const bed=document.getElementById("bed");if(!bed)return;
  const el=document.createElement("div");el.className="fxpop";el.textContent=hit?`🐛 ${hit} plant${hit===1?"":"s"} stunted`:"🐛 no growing plants to stunt";
  bed.appendChild(el);setTimeout(()=>el.remove(),1900);
}

/* ---------- reveal + full bloom ---------- */
function showReveal(name,tier){
  document.getElementById("trophyBox").innerHTML=
    `<div class="trophy-emoji">${tier==="tree"?"🌳":"🌱"}</div>
     <h2>${tier==="tree"?"A tree took root!":"Something bloomed!"}</h2>
     <p>${name}</p>
     <button class="btn green" id="trophyClose">Nice</button>`;
  document.getElementById("trophyBox").querySelector("#trophyClose").onclick=()=>close("trophyModal");
  open("trophyModal");
}
function showFullBloom(){
  document.getElementById("recapBody").innerHTML=
    `<p><b>${S.plants.length}/${FLOWERS.length+TREES.length}</b> species, all at level 3</p>
     <p><b>${S.seasonPoints||0}</b> sprint points across <b>${S.sprintsLogged||0}</b> sprints</p>
     <p><b>${S.screwups}</b> pest event${S.screwups===1?"":"s"}</p>`;
  open("recapModal");
}
function newSeason(){
  const keep={sprintWeeks:S.sprintWeeks,avgPoints:S.avgPoints,seasonSprints:S.seasonSprints,baseTreeCost:S.baseTreeCost};
  S=defState();Object.assign(S,keep);applySeasonConfig();S.seasonStart=Date.now();
  save();close("recapModal");fullRender();
}

/* ---------- settings sync ---------- */
function syncSetupInputs(){
  const w=document.getElementById("sprintWeeks"),p=document.getElementById("avgPoints"),s=document.getElementById("seasonSprints");
  if(!w)return;w.value=S.sprintWeeks;p.value=S.avgPoints;s.value=S.seasonSprints;
  const n=document.getElementById("setupNote");
  if(n)n.textContent=`${S.pointsPerFlower} points per flower, ${fmtBitsWord(treeCost())} for the next tree.`;
}
