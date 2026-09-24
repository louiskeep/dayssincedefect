/* Economy: the bits-per-day income curve, box prices, and the number formatters
   (durations and the Kb/Mb/Gb roll-up). Pure functions over the global `S`; no
   DOM here. renderHUD and the buy/log flows call into these. */

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
