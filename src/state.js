/* Game state: the single `S` object, its localStorage persistence, and the
   season-config math that turns the PO's plain-language settings into engine
   dials. Every other file reads and mutates the global `S` defined here. */

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
