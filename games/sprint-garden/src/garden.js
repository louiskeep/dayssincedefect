/* Garden mechanics: auto-plant flowers at a points threshold, auto-plant
   trees off the Tend the Garden prop, the per-sprint growth tick, pest
   events, and the Full Bloom finale. No shop, no species picking, plants
   choose themselves in list order, per docs/specs/sprint-garden-spec.md. */

/* plant every flower a crossed threshold affords, in list order */
function plantFlowers(){
  const planted=[];
  while(nextFlowerIdx()<FLOWERS.length&&S.points>=S.pointsPerFlower){
    S.points-=S.pointsPerFlower;
    const idx=nextFlowerIdx();
    S.plants.push({tier:"flower",idx,level:1,skip:false});
    planted.push(FLOWERS[idx][0]);
  }
  return planted;
}

/* every plant not yet at level 3 grows one level, unless it's marked to skip
   this cycle (a pending pest event); the skip flag then clears. Called once
   per logged sprint, since that's the only "elapsed time" unit the PO
   controls in this game. */
function tickGrowth(){
  for(const p of S.plants){
    if(p.skip){p.skip=false;continue;}
    if(p.level<3)p.level++;
  }
}

/* Tend the Garden prop: spend banked bits to auto-plant the next tree in
   sequence, once affordable. Single button, no menu. Returns the planted
   tree's name, or null if not affordable / all trees owned. */
function tendGarden(){
  if(nextTreeIdx()>=TREES.length)return null;
  const cost=treeCost();
  if(S.bits<cost)return null;
  S.bits-=cost;
  const idx=nextTreeIdx();
  S.plants.push({tier:"tree",idx,level:1,skip:false});
  return TREES[idx][0];
}

/* a logged defect doesn't touch points or bits; it's a pest event that skips
   every currently-growing plant's next scheduled level-up */
function applyPestEvent(){
  let hit=0;
  for(const p of S.plants){if(p.level<3){p.skip=true;hit++;}}
  return hit;
}
