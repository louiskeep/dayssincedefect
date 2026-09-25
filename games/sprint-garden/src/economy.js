/* Economy: per-plant production summed into bits/day, and the tree-cost
   ramp. Replaces the base game's flat exponential formula entirely, per
   docs/specs/sprint-garden-spec.md section 3. Pure functions over `S`. */

function speciesProduction(tier,idx,level){
  const base=(tier==="flower"?FLOWERS:TREES)[idx][2];
  return base*LEVEL_MULT[level-1];
}
function bitsPerDay(){
  return S.plants.reduce((sum,p)=>sum+speciesProduction(p.tier,p.idx,p.level),0);
}
function treeCost(){
  return Math.round(S.baseTreeCost*Math.pow(1.6,ownedTreeCount()));
}
function accrue(){
  const now=Date.now();const dd=(now-S.last)/DAY;
  if(dd>0){S.bits+=bitsPerDay()*dd;S.last=now;}
}
function fmtBits(n){
  n=Math.floor(Math.max(0,n));
  const units=["","Kb","Mb","Gb","Tb"];
  let u=0,v=n;
  while(v>=1000&&u<units.length-1){v/=1000;u++;}
  if(u===0)return n.toLocaleString();
  const disp=x=>x>=100?x.toFixed(0):x>=10?x.toFixed(1):x.toFixed(2);
  let s=disp(v);
  if(+s>=1000&&u<units.length-1){v/=1000;u++;s=disp(v);}
  return s+" "+units[u];
}
function fmtBitsWord(n){const s=fmtBits(n);return /[A-Za-z]/.test(s)?s:s+" bits";}
