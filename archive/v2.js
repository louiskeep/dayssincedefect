/* ============================================================================
   Data Ops — v2 idle economy engine
   Two currencies: bits (idle, by the clock) and Sprint Points (manual, at retro).
   Bits accumulate from hired workers x decoration multipliers x permanent bonuses.
   Sprint Points hire workers. Shipping a defect takes 30% of your bits + resets
   the streak. All state in localStorage with a timestamp so bits catch up while
   the team is away.
   ============================================================================ */

const SAVE_KEY = "dataops.v2";
const MB = 1048576;                 // 1 Mb in bits (binary)
const DAY = 86400000;

/* ---- catalog ------------------------------------------------------------- */
// rates are Mb/s; converted to bits/s at use. First worker is hired free.
const WORKERS = [
  { id:"codereview", name:"Code Review",   icon:"🖥️", base:6, per:1.2, sp:0,   free:true, shirt:"#7a4b8c" },
  { id:"debugging",  name:"Debugging",     icon:"🐛", base:8, per:1.6, sp:60,  shirt:"#c76b2e" },
  { id:"dataentry",  name:"Data Entry",    icon:"⌨️", base:5, per:1.0, sp:90,  shirt:"#8c3a6b" },
  { id:"testing",    name:"Testing",       icon:"🧪", base:7, per:1.3, sp:120, shirt:"#3a7d5a" },
  { id:"sysadmin",   name:"Sysadmin",      icon:"🖧", base:7, per:1.4, sp:150, shirt:"#455565" },
  { id:"docs",       name:"Documentation", icon:"📄", base:4, per:0.9, sp:180, shirt:"#c7a83e" },
];
const STATION_BASE_COST = 24;       // Mb, per-worker upgrade base
const STATION_GROWTH = 1.17;

const DECOR = [
  { id:"plant",      name:"Potted Plant",       icon:"🪴", pct:1.0, base:20, icon2:"" },
  { id:"poster",     name:"Motivational Poster", icon:"🖼️", pct:1.0, base:16 },
  { id:"whiteboard", name:"Whiteboard",         icon:"📋", pct:1.5, base:26 },
  { id:"rack",       name:"Server Rack",        icon:"🗄️", pct:1.0, base:22 },
  { id:"snacks",     name:"Snack Bowl",         icon:"🍿", pct:0.5, base:12 },
  { id:"ducky",      name:"Desk Toy",           icon:"🦆", pct:0.5, base:10 },
  { id:"coffee",     name:"Coffee Maker",       icon:"☕", pct:2.0, base:40 },
];
const DECOR_GROWTH = 1.24;

// permanent multipliers earned by reaching a clean-streak length (kept forever)
const BONUSES = [
  { ms:  1*DAY, pct:5  }, { ms:  3*DAY, pct:10 }, { ms: 7*DAY, pct:15 },
  { ms: 14*DAY, pct:25 }, { ms: 30*DAY, pct:50 },
];
const SPRINT_DEFAULT_PTS = 50;

/* ---- state --------------------------------------------------------------- */
function fresh() {
  return {
    version:2, team:"The Data Team",
    now: Date.now(), lastTick: Date.now(), streakStart: Date.now(),
    bestStreakMs:0, resetCount:0,
    bits:0, sp:0, sprintsLogged:0,
    workers: { codereview:{ hired:true, level:1 } },   // Code Review starts hired
    decor: {},                                         // id -> level
    bonuses: [],                                       // claimed bonus ms thresholds
  };
}
let state = load() || fresh();
function load(){ try{ const r=localStorage.getItem(SAVE_KEY); return r?JSON.parse(r):null; }catch{ return null; } }
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch{} }

/* ---- economy ------------------------------------------------------------- */
function workerRateMbps(w){
  const st = state.workers[w.id];
  if(!st || !st.hired) return 0;
  return w.base + (st.level-1)*w.per;
}
function decorMult(){
  let pct=0;
  for(const d of DECOR){ const lv=state.decor[d.id]||0; pct += lv*d.pct; }
  return 1 + pct/100;
}
function bonusMult(){
  let pct=0; for(const b of BONUSES) if(state.bonuses.includes(b.ms)) pct+=b.pct;
  return 1 + pct/100;
}
function bitsPerSec(){
  let mbps=0; for(const w of WORKERS) mbps += workerRateMbps(w);
  return mbps*MB * decorMult() * bonusMult();
}
function stationCost(w){
  const lv = (state.workers[w.id]?.level)||1;
  return STATION_BASE_COST*MB * Math.pow(STATION_GROWTH, lv);
}
function decorCost(d){
  const lv = state.decor[d.id]||0;
  return d.base*MB * Math.pow(DECOR_GROWTH, lv);
}

const UNITS=["b","Kb","Mb","Gb","Tb","Pb","Eb"];
function fmt(bits){
  let u=0,n=Math.max(0,bits);
  while(n>=1024 && u<UNITS.length-1){ n/=1024; u++; }
  return (u===0? Math.floor(n) : n.toFixed(2))+" "+UNITS[u];
}
function fmtRate(bps){ return fmt(bps)+"/s"; }
function fmtDur(ms){
  const s=Math.floor(ms/1000); const d=Math.floor(s/86400), h=Math.floor(s%86400/3600),
    m=Math.floor(s%3600/60), ss=s%60;
  if(d>0) return `${d}d ${h}h ${m}m ${ss}s`;
  if(h>0) return `${h}h ${m}m ${ss}s`;
  return `${m}m ${ss}s`;
}

/* apply idle time: add bits for elapsed real seconds, claim any bonuses reached */
function advance(toMs){
  const dt = Math.max(0, toMs - state.lastTick)/1000;
  state.bits += bitsPerSec()*dt;
  state.lastTick = toMs;
  const streak = toMs - state.streakStart;
  if(streak > state.bestStreakMs) state.bestStreakMs = streak;
  for(const b of BONUSES){
    if(streak>=b.ms && !state.bonuses.includes(b.ms)){ state.bonuses.push(b.ms); toast(`Bonus unlocked: +${b.pct}% bits forever`); }
  }
}

/* ---- actions ------------------------------------------------------------- */
function hireWorker(w){
  const st = state.workers[w.id];
  if(st && st.hired) return;
  if(state.sp < w.sp){ toast(`Need ${w.sp} sprint points`); return; }
  state.sp -= w.sp;
  state.workers[w.id] = { hired:true, level:1 };
  save(); toast(`${w.name} hired!`); renderAll();
}
function upgradeStation(w){
  const cost = stationCost(w);
  if(state.bits < cost){ toast("Not enough bits yet"); return; }
  state.bits -= cost; state.workers[w.id].level++;
  save(); renderAll();
}
function buyDecor(d){
  const cost = decorCost(d);
  if(state.bits < cost){ toast("Not enough bits yet"); return; }
  state.bits -= cost; state.decor[d.id] = (state.decor[d.id]||0)+1;
  save(); renderAll();
}
function logSprint(){
  promptBox("Log sprint retro", "Sprint points earned this sprint (velocity / tickets closed):",
    SPRINT_DEFAULT_PTS, val=>{
      const pts = Math.max(0, Math.round(+val||0));
      state.sp += pts; state.sprintsLogged++;
      save(); toast(`+${pts} sprint points`); renderAll();
    });
}
function reportDefect(){
  confirmBox("Ship a defect?", "Takes 30% of your bits and resets the streak. Workers and upgrades stay.", ()=>{
    advance(Date.now());
    state.bits *= 0.7;
    state.streakStart = Date.now(); state.lastTick = Date.now(); state.resetCount++;
    save(); toast("Defect shipped. -30% bits, streak reset."); renderAll();
  });
}

/* ---- placeholder pixel worker (swap for Higgsfield art later) ------------- */
function avatarSVG(w, active){
  const skin="#e8b98e", hair="#3a2f28", chair="#20262e";
  return `<svg viewBox="0 0 66 78" width="66" height="78" shape-rendering="crispEdges">
    <rect x="16" y="30" width="34" height="34" rx="3" fill="${chair}"/>
    <rect x="22" y="34" width="22" height="24" rx="2" fill="${w.shirt}"/>
    <rect x="27" y="16" width="12" height="12" rx="2" fill="${skin}"/>
    <rect x="25" y="12" width="16" height="7" rx="2" fill="${hair}"/>
    <rect x="30" y="20" width="2" height="2" fill="#20242a"/><rect x="35" y="20" width="2" height="2" fill="#20242a"/>
    <rect x="44" y="36" width="18" height="14" rx="2" fill="#0d1b12" stroke="#2a3b30" stroke-width="1"/>
    <rect x="46" y="38" width="14" height="10" fill="${active?'#173':'#122'}"/>
    ${active?'<rect x="47" y="40" width="8" height="1" fill="#5f6"/><rect x="47" y="43" width="11" height="1" fill="#5f6"/>':''}
  </svg>`;
}

/* ---- render -------------------------------------------------------------- */
function renderHUD(){
  const now = Date.now();
  document.getElementById("timer").textContent = fmtDur(now - state.streakStart);
  document.getElementById("best").textContent = fmtDur(state.bestStreakMs);
  document.getElementById("resets").textContent = state.resetCount;
  document.getElementById("totalBits").textContent = fmt(state.bits);
  document.getElementById("bps").textContent = fmtRate(bitsPerSec());
  document.getElementById("sp").textContent = state.sp;
  // next bonus
  const streak = now - state.streakStart;
  const next = BONUSES.find(b=>!state.bonuses.includes(b.ms) && b.ms>streak)
            || BONUSES.find(b=>!state.bonuses.includes(b.ms));
  if(next){
    document.getElementById("nextBonus").textContent = fmtDur(Math.max(0,next.ms-streak));
    document.getElementById("nextBonusPct").textContent = `+${next.pct}% bits forever`;
  } else {
    document.getElementById("nextBonus").textContent = "ALL EARNED";
    document.getElementById("nextBonusPct").textContent = `+${Math.round((bonusMult()-1)*100)}% bits forever`;
  }
}
function renderScene(){
  const row = document.getElementById("workerRow");
  row.innerHTML = "";
  WORKERS.forEach(w=>{
    const st = state.workers[w.id];
    const hired = st && st.hired;
    const el = document.createElement("div");
    el.className = "worker" + (hired?"":" empty");
    const rate = hired ? fmtRate(workerRateMbps(w)*MB) : `HIRE · ${w.sp} SP`;
    el.innerHTML =
      `<div class="tag"><div class="role">${w.name}</div><div class="rate">${hired?"+"+rate:rate}</div></div>
       <div class="heart">${hired?"♥":"♡"}</div>
       <div class="avatar">${avatarSVG(w, hired)}</div>
       <div class="desk"></div>
       <div class="bar"><i style="width:${20+Math.random()*70}%"></i></div>`;
    if(!hired) el.querySelector(".tag").style.cursor="pointer",
      el.querySelector(".tag").addEventListener("click", ()=>hireWorker(w));
    row.appendChild(el);
  });
}
function renderStations(){
  const wrap = document.getElementById("stationCards");
  wrap.innerHTML = "";
  WORKERS.forEach(w=>{
    const st = state.workers[w.id];
    const card = document.createElement("div");
    card.className = "card";
    if(!st || !st.hired){
      card.innerHTML =
        `<div class="top"><div class="ico">${w.icon}</div>
           <div><div class="nm">${w.name}</div><div class="eff dim">not hired</div></div></div>
         <div class="buychip locked">Hire · ${w.sp} SP</div>`;
      card.querySelector(".buychip").addEventListener("click", ()=>hireWorker(w));
    } else {
      const cost = stationCost(w);
      const can = state.bits>=cost;
      card.innerHTML =
        `<div class="top"><div class="ico">${w.icon}</div>
           <div><div class="nm">${w.name}</div><div class="lv">Lv. ${st.level}</div></div></div>
         <div class="eff">+${w.per.toFixed(1)} Mb/s · now +${(workerRateMbps(w)).toFixed(1)} Mb/s</div>
         <div class="buychip ${can?'':'cant'}">${fmt(cost)}</div>`;
      card.querySelector(".buychip").addEventListener("click", ()=>upgradeStation(w));
    }
    wrap.appendChild(card);
  });
}
function renderDecor(){
  const wrap = document.getElementById("decorCards");
  wrap.innerHTML = "";
  DECOR.forEach(d=>{
    const lv = state.decor[d.id]||0;
    const cost = decorCost(d);
    const can = state.bits>=cost;
    const card = document.createElement("div");
    card.className="card";
    card.innerHTML =
      `<div class="top"><div class="ico">${d.icon}</div>
         <div><div class="nm">${d.name}</div><div class="lv">Lv. ${lv}</div></div></div>
       <div class="eff">+${d.pct}% all bits / lv</div>
       <div class="buychip ${can?'':'cant'}">${fmt(cost)}</div>`;
    card.querySelector(".buychip").addEventListener("click", ()=>buyDecor(d));
    wrap.appendChild(card);
  });
}
function renderAll(){ renderHUD(); renderScene(); renderStations(); renderDecor(); }

/* ---- data-stream sparkline ---------------------------------------------- */
const spark=[]; const sctx=()=>document.getElementById("dstream").getContext("2d");
function drawSpark(){
  const cv=document.getElementById("dstream"); const c=cv.getContext("2d");
  const W=cv.width,H=cv.height; c.clearRect(0,0,W,H);
  c.strokeStyle="#2a3b4a"; c.beginPath(); c.moveTo(0,H-1); c.lineTo(W,H-1); c.stroke();
  const max=Math.max(...spark,1);
  c.strokeStyle="#5cc1f8"; c.beginPath();
  spark.forEach((v,i)=>{ const x=i/(spark.length-1||1)*W, y=H-(v/max)*(H-4)-2; i?c.lineTo(x,y):c.moveTo(x,y); });
  c.stroke();
}

/* ---- toast + modal ------------------------------------------------------- */
let tT; function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("show");
  clearTimeout(tT); tT=setTimeout(()=>t.classList.remove("show"),1900); }
function openModal(){ document.getElementById("modal").classList.add("open"); }
function closeModal(){ document.getElementById("modal").classList.remove("open"); }
function confirmBox(title,sub,onYes){
  const b=document.getElementById("modalBox");
  b.innerHTML=`<h3>${title}</h3><p>${sub}</p><div class="row">
    <button class="pxbtn ghost" id="mNo">Cancel</button><button class="pxbtn red" id="mYes">Confirm</button></div>`;
  b.querySelector("#mNo").onclick=closeModal; b.querySelector("#mYes").onclick=()=>{closeModal();onYes();}; openModal();
}
function promptBox(title,sub,def,onOk){
  const b=document.getElementById("modalBox");
  b.innerHTML=`<h3>${title}</h3><p>${sub}</p><input id="mIn" type="number" value="${def}"><div class="row">
    <button class="pxbtn ghost" id="mNo">Cancel</button><button class="pxbtn green" id="mOk">Log it</button></div>`;
  b.querySelector("#mNo").onclick=closeModal;
  b.querySelector("#mOk").onclick=()=>{ const v=b.querySelector("#mIn").value; closeModal(); onOk(v); };
  openModal(); b.querySelector("#mIn").focus();
}

/* ---- loop + boot --------------------------------------------------------- */
function tick(){
  advance(Date.now());
  renderHUD();
  // cheap live updates for the card affordability colours every few ticks
  spark.push(bitsPerSec()); if(spark.length>80) spark.shift(); drawSpark();
  // animate worker progress bars
  document.querySelectorAll("#workerRow .bar i").forEach(i=>{ i.style.width=(15+Math.random()*80)+"%"; });
  save();
}
function boot(){
  advance(Date.now());                     // idle catch-up since last visit
  renderAll();
  setInterval(tick, 1000);
  document.getElementById("logSprint").onclick = logSprint;
  document.getElementById("reportDefect").onclick = reportDefect;
  document.getElementById("btnSave").onclick = ()=>{ save(); toast("Saved"); };
  document.getElementById("btnMult").onclick = ()=>toast(`x${decorMult().toFixed(2)} decor · x${bonusMult().toFixed(2)} bonus`);
}
document.addEventListener("DOMContentLoaded", boot);
