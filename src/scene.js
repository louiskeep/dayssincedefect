/* Scene rendering: everything that paints the current `S` onto the room and the
   two side panels. The HUD header, the hero + duck sprites, the prop images and
   their layout, and the bobblehead shelf + gear grid. State lives in state.js;
   this file only reads it and writes to the DOM. */

/* ---------- HUD header ---------- */
function renderHUD(){
  document.getElementById("count").textContent=fmtDur(Date.now()-S.start);
  document.getElementById("rec").textContent=`best ${S.best}d · ${S.screwups} defects`;
  document.getElementById("bits").textContent=fmtBits(S.bits);
  document.getElementById("rate").textContent=fmtBitsWord(bitsPerDay());
  const rm=document.getElementById("rateMod"),oc=ownedCount();
  if(rm){if(oc>0){rm.hidden=false;rm.textContent=`🎎 +${oc*10}%`;rm.title=`Each bobblehead adds +10% bits/day — ${oc} × 10%`;}else rm.hidden=true;}
  document.getElementById("gearhud").textContent=`${Math.min(S.level,12)}/12`;
  document.getElementById("lv").textContent=S.level;
  document.getElementById("lvVal").textContent=S.level;
  const [,name,stat]=LEVELS[S.level];
  document.getElementById("lvnote").textContent=S.level?`${name} · ${stat}`:name;
  const need=pointsToClear(S.level);
  document.getElementById("lvbar").style.width=(S.level>=12?100:Math.min(100,S.points/need*100))+"%";
  document.getElementById("col").textContent=`${ownedCount()}/24`;
  document.getElementById("colsub").textContent=`${ownedCount()} / 24`;
  document.getElementById("lblVend").textContent=ownedCount()>=24?"🎉 Shelf complete":`🥤 Buy a box · ${fmtBitsWord(spinCost())}`;
  updateBossBtn();
  if(typeof checkAchievements==="function")checkAchievements();
}

/* ---------- hero + duck sprites ---------- */
async function renderHero(fade){
  const url=await keyed(HERO[S.level]);
  const h=document.getElementById("hero");
  if(fade){h.style.opacity=0;setTimeout(()=>{h.src=url;h.style.opacity=1;},220);}
  else{h.src=url;h.style.opacity=1;}
  renderDuck();
}
/* debug-duck companion in the scene: appears at Lv 2, suits up at Lv 11 */
async function renderDuck(){
  const d=document.getElementById("duckProp");if(!d)return;
  if(S.level>=2){d.src=await keyed(S.level>=11?"prop-duck-suit.png":"prop-duck.png");d.hidden=false;
    d.classList.toggle("suit",S.level>=11);}
  else d.hidden=true;
}
async function loadProps(){
  document.getElementById("calProp").src=await keyed("prop-calendar.png");
  document.getElementById("vendImg").src=await keyed("prop-vending.png");
  document.getElementById("alarmProp").src=await keyed("prop-firealarm.png");
  document.getElementById("todoProp").src=await keyed("prop-todo.png");
  document.getElementById("fridgeProp").src=await keyed("prop-fridge.png");
}

/* ---------- prop layout registry ----------
   One place for where every interactive object sits, as percent-of-room bounding boxes
   (matches the placement tool at /bg-preview/place.html). applyPropLayout() writes these to the
   elements as inline left/top/width/height; the sprite fits inside via object-fit:contain. */
const PROP_POS={
  cal:   {x:4.5,  y:27.1, w:17.0, h:23.0},
  todo:  {x:28.0, y:43.2, w:27.0, h:23.0},
  alarm: {x:93.9, y:41.9, w:5.0,  h:9.0},
  vend:  {x:51.3, y:33.2, w:40.3, h:61.8},   /* swapped to the fridge's old spot */
  fridge:{x:16.0, y:35.6, w:24.0, h:52.0},   /* swapped to the vending machine's old spot */
  cookie:{x:1.5,  y:65.0, w:6.0,  h:6.0},
};
const PROP_EL={cal:"calProp",todo:"todoProp",alarm:"alarmProp",vend:"vendProp",fridge:"fridgeProp",cookie:"cookieProp"};
const PROP_LBL={cal:"lbl-cal",todo:"lbl-todo",alarm:"lbl-alarm",vend:"lbl-vend",fridge:"lbl-fridge",cookie:"lbl-cookie"};
function applyPropLayout(){
  for(const id in PROP_POS){
    const p=PROP_POS[id],el=document.getElementById(PROP_EL[id]);
    if(el){el.style.left=p.x+"%";el.style.top=p.y+"%";el.style.width=p.w+"%";el.style.height=p.h+"%";}
    const lbl=document.querySelector("."+PROP_LBL[id]);
    if(lbl){lbl.style.left=Math.max(8,Math.min(92,p.x+p.w/2))+"%";lbl.style.top=Math.max(2,p.y-4.5)+"%";}
  }
}

/* ---------- fortune-cookie prop art (the reveal flow lives in features.js) ---------- */
let cookieWhole="",cookieBroken="";
async function loadCookie(){
  cookieWhole=await keyed("prop-cookie.png");
  cookieBroken=await keyed("prop-cookie-broken.png");
  document.getElementById("cookieProp").src=cookieWhole;
  document.getElementById("cookieImg").src=cookieBroken;
}

/* ---------- bobblehead shelf (right panel) ---------- */
let slotEls=[];
function buildShelf(){
  const shelf=document.getElementById("shelf");shelf.innerHTML="";slotEls=[];
  for(let r=0;r<8;r++){
    const row=document.createElement("div");row.className="row";
    for(let c=0;c<3;c++){const cell=document.createElement("div");cell.className="slot";
      cell.innerHTML='<div class="ghost"></div>';row.appendChild(cell);slotEls.push(cell);}
    shelf.appendChild(row);
    const board=document.createElement("div");board.className="board";shelf.appendChild(board);
  }
}
async function renderShelf(){
  for(let i=0;i<24;i++){
    const cell=slotEls[i];
    if(S.owned[i]){
      if(!cell.querySelector("img")){const url=await keyed(`bob-${String(i+1).padStart(2,"0")}.png`);
        cell.innerHTML=`<img src="${url}" title="${BOB[i][0]}" alt="${BOB[i][0]}">`;
        cell.querySelector("img").addEventListener("click",()=>openCard(i,false));}
    } else if(!cell.querySelector(".ghost")){cell.innerHTML='<div class="ghost"></div>';}
  }
}

/* ---------- gear collection (level-up items, left panel) ---------- */
let gearEls=[];
function buildGear(){
  const g=document.getElementById("gearShelf");g.innerHTML="";gearEls=[];
  for(let n=1;n<=12;n++){const cell=document.createElement("div");cell.className="gcell";g.appendChild(cell);gearEls.push(cell);}
}
async function renderGear(){
  let unlocked=0;
  for(let n=1;n<=12;n++){const cell=gearEls[n-1];
    if(S.level>=n){unlocked++;
      if(!cell.classList.contains("on")){cell.classList.add("on");
        const url=await keyed(LEVELS[n][0]);
        cell.innerHTML=`<img src="${url}" title="${LEVELS[n][1]}" alt="${LEVELS[n][1]}">`;
        cell.onclick=()=>openGearCard(n);}
    } else if(!cell.querySelector(".lock")){cell.classList.remove("on");cell.onclick=null;
      cell.innerHTML=`<div class="lock"><b>🔒</b>Lv ${n}</div>`;}
  }
  document.getElementById("gearsub").textContent=`${unlocked} / 12`;
}
async function openGearCard(n){
  const [,name,stat]=LEVELS[n];
  const url=await keyed(LEVELS[n][0]);
  document.getElementById("cardBox").innerHTML=
    `<div class="card-head"><span class="card-no">Lv ${n} / 12</span><h3>${name}</h3></div>
     <div class="card-art"><img src="${url}" alt="${name}"></div>
     <div class="card-skill">${stat||"Unlocked"}</div>
     <p class="card-line">"${GEARLINE[n-1]}"</p>
     <button class="btn" id="cardClose">Nice</button>`;
  document.getElementById("cardBox").querySelector("#cardClose").onclick=()=>close("cardModal");
  open("cardModal");
}
