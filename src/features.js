/* Side features and pop-ups that hang off the room props: the team to-do board +
   post-mortem log, the season recap records, the fortune-cookie question bank,
   the fridge-magnet achievements, and the bobblehead/trophy/gear card pop-ups.
   Each feature owns its own localStorage key so it survives a season reset. */

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

/* fortune-cookie reveal (the prop art is loaded in scene.js) */
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

/* ---------- bobblehead / trophy cards + confetti ---------- */
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
