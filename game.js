/* Days Since Defect — break room game logic.
   Props in the scene drive the three actions; state persists in localStorage. */

/* technomancer ladder: [gear-panel/card art (tech sprite), name, joke stat]. */
const LEVELS = [
  ["tech-00.png","The Coder",""],
  ["tech-01.png","Ergonomic exo-suit","+3 Posture"],
  ["tech-02.png","Debug Duck","+6 Insight"],
  ["tech-03.png","Watch","+4 Punctuality"],
  ["tech-04.png","Magic blue-light glasses","+8 Alertness"],
  ["tech-05.png","Earbuds","+9 Deep Work"],
  ["tech-06.png","Cold-brew IV","+12 Uptime"],
  ["tech-07.png","Spellbook","+15 Compute"],
  ["tech-08.png","Rune-etched chrome arm","+30 Grip"],
  ["tech-09.png","Triple monitor array","+11 Multitasking"],
  ["tech-10.png","Wizard cloak","+13 Arcana"],
  ["tech-11.png","Duck power suit","+25 Firepower"],
  ["prop-keycard.png","Access Keycard","+∞ Clearance"],
];
/* the character sprite shown IN THE ROOM per level. Lv 2 (duck), Lv 11 (duck suit) and Lv 12
   (keycard) do not change the human, so the hero holds at the wizard-cloak form. */
const HERO=["tech-00.png","tech-01.png","tech-01.png","tech-03.png","tech-04.png","tech-05.png",
  "tech-06.png","tech-07.png","tech-08.png","tech-09.png","tech-10.png","tech-10.png","tech-10.png"];
const BOB = [
  ["The Boss","+5 Synergy","Let's take this offline. And also online. And into a meeting."],
  ["The Intern","+3 Enthusiasm","Cc'd on everything. Understands none of it. Thriving."],
  ["The Sales Shark","+8 Charisma","Just circling back to circle back on the circle back."],
  ["The IT Guy","+7 Uptime","The ticket says 'urgent.' They all say 'urgent.'"],
  ["The HR Rep","+6 Diplomacy","This is a safe space. Also, this is being recorded."],
  ["The CEO","+10 Vision","We're not downsizing, we're right-sizing the family."],
  ["The Accountant","+9 Precision","I found the missing cent. It cost us four hours."],
  ["The Creative","+7 Aesthetic","Can we make the logo bigger, but also smaller?"],
  ["The Coffee Fiend","+12 Alertness","I can hear colors now. Deploy on Friday, sure."],
  ["The Remote Worker","+5 Flexibility","That's not me typing, that's my cat standing on the keyboard again."],
  ["The Scrum Master","+9 Focus","You really don't hit your stride until your 3rd standup of the day."],
  ["The Overachiever","+10 Hustle","PTO stands for Probably Typing, Obviously."],
  ["The Slacker","+6 Chill","Reply-all is the only cardio I do."],
  ["The Consultant","+9 Buzzwords","Let's leverage our core competencies to move the needle."],
  ["The Security Guard","+7 Vigilance","Badge? I don't care if you're the CEO. Badge."],
  ["The Receptionist","+8 Awareness","I know where everyone is. Always. Sleep well."],
  ["The Data Nerd","+11 Insight","Give me enough dimensions and I'll prove anything you want."],
  ["The DevOps Firefighter","+10 Resilience","3am page, no problem. It's always the DNS."],
  ["The Product Manager","+8 Roadmapping","It's not a bug we didn't want, it's a feature we didn't know we needed."],
  ["The QA Tester","+9 Scrutiny","I found 47 bugs. You're welcome. And I'm sorry."],
  ["The Marketing Guru","+8 Reach","Let's make it go viral. Organically. By Friday."],
  ["The Facilities Legend","+10 Fixit","Duct tape, WD-40, and zero questions asked."],
  ["The Founder-Bro","+7 Grindset","Ramen profitable, emotionally bankrupt."],
  ["The Office Veteran","+9 Wisdom","New CEO, old me. See you at the next all-hands."],
];
/* funny flavor shown when each level-up item unlocks (index 0 = level 1). */
const GEARLINE = [
  "He stands unnervingly straight now.",
  "The duck has commit access now. It earned it.",
  "Time is a construct. Standup is not.",
  "Enchanted lenses. The 2am deploy only feels like 1am.",
  "Noise-cancelling, including your questions.",
  "Blinking is optional now.",
  "Reads the docs. The forbidden technique.",
  "The handshake is now load-bearing.",
  "One for the code, one for the logs, one to stare into the void.",
  "Did someone say business casual?",
  "Absolute unit.",
  "Finally allowed in through the front door.",
];

/* ---------- background keying (edge flood-fill of the cream bg) ---------- */
/* bump when any assets/*.png sprite is replaced, so browsers fetch the new one instead of a cached copy */
const ASSET_VER=64;
const cache={};
function keyed(file){
  if(cache[file])return Promise.resolve(cache[file]);
  return new Promise(res=>{const img=new Image();img.onload=()=>{
    const s=Math.min(1,520/img.naturalWidth),w=Math.round(img.naturalWidth*s),h=Math.round(img.naturalHeight*s);
    const cv=document.createElement("canvas");cv.width=w;cv.height=h;const cx=cv.getContext("2d");cx.drawImage(img,0,0,w,h);
    const im=cx.getImageData(0,0,w,h),p=im.data,br=p[0],bg=p[1],bb=p[2],th=42;
    const near=i=>Math.abs(p[i]-br)<th&&Math.abs(p[i+1]-bg)<th&&Math.abs(p[i+2]-bb)<th;
    const stk=[],seen=new Uint8Array(w*h);
    for(let x=0;x<w;x++){stk.push(x);stk.push((h-1)*w+x);}
    for(let y=0;y<h;y++){stk.push(y*w);stk.push(y*w+w-1);}
    while(stk.length){const idx=stk.pop();if(seen[idx])continue;seen[idx]=1;const i=idx*4;if(!near(i))continue;p[i+3]=0;
      const x=idx%w,y=(idx/w)|0;if(x>0)stk.push(idx-1);if(x<w-1)stk.push(idx+1);if(y>0)stk.push(idx-w);if(y<h-1)stk.push(idx+w);}
    cx.putImageData(im,0,0);cache[file]=cv.toDataURL();res(cache[file]);};img.src="assets/"+file+"?a="+ASSET_VER;});
}

/* ---------- state ---------- */
const KEY="dsls_v1", DAY=86400000;
const STARTING_BITS=32;                     /* welcome bits: exactly enough to buy the first bobblehead day-one */
function defState(){return {level:0,points:0,bits:STARTING_BITS,owned:Array(24).fill(false),
  start:Date.now(),last:Date.now(),best:0,screwups:0,
  seasonStart:Date.now(),                  /* season boundary; survives defect resets, cleared on new season */
  sprintsLogged:0,seasonPoints:0,peakLevel:0,pmNotes:[],  /* season stats for the recap record */
  sprintWeeks:2,avgPoints:30,seasonSprints:6,  /* PO season config: sprint length, typical team velocity, desired season length */
  ptsPerLevel:15,bobblesPerSprint:4,           /* derived from the three above via applySeasonConfig(); engine code reads these directly */
  defBits:30,defLevels:1,defAll:false};}   /* configurable defect punishment */
const SETUP_DEFAULTS={sprintWeeks:2, avgPoints:30, seasonSprints:6};
/* Recompute the engine dials from the PO's plain-language config. A season is seasonSprints long;
   both tracks are tuned to finish on that sprint: all 24 bobbleheads at bobblesPerSprint per sprint,
   and level 12 by spending the team's avgPoints across the season (avgPoints*seasonSprints total). */
function applySeasonConfig(){
  S.sprintWeeks=Math.max(1,Math.min(8,Math.round(S.sprintWeeks||2)));
  S.avgPoints=Math.max(1,Math.min(999,Math.round(S.avgPoints||30)));
  S.seasonSprints=Math.max(2,Math.min(52,Math.round(S.seasonSprints||6)));
  S.bobblesPerSprint=24/S.seasonSprints;
  S.ptsPerLevel=Math.max(1,Math.round(S.avgPoints*S.seasonSprints/12));
}
let S=loadState();
function loadState(){try{const j=JSON.parse(localStorage.getItem(KEY));
  if(j&&Array.isArray(j.owned)&&j.owned.length===24)return {...defState(),...j};}catch(e){}return defState();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

/* ---------- idea wall (persists across seasons in its own key) ---------- */
const IDEAS_KEY="dsls_ideas";
function loadIdeas(){try{const j=JSON.parse(localStorage.getItem(IDEAS_KEY));if(Array.isArray(j))return j;}catch(e){}return [];}
function saveIdeas(){try{localStorage.setItem(IDEAS_KEY,JSON.stringify(ideas));}catch(e){}}
let ideas=loadIdeas();
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function openIdeas(){document.getElementById("ideaInput").value="";showIdeaTab("todo");open("ideaModal");}
function showIdeaTab(t){
  document.getElementById("tabTodo").classList.toggle("on",t==="todo");
  document.getElementById("tabPm").classList.toggle("on",t==="pm");
  document.getElementById("paneTodo").hidden=t!=="todo";
  document.getElementById("panePm").hidden=t!=="pm";
  if(t==="pm")renderPm();else renderIdeas();
}
/* post-mortem log: this season's defect notes (past seasons live in the Seasons recap) */
function renderPm(){
  const list=document.getElementById("pmList");if(!list)return;
  const notes=S.pmNotes||[];
  document.getElementById("pmCount").textContent=notes.length
    ?`${notes.length} logged this season`:"No defects logged this season.";
  if(!notes.length){list.innerHTML='<p class="idea-empty">Report a defect and your answer lands here, so the team can revisit what happened. Past seasons are saved under ⚙ → Seasons.</p>';return;}
  list.innerHTML="";
  notes.slice().reverse().forEach(n=>{
    const row=document.createElement("div");row.className="pm-row";
    row.innerHTML=`<div class="idea-body"><p class="idea-text"></p><span class="idea-meta"></span></div>`;
    row.querySelector(".idea-text").textContent=n.note;
    row.querySelector(".idea-meta").textContent=new Date(n.ts).toLocaleDateString();
    list.appendChild(row);
  });
}
function renderIdeas(){
  const list=document.getElementById("ideaList");if(!list)return;
  const openN=ideas.filter(i=>!i.done).length;
  document.getElementById("ideaCount").textContent=ideas.length
    ?`${openN} open · ${ideas.length} total`:"Nothing on the list yet. Add the first to-do.";
  if(!ideas.length){list.innerHTML='<p class="idea-empty">Team to-dos and ideas to try. They stick around across seasons, so revisit them at each retro. Check items off as you finish them.</p>';return;}
  list.innerHTML="";
  ideas.map((it,i)=>[it,i]).reverse().forEach(([it,idx])=>{
    const row=document.createElement("div");row.className="idea-row"+(it.done?" done":"");
    row.innerHTML=`<button class="idea-check" title="Mark done">${it.done?"✔":""}</button>
      <div class="idea-body"><p class="idea-text"></p><span class="idea-meta"></span></div>
      <button class="idea-del" title="Delete">✕</button>`;
    row.querySelector(".idea-text").textContent=it.text;
    row.querySelector(".idea-meta").textContent=(it.done?"Done · ":"")+new Date(it.ts).toLocaleDateString();
    row.querySelector(".idea-check").onclick=()=>{it.done=!it.done;saveIdeas();renderIdeas();};
    row.querySelector(".idea-del").onclick=()=>{ideas.splice(idx,1);saveIdeas();renderIdeas();};
    list.appendChild(row);
  });
}
function addIdea(){
  const el=document.getElementById("ideaInput"),t=el.value.trim();if(!t)return;
  ideas.push({text:t,ts:Date.now(),done:false});saveIdeas();el.value="";renderIdeas();
}

/* ---------- season recap records (persist across seasons in their own key) ---------- */
const SEASONS_KEY="dsls_seasons";
function loadSeasons(){try{const j=JSON.parse(localStorage.getItem(SEASONS_KEY));if(Array.isArray(j))return j;}catch(e){}return [];}
function saveSeasons(){try{localStorage.setItem(SEASONS_KEY,JSON.stringify(seasons));}catch(e){}}
let seasons=loadSeasons();
function recordSeason(won){
  const r={
    n:seasons.length+1,
    start:S.seasonStart||S.start,end:Date.now(),won:!!won,
    best:S.best,defects:S.screwups,
    sprints:S.sprintsLogged||0,totalPoints:S.seasonPoints||0,
    pmNotes:(S.pmNotes||[]).slice(),
  };
  seasons.push(r);saveSeasons();
  return r;
}
/* one season card, shared by the Seasons tab and the end-of-season recap popup */
function seasonCardHTML(r){
  const sprints=r.sprints||0, total=r.totalPoints||0, avg=sprints?Math.round(total/sprints):0;
  const notes=(r.pmNotes&&r.pmNotes.length)
    ?`<div class="season-notes"><b>Post-mortems</b>`+r.pmNotes.map(n=>`<p>“${escapeHtml(n.note)}”</p>`).join("")+`</div>`:"";
  return `<div class="season-top"><span class="season-n">Season ${r.n}${r.won?" 🏆":""}</span>
      <span class="season-date">${new Date(r.start).toLocaleDateString()} – ${new Date(r.end).toLocaleDateString()}</span></div>
    <div class="season-sub">Played ${fmtDur(r.end-r.start)}</div>
    <div class="season-stats"><span>📅 ${sprints} sprint${sprints===1?"":"s"}</span>
      <span>📊 ${avg} avg pts</span><span>Σ ${total.toLocaleString()} total pts</span>
      <span>🔥 best ${r.best}d</span><span>🚨 ${r.defects} defect${r.defects===1?"":"s"}</span></div>${notes}`;
}
function renderSeasons(){
  const el=document.getElementById("seasonList");if(!el)return;
  if(!seasons.length){el.innerHTML='<p class="dp-note">No seasons recorded yet. Beat the Defect Dragon, or start a new season, to bank the first record.</p>';return;}
  el.innerHTML="";
  seasons.slice().reverse().forEach(r=>{
    const card=document.createElement("div");card.className="season-card"+(r.won?" won":"");
    card.innerHTML=seasonCardHTML(r);
    el.appendChild(card);
  });
}
/* end-of-season recap popup: the just-banked season, front and center, before the shelf resets */
function showSeasonRecap(r){
  const body=document.getElementById("recapBody");if(!body)return;
  body.className="season-card"+(r.won?" won":"");
  body.innerHTML=seasonCardHTML(r);
  document.getElementById("recapTitle").textContent=r.won?"🏆 Season complete!":"Season wrapped";
  open("recapModal");
}

/* ---------- economy ---------- */
const ownedCount=()=>S.owned.filter(Boolean).length;
const daysSince=()=>(Date.now()-S.start)/DAY;
const streakBonus=d=>d>=21?1.3:d>=14?1.2:d>=7?1.1:1;
/* daily bits start at 8 and rise +10% per bobblehead owned (plus level + streak multipliers).
   spinCost scales with bitsPerDay, so the box price rises with the bonus too, keeping the
   collection rate at ~1-2 per 2-week sprint. */
const bobbleBonus=()=>1+0.10*ownedCount();
const bitsPerDay=()=>Math.round(8*Math.pow(1.5,S.level)*streakBonus(daysSince())*bobbleBonus());
/* A box costs ~ (sprint-days / bobblesPerSprint) days of the current bits/day, with a gentle ramp so
   later boxes cost a touch more. Both cost and income scale with bitsPerDay, so the rate holds at every
   level: one sprint of accrued bits buys ~bobblesPerSprint bobbleheads, whatever the sprint length.
   The VERY FIRST box costs exactly the welcome bits so a new player buys one on day one. */
const spinCost=()=>{
  if(ownedCount()===0)return STARTING_BITS;
  const baseDays=(S.sprintWeeks*7)/S.bobblesPerSprint;
  return Math.round(bitsPerDay()*baseDays*(0.9+0.2*ownedCount()/23));
};
const pointsToClear=L=>S.ptsPerLevel;   /* flat, PO-configurable sprint points per level */
function accrue(){const now=Date.now();const dd=(now-S.last)/DAY;if(dd>0){S.bits+=bitsPerDay()*dd;S.last=now;}}
function fmtDur(ms){const d=Math.floor(ms/DAY),h=Math.floor(ms%DAY/3600000),m=Math.floor(ms%3600000/60000);
  return d>0?`${d}d ${h}h`:h>0?`${h}h ${m}m`:`${m}m`;}
/* Bits are the base unit; as the pile grows it rolls up into Kb, Mb, Gb, Tb so the HUD stays
   readable. fmtBits omits the word at base (the HUD already labels it); fmtBitsWord adds "bits"
   at base for inline prose ("Buy · 320 bits" / "Buy · 1.2 Kb"). */
function fmtBits(n){
  n=Math.floor(Math.max(0,n));
  const units=["","Kb","Mb","Gb","Tb"];
  let u=0,v=n;
  while(v>=1000&&u<units.length-1){v/=1000;u++;}
  if(u===0)return n.toLocaleString();
  const disp=x=>x>=100?x.toFixed(0):x>=10?x.toFixed(1):x.toFixed(2);
  let s=disp(v);
  if(+s>=1000&&u<units.length-1){v/=1000;u++;s=disp(v);}  // rounding pushed it into the next unit
  return s+" "+units[u];
}
function fmtBitsWord(n){const s=fmtBits(n);return /[A-Za-z]/.test(s)?s:s+" bits";}

/* ---------- render ---------- */
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
/* ---------- Defect Dragon boss fight ---------- */
const readyForBoss=()=>S.level>=12&&ownedCount()>=24;
const isWon=()=>{try{return localStorage.getItem("dsls_won")==="1";}catch(e){return false;}};
function updateBossBtn(){
  const b=document.getElementById("bossBtn");if(!b)return;
  if(isWon()){b.hidden=false;b.textContent="🎉 START A NEW SEASON";b.onclick=newSeason;b.classList.add("won");}
  else if(readyForBoss()){b.hidden=false;b.textContent="⚔ FIGHT THE DEFECT DRAGON";b.onclick=openBoss;b.classList.remove("won");}
  else b.hidden=true;
}
/* after the dragon is beaten, the in-game break room becomes a party until a new season */
function applyPartyMode(){const room=document.getElementById("room");if(room)room.classList.toggle("party",isWon());}
let dragonHP=24;
async function openBoss(){
  document.getElementById("bossHero").src=await keyed("tech-12.png");
  document.getElementById("bossDragon").src=await keyed("dragon-battle.png");
  const drg=document.getElementById("bossDragon");drg.classList.remove("dead","hit","shake");
  dragonHP=24;document.getElementById("dragonHp").style.width="100%";
  document.getElementById("bossWin").hidden=true;
  const ab=document.getElementById("attackBtn");ab.style.display="";ab.disabled=false;
  document.getElementById("fxLayer").innerHTML="";
  open("bossModal");
}
function pct(el){const r=el.getBoundingClientRect(),a=document.getElementById("arena").getBoundingClientRect();
  return {x:(r.left+r.width/2-a.left)/a.width*100, y:(r.top+r.height*0.4-a.top)/a.height*100};}
async function throwOne(){
  const n=Math.floor(Math.random()*24)+1;
  const url=await keyed(`bob-${String(n).padStart(2,"0")}.png`);
  const fx=document.getElementById("fxLayer");if(!fx)return;
  const b=document.createElement("img");b.className="throwbob";b.src=url;
  b.style.left="10%";b.style.top="52%";b.style.transform="rotate(0deg)";
  fx.appendChild(b);
  const tx=70+Math.random()*10, ty=30+Math.random()*22;
  requestAnimationFrame(()=>{b.style.transition="left .45s ease-in, top .45s ease-in, transform .45s linear";
    b.style.left=tx+"%";b.style.top=ty+"%";b.style.transform=`rotate(${540+Math.random()*360}deg)`;});
  setTimeout(()=>{impact(tx,ty);b.remove();},480);
}
function impact(x,y){
  const fx=document.getElementById("fxLayer");if(!fx)return;
  const s=document.createElement("div");s.className="hitstar";s.textContent=["💥","⭐","✦"][Math.floor(Math.random()*3)];
  s.style.left=x+"%";s.style.top=y+"%";fx.appendChild(s);setTimeout(()=>s.remove(),500);
}
function attack(){
  if(dragonHP<=0)return;
  const dmg=Math.min(6,dragonHP);
  for(let i=0;i<dmg;i++)setTimeout(throwOne,i*70);
  setTimeout(()=>{
    dragonHP=Math.max(0,dragonHP-dmg);
    document.getElementById("dragonHp").style.width=(dragonHP/24*100)+"%";
    const drg=document.getElementById("bossDragon");drg.classList.add("shake","hit");
    setTimeout(()=>drg.classList.remove("shake","hit"),300);
    const dp=document.createElement("div");dp.className="dmgpop";dp.textContent="−"+dmg;
    dp.style.left="76%";dp.style.top="30%";document.getElementById("fxLayer").appendChild(dp);setTimeout(()=>dp.remove(),900);
    if(dragonHP<=0){document.getElementById("attackBtn").disabled=true;setTimeout(bossDefeat,650);}
  },dmg*70+430);
}
function bossDefeat(){
  try{localStorage.setItem("dsls_won","1");}catch(e){}   /* the office wins the season */
  document.getElementById("bossDragon").classList.add("dead");
  document.getElementById("attackBtn").style.display="none";
  applyPartyMode();updateBossBtn();checkAchievements();
  setTimeout(()=>{document.getElementById("bossWin").hidden=false;confetti();},650);
}
function celebrate(){try{localStorage.setItem("dsls_won","1");}catch(e){}
  location.href="home.html?party=1&t="+Date.now();}   /* query = signal + cache-bust */
function newSeason(){
  /* bank a recap for the season that just ended (skip an empty one that saw no activity) */
  const hadActivity=(S.sprintsLogged||0)>0||ownedCount()>0||S.screwups>0;
  const ended=hadActivity?recordSeason(isWon()):null;
  const keep={sprintWeeks:S.sprintWeeks,avgPoints:S.avgPoints,seasonSprints:S.seasonSprints,ptsPerLevel:S.ptsPerLevel,bobblesPerSprint:S.bobblesPerSprint,defBits:S.defBits,defLevels:S.defLevels,defAll:S.defAll};
  S=defState();Object.assign(S,keep);S.seasonStart=Date.now();
  try{localStorage.removeItem("dsls_won");}catch(e){}
  save();close("bossModal");document.getElementById("lvRange").value=0;
  syncSetupInputs();syncDefectInputs();renderSeasons();fullRender();
  /* surface the just-banked season as a recap card; it already lives in the Seasons tab too */
  if(ended)showSeasonRecap(ended);
}
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

/* ---------- fortune cookie ---------- */
/* Default sprint-review questions (facilitator prompts). Sourced from common scrum practice
   + Scrum.org / Atlassian sprint-review guidance; phrased for a live sprint review.
   The team can add/remove their own in ⚙ → Questions; edits live in localStorage `dsls_fortunes`. */
const DEFAULT_FORTUNES=[
  // increment / value
  "What did we ship this sprint that you are most excited about?",
  "Did this sprint move us closer to the product goal?",
  "What did you expect from this sprint that didn't happen?",
  "Would you release this increment to real users right now? Why or why not?",
  "What surprised you this sprint?",
  "Whose problem did we actually solve this sprint?",
  // sprint goal / value
  "Did we meet the sprint goal? If not, what got in the way?",
  "What value did this sprint deliver to the people using the product?",
  "Was the sprint goal still the right goal by the end of the sprint?",
  // scope / incomplete work
  "What did we plan to finish but didn't, and why?",
  "What did we pull in mid-sprint, and was it worth it?",
  "What work carried over, and what will we do differently next time?",
  "What did we say no to this sprint, and was that the right call?",
  // backlog / next steps
  "What should be top of the backlog next sprint?",
  "What is the most important thing for the next sprint?",
  "What did we learn this sprint that should reshape the plan?",
  // risks / blockers
  "What is the biggest risk we are carrying into the next sprint?",
  "Which dependency or blocker slowed us down the most?",
  "What almost went wrong this sprint that we should talk about?",
  // quality / data
  "What did a bug, incident, or data-quality issue this sprint teach us?",
  "Is anything we shipped this sprint going to be painful to maintain or scale?",
  "What tech or data debt did we add this sprint, and is it worth paying down?",
  "Which part of the codebase are we afraid to touch?",
  // team / celebrate
  "What is the team most proud of this sprint?",
  "What made this sprint easier than the last one?",
  // improvement
  "What is one thing we should stop doing next sprint?",
  "What is one small experiment worth trying next sprint?",
  "What would make our next sprint review more useful?",
  "If we ran this sprint again, what is the one thing we would change?",
  // stakeholder engagement
  "Whose feedback are we missing that we should get before next sprint?",
  "What question should we be asking today that we haven't?",
];
/* the single reflective prompt shown when a defect is reported, before the penalty lands. */
const POSTMORTEM_Q="What caused this issue and what could we have done to prevent it?";

/* editable question bank (own localStorage key, survives seasons) */
const FORTUNES_KEY="dsls_fortunes";
function loadFortunes(){try{const j=JSON.parse(localStorage.getItem(FORTUNES_KEY));if(Array.isArray(j))return j;}catch(e){}return DEFAULT_FORTUNES.slice();}
function saveFortunes(){try{localStorage.setItem(FORTUNES_KEY,JSON.stringify(fortunes));}catch(e){}}
let fortunes=loadFortunes();
let lastFortune="";
function drawFortune(){
  if(!fortunes.length)return "Add a sprint-review question in ⚙ → Questions.";
  if(fortunes.length===1)return fortunes[0];
  let q;do{q=fortunes[Math.floor(Math.random()*fortunes.length)];}while(q===lastFortune);
  lastFortune=q;return q;
}
function renderFortunes(){
  const list=document.getElementById("fortuneList");if(!list)return;
  document.getElementById("fortuneCount").textContent=`${fortunes.length} question${fortunes.length===1?"":"s"} in the jar`;
  if(!fortunes.length){list.innerHTML='<p class="idea-empty">No questions yet. Add some, or reset to the defaults.</p>';return;}
  list.innerHTML="";
  fortunes.map((q,i)=>[q,i]).reverse().forEach(([q,idx])=>{
    const row=document.createElement("div");row.className="idea-row";
    row.innerHTML=`<div class="idea-body"><p class="idea-text"></p></div><button class="idea-del" title="Delete">✕</button>`;
    row.querySelector(".idea-text").textContent=q;
    row.querySelector(".idea-del").onclick=()=>{fortunes.splice(idx,1);saveFortunes();renderFortunes();};
    list.appendChild(row);
  });
}
function addFortune(){const el=document.getElementById("fortuneInput"),t=el.value.trim();if(!t)return;fortunes.push(t);saveFortunes();el.value="";renderFortunes();}
function resetFortunes(){fortunes=DEFAULT_FORTUNES.slice();saveFortunes();renderFortunes();}

/* ---------- fridge magnets: lifetime achievements (own localStorage key, survives seasons) ---------- */
const BADGES_KEY="dsls_badges";
function loadBadges(){try{const j=JSON.parse(localStorage.getItem(BADGES_KEY));if(j&&typeof j==="object")return j;}catch(e){}return {};}
function saveBadges(){try{localStorage.setItem(BADGES_KEY,JSON.stringify(badges));}catch(e){}}
let badges=loadBadges();
const wonLive=()=>{try{return localStorage.getItem("dsls_won")==="1";}catch(e){return false;}};
const streakDays=()=>Math.max(S.best||0,Math.floor(daysSince()));
/* Each: id, magnet emoji, name, one-line unlock rule, and test() read against live state + season history.
   Ordered easiest-first; a full 12 months of play should surface most of them. */
const ACHIEVEMENTS=[
  {id:"first-sprint",ic:"🌱",name:"Hello, World",desc:"Log your first sprint.",
    test:()=>(S.sprintsLogged||0)>=1||seasons.some(s=>(s.sprints||0)>=1)},
  {id:"collect-5",ic:"🎎",name:"Starting a Collection",desc:"Own 5 bobbleheads at once.",
    test:()=>ownedCount()>=5},
  {id:"clean-10",ic:"🧯",name:"Ten Days Clean",desc:"Reach 10 days since the last defect.",
    test:()=>streakDays()>=10},
  {id:"technomancer",ic:"🧙",name:"Technomancer",desc:"Reach max level (12).",
    test:()=>S.level>=12||(S.peakLevel||0)>=12},
  {id:"clean-30",ic:"🟢",name:"Green for a Month",desc:"Reach 30 days with no defect.",
    test:()=>streakDays()>=30},
  {id:"whole-office",ic:"🏢",name:"The Whole Office",desc:"Collect all 24 bobbleheads.",
    test:()=>ownedCount()>=24},
  {id:"dragon",ic:"🐉",name:"Dragon Slayer",desc:"Defeat the Defect Dragon.",
    test:()=>wonLive()||seasons.some(s=>s.won)},
  {id:"comeback",ic:"💪",name:"Comeback Kid",desc:"Win a season after taking a defect.",
    test:()=>(wonLive()&&(S.screwups||0)>=1)||seasons.some(s=>s.won&&(s.defects||0)>=1)},
  {id:"flawless",ic:"✨",name:"Flawless Season",desc:"Win a season with zero defects.",
    test:()=>(wonLive()&&(S.screwups||0)===0)||seasons.some(s=>s.won&&(s.defects||0)===0)},
  {id:"veteran",ic:"🎖️",name:"Old-Timer",desc:"Complete four seasons.",
    test:()=>seasons.length>=4},
];
/* Evaluate every rule; lock in any newly-earned magnet (persisted immediately) and toast it. */
function checkAchievements(){
  let fresh=[];
  ACHIEVEMENTS.forEach(a=>{if(!badges[a.id]){try{if(a.test()){badges[a.id]=Date.now();fresh.push(a);}}catch(e){}}});
  if(fresh.length){saveBadges();fresh.forEach(a=>badgeToast(a));if(document.getElementById("fridgeModal")&&!document.getElementById("fridgeModal").hidden)renderBadges();}
  return fresh;
}
function badgeToast(a){
  const t=document.createElement("div");t.className="badge-toast";
  t.innerHTML=`<span class="badge-toast-ic">${a.ic}</span><span><b>Magnet unlocked</b><br>${escapeHtml(a.name)}</span>`;
  document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add("show"));
  setTimeout(()=>{t.classList.remove("show");setTimeout(()=>t.remove(),400);},3600);
}
function renderBadges(){
  const grid=document.getElementById("badgeGrid");if(!grid)return;
  const got=ACHIEVEMENTS.filter(a=>badges[a.id]).length;
  document.getElementById("badgeCount").textContent=`${got} of ${ACHIEVEMENTS.length} magnets earned`;
  grid.innerHTML="";
  ACHIEVEMENTS.forEach(a=>{
    const ts=badges[a.id],on=!!ts;
    const cell=document.createElement("div");cell.className="badge"+(on?"":" locked");
    const when=on?new Date(ts).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}):"";
    cell.innerHTML=`<div class="badge-ic">${on?a.ic:"🔒"}</div>`
      +`<div class="badge-name"></div><div class="badge-desc"></div>`
      +(on?`<div class="badge-date">${when}</div>`:"");
    cell.querySelector(".badge-name").textContent=a.name;
    cell.querySelector(".badge-desc").textContent=a.desc;
    grid.appendChild(cell);
  });
}
function openFridge(){checkAchievements();renderBadges();open("fridgeModal");}

/* fortune cookie: a prop on the counter that cracks open on hover, click reveals a question */
let cookieWhole="",cookieBroken="";
async function loadCookie(){
  cookieWhole=await keyed("prop-cookie.png");
  cookieBroken=await keyed("prop-cookie-broken.png");
  document.getElementById("cookieProp").src=cookieWhole;
  document.getElementById("cookieImg").src=cookieBroken;
}
/* the modal opens already cracked (the prop did the cracking); it just shows the question */
function showFortune(){
  const img=document.getElementById("cookieImg");
  img.classList.remove("cracking");img.classList.add("broken");if(cookieBroken)img.src=cookieBroken;
  document.getElementById("cookieHint").hidden=true;
  document.getElementById("fortuneText").textContent=drawFortune();
  document.getElementById("fortuneSlip").hidden=false;
  document.getElementById("cookieAgain").hidden=false;
}
function openFortune(){showFortune();open("fortuneModal");confetti();}
function rerollFortune(){
  const img=document.getElementById("cookieImg");
  img.classList.add("cracking");
  document.getElementById("fortuneSlip").hidden=true;
  setTimeout(()=>{img.classList.remove("cracking");
    document.getElementById("fortuneText").textContent=drawFortune();
    document.getElementById("fortuneSlip").hidden=false;confetti();},350);
}

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

/* ---------- cards ---------- */
async function openCard(i,isNew){
  const [name,skill,line]=BOB[i];
  const url=await keyed(`bob-${String(i+1).padStart(2,"0")}.png`);
  document.getElementById("cardBox").innerHTML=
    `<div class="card-head"><span class="card-no">${isNew?"NEW! ":""}#${i+1} / 24</span><h3>${name}</h3></div>
     <div class="card-art"><img src="${url}" alt="${name}"></div>
     <div class="card-skill">${skill}</div>
     <p class="card-line">"${line}"</p>
     <button class="btn" id="cardClose">${isNew?"Sweet":"Nice"}</button>`;
  document.getElementById("cardBox").querySelector("#cardClose").onclick=()=>close("cardModal");
  open("cardModal");
  if(isNew)confetti();
}
function showTrophy(level){
  const [,name,stat]=LEVELS[level];
  document.getElementById("trophyBox").innerHTML=
    `<div class="trophy-emoji">🏆</div><h2>Level ${level}!</h2>
     <p><b>${name}</b>${stat?` · ${stat}`:""}</p>
     <p class="card-line">"${GEARLINE[level-1]||""}"</p>
     ${level>=12?'<p class="lbl">Max level. Complete the shelf, then take on the Defect Dragon.</p>':""}
     <button class="btn green" id="trophyClose">Let's go</button>`;
  document.getElementById("trophyBox").querySelector("#trophyClose").onclick=()=>close("trophyModal");
  open("trophyModal");confetti();
}
function confetti(){
  const em=["🎉","✨","🎊","⭐","💾"];
  for(let n=0;n<26;n++){const s=document.createElement("div");
    s.textContent=em[n%em.length];
    s.style.cssText=`position:fixed;left:${Math.random()*100}vw;top:-40px;font-size:${14+Math.random()*16}px;z-index:96;pointer-events:none;transition:transform 1.4s ease-in, opacity 1.4s;`;
    document.body.appendChild(s);
    requestAnimationFrame(()=>{s.style.transform=`translateY(${90+Math.random()*20}vh) rotate(${Math.random()*720-360}deg)`;s.style.opacity=0;});
    setTimeout(()=>s.remove(),1500);}
}

/* ---------- modals ---------- */
const open=id=>document.getElementById(id).classList.add("open");
const close=id=>document.getElementById(id).classList.remove("open");

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
