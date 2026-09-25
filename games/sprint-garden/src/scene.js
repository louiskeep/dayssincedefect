/* Scene rendering: paints `S` onto the garden bed and the HUD header. No art
   assets exist yet, so plants render as labeled placeholder cards rather than
   sprites; swapping in real art later means changing renderPlantCard() only. */

function renderHUD(){
  document.getElementById("bits").textContent=fmtBits(S.bits);
  document.getElementById("rate").textContent=fmtBitsWord(bitsPerDay());
  document.getElementById("pests").textContent=`${S.screwups} pest event${S.screwups===1?"":"s"}`;
  const need=S.pointsPerFlower;
  document.getElementById("flbar").style.width=(nextFlowerIdx()>=FLOWERS.length?100:Math.min(100,S.points/need*100))+"%";
  document.getElementById("flnote").textContent=nextFlowerIdx()>=FLOWERS.length?"All 16 flowers planted":
    `${Math.max(0,need-S.points)} pts to next flower`;
  document.getElementById("species").textContent=`${S.plants.length}/${FLOWERS.length+TREES.length}`;
  const cost=treeCost(),afford=S.bits>=cost,treesDone=nextTreeIdx()>=TREES.length;
  document.getElementById("lblTend").textContent=treesDone?"🌳 All trees planted":
    afford?"🌳 Tend the garden · ready":`🌳 Tend the garden · ${fmtBitsWord(cost)}`;
  document.getElementById("bloomBanner").hidden=!isFullBloom();
}

function renderBed(){
  const bed=document.getElementById("bed");
  bed.innerHTML="";
  if(S.plants.length===0){
    bed.innerHTML='<p class="bed-empty">Nothing planted yet. Log a sprint to plant the first flower.</p>';
    return;
  }
  for(const p of S.plants){
    bed.appendChild(renderPlantCard(p));
  }
}

function renderPlantCard(p){
  const [name,flavor]=p.tier==="flower"?FLOWERS[p.idx]:TREES[p.idx];
  const el=document.createElement("div");
  el.className="plant plant-"+p.tier;
  el.title=flavor;
  el.innerHTML=`<div class="plant-name">${name}</div><div class="plant-lv">Lv ${p.level}${p.skip?" 🐛":""}</div>`;
  el.onclick=()=>openPlantCard(p);
  return el;
}

function openPlantCard(p){
  const [name,flavor]=p.tier==="flower"?FLOWERS[p.idx]:TREES[p.idx];
  document.getElementById("cardBox").innerHTML=
    `<div class="card-head"><span class="card-no">${p.tier==="flower"?"Flower":"Tree"} · Lv ${p.level}/3</span><h3>${name}</h3></div>
     <div class="card-art plant-art plant-${p.tier}"></div>
     <p class="card-line">"${flavor}"</p>
     <button class="btn" id="cardClose">Nice</button>`;
  document.getElementById("cardBox").querySelector("#cardClose").onclick=()=>close("cardModal");
  open("cardModal");
}

function fullRender(){renderHUD();renderBed();}
