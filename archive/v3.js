/* ============================================================================
   Days Since Last Screwup — v3 engine
   Sprint points drive levels; each level unlocks a character; each character
   doubles bits/day; bits spin a no-duplicates chest of 60 cosmetics; level 20
   fights the Defect Dragon. See screwup-game-spec-v3.md.
   ============================================================================ */
const SAVE_KEY = "screwup.v3";
const BOSS_LEVEL = 20, POOL = 60;

/* ---- roster (placeholder emoji; Higgsfield stickers later) --------------- */
const ROSTER = [
  ["gnome","Norm","Gnome","🧝","#2f9e8f"], ["dog","Goodboy","Dog","🐶","#c98a4e"],
  ["caveman","Grok","Caveman","🦴","#b98a5a"], ["coder","Stack","Programmer","👨‍💻","#5b6b7d"],
  ["pm","Gantt","PM","📋","#3f78c4"], ["robot","Cron","Robot","🤖","#9aa6b2"],
  ["knight","Sir Query","Knight","⚔️","#8a5f38"], ["alien","Null","Alien","👽","#6fce7a"],
  ["wizard","Merlint","Wizard","🧙","#6b46c1"], ["cat","Pixel","Cat","🐱","#e0954e"],
  ["penguin","Sudo","Penguin","🐧","#33475a"], ["ghost","Blip","Ghost","👻","#b7c1cc"],
  ["bear","Biscuit","Bear","🐻","#a9764a"], ["fox","Vector","Fox","🦊","#e07b3a"],
  ["owl","Quill","Owl","🦉","#8a6a44"], ["automaton","Sprocket","Automaton","⚙️","#b0895a"],
  ["barista","Mocha","Barista","☕","#7a4b2e"], ["axolotl","Kelp","Axolotl","🐟","#e79ac0"],
  ["mushroom","Bramble","Mushroom-Folk","🍄","#c0483d"], ["astronaut","Comet","Astronaut","🧑‍🚀","#4a5aa0"],
].map(([id,name,kind,e,c])=>({id,name,kind,e,c}));

/* ---- chest pool: 60 cosmetics across 5 slots ----------------------------- */
const SLOTS = {
  hat:    "🎩 👑 ⛑️ 🎉 🧢 🎓 👒 🤠 🪖 🥳 🎃 🪅".split(" "),
  outfit: "🧥 🥼 🦸 🦹 🧣 👔 🎽 🥋 👘 🦺 🩱 🥻".split(" "),
  prop:   "☕ 💻 🦆 📎 🎈 🔦 📖 🍕 🎮 🪀 🎸 🔧".split(" "),
  skin:   "✨ 🌈 🔥 ⚡ 🌟 💎 🍀 ❄️ 🌸 💫 🫧 🎇".split(" "),
  decor:  "🪴 🖼️ 🕯️ 🗄️ 🍿 🏆 📊 🎏 🪩 🧸 🕹️ 🛋️".split(" "),
};
const POOL_ITEMS = [];
for (const slot in SLOTS) SLOTS[slot].forEach((e,i)=>POOL_ITEMS.push({ id:`${slot}${i}`, slot, e }));

/* exclusive circus prizes (won at the fair, not in the 60-item chest pool) */
const CIRCUS_ITEMS = [
  ["cc0","hat","🎩"],["cc1","hat","🎀"],["cc2","hat","🎭"],["cc3","prop","🍭"],
  ["cc4","prop","🎈"],["cc5","prop","🧸"],["cc6","prop","🪅"],["cc7","skin","🤡"],
  ["cc8","skin","🎪"],["cc9","prop","🃏"],
].map(([id,slot,e])=>({id,slot,e,circus:true}));

const ITEM = id => POOL_ITEMS.find(x=>x.id===id) || CIRCUS_ITEMS.find(x=>x.id===id);

/* ---- math ---------------------------------------------------------------- */
const cumSP = L => (L-1)*(38+L);          // SP needed to reach level L
const clearCost = L => 38 + 2*L;          // SP to advance (L1=40, L2=42, … L19=76)
function levelFromSP(sp){ let L=1; while(L<BOSS_LEVEL && sp>=cumSP(L+1)) L++; return L; }
const bitsPerDay = L => Math.pow(2, L);                 // base production (no streak)
/* clean-streak bonus: 7d ×1.1, 14d ×1.2, 21d+ ×1.3 (resets on a defect) */
function streakWeeks(){ return Math.floor((Date.now()-state.screwupStart)/(7*86400000)); }
function streakMult(){ return 1 + 0.1*Math.min(streakWeeks(),3); }
function production(){ return bitsPerDay(level()) * streakMult(); }   // actual bits/day earned
/* chest priced on BASE production, so it always costs a set number of days of
   output (a clean streak buys you more spins, not fewer). rises with the pool. */
function spinCost(){ return Math.ceil(bitsPerDay(level()) * (1.5 + 0.15*state.inventory.length)); }

const UNITS=["b","Kb","Mb","Gb","Tb","Pb"];
function fmt(n){ let u=0,x=Math.max(0,n); while(x>=1024&&u<UNITS.length-1){x/=1024;u++;} return (u===0?Math.floor(x):x.toFixed(2))+" "+UNITS[u]; }
function fmtDur(ms){ const s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),ss=s%60;
  return `${d}d ${h}h ${m}m ${ss}s`; }

/* ---- state --------------------------------------------------------------- */
function fresh(){
  const now=Date.now();
  return { version:3, team:"The Data Team", spTotal:0, sprintsLogged:0,
    lastTick:now, bits:0, spins:0, inventory:[], equip:{}, // equip[charId]={hat,outfit,prop,skin}
    tickets:0, ticketsLogged:0, circusPrizes:[], circusPlays:0,
    screwupStart:now, bestStreakMs:0, resetCount:0, prestige:0, history:[], bossBeaten:false };
}
let state = load() || fresh();
function load(){ try{ const r=localStorage.getItem(SAVE_KEY); return r?JSON.parse(r):null; }catch{ return null; } }
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch{} }

function level(){ return levelFromSP(state.spTotal); }
function crewSize(){ return level(); }                 // one character per level

/* accrue bits for elapsed real time at current rate */
function accrue(){
  const now=Date.now(), dt=Math.max(0, now-state.lastTick)/1000;
  state.bits += production() * dt/86400;
  state.lastTick = now;
  const streak = now-state.screwupStart;
  if(streak>state.bestStreakMs) state.bestStreakMs=streak;
}

/* ---- actions ------------------------------------------------------------- */
function logSprint(){
  const b=document.getElementById("modalBox");
  b.innerHTML=
    `<h3>Log sprint retro</h3><p>Enter what the team finished this sprint.</p>
     <div class="slotgrp"><h4>Sprint points completed</h4><input id="inPts" type="number" value="50"></div>
     <div class="slotgrp"><h4>Tickets completed (5-25) 🎟️</h4><input id="inTix" type="number" value="15"></div>
     <div class="row"><button class="btn ghost" id="mNo">Cancel</button><button class="btn green" id="mOk">Log it</button></div>`;
  b.querySelector("#mNo").onclick=closeModal;
  b.querySelector("#mOk").onclick=()=>{
    const pts=Math.max(0,Math.round(+b.querySelector("#inPts").value||0));
    const tix=Math.max(0,Math.round(+b.querySelector("#inTix").value||0));
    closeModal();
    const before=level();
    state.spTotal+=pts; state.sprintsLogged++;
    state.tickets+=tix; state.ticketsLogged+=tix;
    const after=level();
    save(); renderAll();
    if(after>before){
      for(let L=before+1; L<=after; L++) popMate(L-1);
      toast(`Level ${after}! New crewmate +100% → ${fmt(bitsPerDay(after))} / day · +${tix}🎟️`);
    } else toast(`+${pts} points · +${tix} tickets 🎟️`);
    if(after>=BOSS_LEVEL) showBoss();
  };
  openModal(); b.querySelector("#inPts").select();
}
function spin(){
  if(state.inventory.length>=POOL){ toast("Collection complete!"); return; }
  const cost=spinCost();
  if(state.bits<cost){ toast(`Need ${fmt(cost)} to spin`); return; }
  state.bits-=cost; state.spins++;
  const pool=POOL_ITEMS.filter(it=>!state.inventory.includes(it.id));
  const item=pool[Math.floor(Math.random()*pool.length)];
  state.inventory.push(item.id);
  save(); renderAll();
  revealItem(item);
}
function reportDefect(){
  confirmBox("Report a defect?","Takes 30% of your bits and resets the counter. Your level and crew are safe.", ()=>{
    accrue();
    state.bits*=0.7; state.screwupStart=Date.now(); state.lastTick=Date.now(); state.resetCount++;
    state.history.push({ date:new Date().toISOString().slice(0,10), type:"defect" });
    save(); renderAll(); toast("Defect logged. Counter reset, collection safe.");
  });
}

/* ---- Circus: the Prize Wheel --------------------------------------------- */
const WHEEL = [
  { label:"+1×",     kind:"bits",   mult:1, col:"#37c06a" },
  { label:"+3×",     kind:"bits",   mult:3, col:"#2f9bff" },
  { label:"PRIZE",   kind:"prize",          col:"#9b6cff" },
  { label:"+1×",     kind:"bits",   mult:1, col:"#37c06a" },
  { label:"+8×",     kind:"bits",   mult:8, col:"#ffb02e" },
  { label:"🎟️ BACK", kind:"refund",         col:"#ff77c2" },
];
let wheelRot = 0;
function openCircus(){
  const N=WHEEL.length, seg=360/N;
  const grad = WHEEL.map((w,i)=>`${w.col} ${i*seg}deg ${(i+1)*seg}deg`).join(",");
  const labels = WHEEL.map((w,i)=>{
    const c=i*seg+seg/2;
    return `<span class="seg" style="transform:rotate(${c}deg) translate(0,-96px) rotate(90deg)">${w.label}</span>`;
  }).join("");
  const b=document.getElementById("modalBox");
  b.innerHTML=
    `<h3>🎪 The Circus</h3>
     <p>You have <span class="tix-cnt" id="cTix">${state.tickets}</span> 🎟️ · 1 ticket a spin</p>
     <div class="wheel-wrap">
       <div class="ptr">🔻</div>
       <div class="wheel" id="wheel" style="background:conic-gradient(${grad})">${labels}</div>
       <div class="hub"></div>
     </div>
     <div id="cResult" style="min-height:1.4em;font-weight:800;color:var(--purple)">Give it a spin!</div>
     <div class="row"><button class="btn ghost" id="cDone">Leave</button>
       <button class="btn amber" id="cSpin">Spin · 1🎟️</button></div>`;
  document.getElementById("wheel").style.transform=`rotate(${wheelRot}deg)`;
  b.querySelector("#cDone").onclick=closeModal;
  b.querySelector("#cSpin").onclick=spinWheel;
  openModal();
}
function spinWheel(){
  if(state.tickets<1){ toast("No tickets. Log a sprint to earn some."); return; }
  const btn=document.getElementById("cSpin"); if(btn.disabled) return; btn.disabled=true;
  state.tickets--; state.circusPlays++; document.getElementById("cTix").textContent=state.tickets;
  const N=WHEEL.length, seg=360/N;
  let i=Math.floor(Math.random()*N);
  // if PRIZE but all prizes owned, reroll to a bits slot
  if(WHEEL[i].kind==="prize" && state.circusPrizes.length>=CIRCUS_ITEMS.length) i=0;
  const center=i*seg+seg/2;
  wheelRot += 360*5 + ((360 - (wheelRot%360)) + (360 - center))%360;
  document.getElementById("wheel").style.transform=`rotate(${wheelRot}deg)`;
  setTimeout(()=>{ applyReward(WHEEL[i]); save(); renderBoard();
    document.getElementById("cTix").textContent=state.tickets; btn.disabled=false; }, 3500);
}
function applyReward(r){
  const res=document.getElementById("cResult"); let msg="";
  if(r.kind==="bits"){ const amt=Math.max(1,Math.round(bitsPerDay(level())*r.mult)); state.bits+=amt; msg=`+${fmt(amt)} bits!`; }
  else if(r.kind==="refund"){ state.tickets++; msg="Ticket refunded! 🎟️"; }
  else if(r.kind==="prize"){
    const pool=CIRCUS_ITEMS.filter(it=>!state.circusPrizes.includes(it.id));
    if(pool.length){ const it=pool[Math.floor(Math.random()*pool.length)]; state.circusPrizes.push(it.id);
      msg=`Circus prize won: ${it.e} (dress a crewmate with it!)`; renderCrew(); }
    else { const amt=Math.round(bitsPerDay(level())*3); state.bits+=amt; msg=`Prizes maxed → +${fmt(amt)} bits!`; }
  }
  if(res) res.textContent=msg; toast(msg);
}

/* ---- dress-up ------------------------------------------------------------ */
function openDress(char){
  const eq = state.equip[char.id] || {};
  const grp = slot => {
    const owned = state.inventory.concat(state.circusPrizes).map(ITEM).filter(it=>it&&it.slot===slot);
    const chips = [`<button class="chip none ${!eq[slot]?"on":""}" data-slot="${slot}" data-id="">none</button>`]
      .concat(owned.map(it=>`<button class="chip ${eq[slot]===it.id?"on":""}" data-slot="${slot}" data-id="${it.id}">${it.e}</button>`));
    return `<div class="slotgrp"><h4>${slot}</h4><div class="chips">${chips.join("")}</div></div>`;
  };
  const box=document.getElementById("modalBox");
  box.innerHTML =
    `<h3>${char.e} ${char.name}</h3><p class="dim">${char.kind}</p>
     ${["hat","outfit","prop","skin"].map(grp).join("")}
     <div class="row"><button class="btn" id="mDone">Done</button></div>`;
  box.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>{
    state.equip[char.id]=state.equip[char.id]||{};
    state.equip[char.id][c.dataset.slot]=c.dataset.id||null;
    save(); renderCrew(); openDress(char);
  }));
  box.querySelector("#mDone").onclick=closeModal;
  openModal();
}

/* ---- boss ---------------------------------------------------------------- */
function showBoss(){ document.getElementById("bossBanner").classList.add("show"); }
function fight(){
  const fightEl=document.getElementById("fight"), arena=document.getElementById("fightArena");
  arena.innerHTML=`<div class="dragon">🐉</div>
    <div class="disp" style="font-size:1.6em;margin-top:10px">The crew lets fly!</div>
    <div class="throng" id="throng"></div>`;
  fightEl.classList.add("show");
  const crew=ROSTER.slice(0,crewSize());
  document.getElementById("throng").textContent=crew.map(c=>c.e).join(" ");
  // hurl every collected item at the dragon
  const ammo=state.inventory.map(ITEM);
  let i=0;
  const timer=setInterval(()=>{
    if(i>=ammo.length || i>28){ clearInterval(timer); setTimeout(winScreen, 700); return; }
    throwProjectile(ammo[i%ammo.length].e); i++;
  }, 90);
}
function throwProjectile(e){
  const p=document.createElement("div"); p.className="projectile"; p.textContent=e;
  p.style.left=(10+Math.random()*80)+"vw"; p.style.top="80vh";
  document.body.appendChild(p);
  requestAnimationFrame(()=>{ p.style.transition="all .6s ease-in"; p.style.top="34vh"; p.style.opacity="0"; });
  setTimeout(()=>p.remove(),650);
}
function winScreen(){
  confettiBurst();
  const arena=document.getElementById("fightArena");
  arena.innerHTML=`<div style="font-size:5em">💥</div>
    <h1 class="disp" style="color:#ffd84a;margin:0">VICTORY!</h1>
    <p style="color:#fff;opacity:.9">The Defect Dragon is defeated.</p>
    <div style="color:#fff;font-weight:800;line-height:1.8">
      Sprint points earned: ${state.spTotal}<br>
      Tickets completed: ${state.ticketsLogged} 🎟️<br>
      Best clean streak: ${fmtDur(state.bestStreakMs)}<br>
      Screwups survived: ${state.resetCount}<br>
      Chest collection: ${state.inventory.length} / ${POOL}<br>
      Circus prizes: ${state.circusPrizes.length} / ${CIRCUS_ITEMS.length}<br>
      Sprints: ${state.sprintsLogged} · Circus plays: ${state.circusPlays}</div>
    <div class="row" style="justify-content:center;margin-top:16px">
      <button class="btn amber" id="newSeason">Start a new season</button>
      <button class="btn ghost" id="closeFight">Bask in glory</button></div>`;
  state.bossBeaten=true; save();
  arena.querySelector("#closeFight").onclick=()=>document.getElementById("fight").classList.remove("show");
  arena.querySelector("#newSeason").onclick=()=>{
    state.prestige++; state.spTotal=0; state.bits=0; state.spins=0; state.screwupStart=Date.now();
    state.lastTick=Date.now(); state.bossBeaten=false; state.resetCount=0; state.bestStreakMs=0;
    state.tickets=0; state.ticketsLogged=0; state.circusPlays=0;
    // keep inventory + circusPrizes + equip + prestige as the trophy of the season
    save(); document.getElementById("fight").classList.remove("show");
    document.getElementById("bossBanner").classList.remove("show"); renderAll(); toast("New season! The crew resets, your collection stays.");
  };
}

/* ---- render -------------------------------------------------------------- */
function renderBoard(){
  document.getElementById("count").innerHTML=`<small>Days since last screwup</small>${fmtDur(Date.now()-state.screwupStart)}`;
  document.getElementById("best").textContent=fmtDur(state.bestStreakMs).split(" ")[0];
  document.getElementById("resets").textContent=state.resetCount;
  const L=level();
  document.getElementById("level").textContent=L;
  const into=state.spTotal-cumSP(L), need=clearCost(L);
  document.getElementById("lvBar").style.width=(L>=BOSS_LEVEL?100:Math.min(100,into/need*100))+"%";
  document.getElementById("lvNote").textContent = L>=BOSS_LEVEL ? "MAX · boss ready" : `${Math.max(0,need-into)} pts to level ${L+1}`;
  document.getElementById("bits").textContent=fmt(state.bits);
  document.getElementById("rate").textContent=fmt(production())+" / day";
  const sm=streakMult();
  document.getElementById("multNote").textContent=`${L} crew ×2 · streak ×${sm.toFixed(1)}`;
  document.getElementById("streakMult").textContent=`×${sm.toFixed(1)}`;
  document.getElementById("spinCost").textContent = state.inventory.length>=POOL ? "done" : fmt(spinCost());
  document.getElementById("tix").textContent=state.tickets;
  document.getElementById("crewCount").textContent=`${L} / 20 hired`;
  const pw=document.getElementById("prestigeWrap");
  if(state.prestige>0){ pw.hidden=false; document.getElementById("prestige").textContent=state.prestige; }
  if(L>=BOSS_LEVEL && !state.bossBeaten) showBoss();
}
function renderCrew(){
  const wrap=document.getElementById("crew"); wrap.innerHTML="";
  const L=level();
  ROSTER.forEach((c,idx)=>{
    const hired=idx<L;
    const el=document.createElement("div");
    el.className="cmate"+(hired?"":" locked"); el.dataset.idx=idx;
    if(hired){
      const eq=state.equip[c.id]||{};
      const aura=eq.skin?ITEM(eq.skin).e:"";
      el.innerHTML=
        `<span class="mult-badge" title="Each crewmate doubles bit production">+100%</span>
         ${eq.hat?`<span class="badge-slot b-hat">${ITEM(eq.hat).e}</span>`:""}
         ${eq.outfit?`<span class="badge-slot b-outfit">${ITEM(eq.outfit).e}</span>`:""}
         ${eq.prop?`<span class="badge-slot b-prop">${ITEM(eq.prop).e}</span>`:""}
         <div class="disc ${aura?"aura":""}" data-aura="${aura}" style="background:${c.c}">${c.e}</div>
         <div class="nm">${c.name}</div><div class="kd">${c.kind}</div>`;
      el.addEventListener("click",()=>openDress(c));
    } else {
      el.innerHTML=`<div class="disc">🔒</div><div class="nm">Lv ${idx+1}</div><div class="kd">locked</div>`;
    }
    wrap.appendChild(el);
  });
}
function popMate(idx){ const el=document.querySelector(`.cmate[data-idx="${idx}"]`); if(el) el.classList.add("pop"); }
function renderCollection(){
  document.getElementById("colCount").textContent=`${state.inventory.length} / ${POOL}`;
  document.getElementById("colBar").style.width=(state.inventory.length/POOL*100)+"%";
  const decor=state.inventory.map(ITEM).filter(it=>it.slot==="decor");
  document.getElementById("trophies").innerHTML=decor.map(it=>`<span>${it.e}</span>`).join("");
}
function renderAll(){ renderBoard(); renderCrew(); renderCollection(); }

/* ---- modals / toast / fx ------------------------------------------------- */
let tT; function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(tT); tT=setTimeout(()=>t.classList.remove("show"),2000); }
function openModal(){ document.getElementById("modal").classList.add("open"); }
function closeModal(){ document.getElementById("modal").classList.remove("open"); }
function confirmBox(t,s,onYes){ const b=document.getElementById("modalBox");
  b.innerHTML=`<h3>${t}</h3><p>${s}</p><div class="row"><button class="btn ghost" id="mNo">Cancel</button><button class="btn red" id="mYes">Confirm</button></div>`;
  b.querySelector("#mNo").onclick=closeModal; b.querySelector("#mYes").onclick=()=>{closeModal();onYes();}; openModal(); }
function promptBox(t,s,def,onOk){ const b=document.getElementById("modalBox");
  b.innerHTML=`<h3>${t}</h3><p>${s}</p><input id="mIn" type="number" value="${def}"><div class="row"><button class="btn ghost" id="mNo">Cancel</button><button class="btn green" id="mOk">Log it</button></div>`;
  b.querySelector("#mNo").onclick=closeModal; b.querySelector("#mOk").onclick=()=>{const v=b.querySelector("#mIn").value; closeModal(); onOk(v);}; openModal(); b.querySelector("#mIn").select(); }
function revealItem(item){ const b=document.getElementById("modalBox");
  b.innerHTML=`<h3>New loot!</h3><div class="reveal-item">${item.e}</div><p>A fresh ${item.slot} for the crew · ${state.inventory.length}/${POOL} collected</p>
    <div class="row"><button class="btn green" id="mOk">Nice</button></div>`;
  b.querySelector("#mOk").onclick=closeModal; openModal(); }
function confettiBurst(){ const w=document.createElement("div"); w.className="confetti";
  const cs=["#ff5c52","#ffb02e","#37c06a","#2f9bff","#9b6cff","#ff77c2"];
  for(let i=0;i<90;i++){ const s=document.createElement("i"); s.style.left=Math.random()*100+"vw"; s.style.background=cs[i%cs.length];
    s.style.animationDelay=Math.random()*.6+"s"; w.appendChild(s); } document.body.appendChild(w); setTimeout(()=>w.remove(),2600); }

/* ---- sandbox (gear) ------------------------------------------------------ */
function openGear(){ const b=document.getElementById("modalBox");
  b.innerHTML=`<h3>⚙️ Sandbox</h3><p>Dev helpers for testing.</p>
    <div class="row"><button class="btn green" id="g50">+50 SP</button><button class="btn purple" id="gbits">+1 Mb bits</button></div>
    <div class="row"><button class="btn amber" id="gtix">+20 🎟️</button><button class="btn" id="gboss">Jump to boss</button></div>
    <div class="row"><button class="btn red" id="greset">Reset</button></div>
    <div class="row"><button class="btn ghost" id="mDone">Close</button></div>`;
  b.querySelector("#g50").onclick=()=>{ state.spTotal+=50; save(); renderAll(); };
  b.querySelector("#gbits").onclick=()=>{ state.bits+=1048576; save(); renderAll(); };
  b.querySelector("#gtix").onclick=()=>{ state.tickets+=20; state.ticketsLogged+=20; save(); renderAll(); };
  b.querySelector("#gboss").onclick=()=>{ state.spTotal=cumSP(BOSS_LEVEL); save(); renderAll(); showBoss(); closeModal(); };
  b.querySelector("#greset").onclick=()=>{ if(confirm("Reset everything?")){ state=fresh(); save(); location.reload(); } };
  b.querySelector("#mDone").onclick=closeModal; openModal(); }

/* ---- boot ---------------------------------------------------------------- */
function boot(){
  // migrate older saves that predate tickets/circus
  if(state.tickets===undefined) state.tickets=0;
  if(state.ticketsLogged===undefined) state.ticketsLogged=0;
  if(state.circusPrizes===undefined) state.circusPrizes=[];
  if(state.circusPlays===undefined) state.circusPlays=0;
  accrue();                       // catch up bits since last visit
  renderAll();
  setInterval(()=>{ accrue(); renderBoard(); save(); }, 1000);
  document.getElementById("logSprint").onclick=logSprint;
  document.getElementById("spin").onclick=spin;
  document.getElementById("circus").onclick=openCircus;
  document.getElementById("defect").onclick=reportDefect;
  document.getElementById("fightBtn").onclick=fight;
  document.getElementById("gear").onclick=openGear;
}
document.addEventListener("DOMContentLoaded", boot);
