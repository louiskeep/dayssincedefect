/* Game state: the single `S` object, its localStorage persistence, and the
   season-config math. Mirrors the base game's state.js shape, but plants are
   individually owned instances (species + level), not a flat owned[] array,
   since production is summed per-instance (see economy.js). */

const KEY="sprint_garden_v1", DAY=86400000;
function defState(){return {
  points:0,                    /* banked toward the next flower threshold, resets on plant */
  bits:0,
  plants:[],                   /* [{tier:'flower'|'tree', idx:Number, level:1, skip:false}] */
  screwups:0,
  sprintsLogged:0,seasonPoints:0,
  seasonStart:Date.now(),
  start:Date.now(),last:Date.now(),  /* for bits accrual between logs, same pattern as the base game */
  sprintWeeks:2,avgPoints:30,seasonSprints:6,   /* PO season config */
  pointsPerFlower:0,baseTreeCost:200,           /* derived / tunable */
};}
const SETUP_DEFAULTS={sprintWeeks:2,avgPoints:30,seasonSprints:6};

function applySeasonConfig(){
  S.sprintWeeks=Math.max(1,Math.min(8,Math.round(S.sprintWeeks||2)));
  S.avgPoints=Math.max(1,Math.min(999,Math.round(S.avgPoints||30)));
  S.seasonSprints=Math.max(2,Math.min(52,Math.round(S.seasonSprints||6)));
  S.pointsPerFlower=Math.max(1,Math.round(S.avgPoints*S.seasonSprints/16));
}

let S=loadState();
function loadState(){try{const j=JSON.parse(localStorage.getItem(KEY));
  if(j&&Array.isArray(j.plants))return {...defState(),...j};}catch(e){}return defState();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

/* ---------- plant-collection helpers ---------- */
const flowersOwned=()=>S.plants.filter(p=>p.tier==="flower");
const treesOwned=()=>S.plants.filter(p=>p.tier==="tree");
const ownedTreeCount=()=>treesOwned().length;
const nextFlowerIdx=()=>flowersOwned().length;   /* list order, index into FLOWERS */
const nextTreeIdx=()=>treesOwned().length;       /* list order, index into TREES */
const isFullBloom=()=>S.plants.length===FLOWERS.length+TREES.length&&S.plants.every(p=>p.level>=3);
