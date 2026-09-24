/* Defect Dragon boss fight: unlock condition, the fight modal, the throw/attack
   animations, and the win + party-mode state. newSeason() also lives here since
   it is what the post-win "start a new season" button runs. */

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
  location.href="index.html?party=1&t="+Date.now();}   /* query = signal + cache-bust */
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
