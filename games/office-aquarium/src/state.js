/* Office Aquarium: game state: the single `S` object, its localStorage
   persistence, and the season-config math. Mirrors the base game's
   sprintWeeks/avgPoints/seasonSprints pattern (see ../../../src/state.js) but
   there is no leveling ladder here: points gate the fish collection directly,
   per docs/specs/office-aquarium-spec.md section 2. */

const KEY = "office_aquarium_v1", DAY = 86400000;
const STARTING_BITS = 20;

function defState() {
  return {
    points: 0, bits: STARTING_BITS,
    fishOwned: Array(24).fill(false),
    fishSeenFacts: Array(24).fill(null).map(() => []),   // fact indices already shown, per fish
    hatsOwned: Array(12).fill(false),
    fishHat: Array(24).fill(null),                        // hat index or null, per fish slot
    feedCount: 0, factsLearned: 0, hatsFound: 0,
    reefComplete: false,
    start: Date.now(), last: Date.now(), best: 0, screwups: 0,
    seasonStart: Date.now(),
    sprintsLogged: 0, seasonPoints: 0,
    sprintWeeks: 2, avgPoints: 30, seasonSprints: 6,
    pointsPerFish: 38,          /* derived from the three above via applySeasonConfig() */
    defBits: 30,                /* configurable defect punishment; no defLevels, there's no ladder */
    seasonHistory: [],
  };
}
const SETUP_DEFAULTS = { sprintWeeks: 2, avgPoints: 30, seasonSprints: 6 };

/* Recompute pointsPerFish from the PO's plain-language config, same derivation
   shape as the base game's ptsPerLevel: total season points spread across 24
   fish instead of 12 levels, so the collection completes around season end. */
function applySeasonConfig() {
  S.sprintWeeks = Math.max(1, Math.min(8, Math.round(S.sprintWeeks || 2)));
  S.avgPoints = Math.max(1, Math.min(999, Math.round(S.avgPoints || 30)));
  S.seasonSprints = Math.max(2, Math.min(52, Math.round(S.seasonSprints || 6)));
  S.pointsPerFish = Math.max(1, Math.round(S.avgPoints * S.seasonSprints / 24));
}

let S = loadState();
function loadState() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY));
    if (j && Array.isArray(j.fishOwned) && j.fishOwned.length === 24) return { ...defState(), ...j };
  } catch (e) {}
  return defState();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
