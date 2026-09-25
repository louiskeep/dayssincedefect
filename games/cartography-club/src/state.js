/* Game state: the single `S` object, its localStorage persistence, and the
   season-config math. Same shape as the base game's state.js, renamed for
   this game's currencies (jump instead of level, artifacts instead of
   bobbleheads). See docs/specs/cartography-club-spec.md. */

const KEY = "cartography_v1", DAY = 86400000;
const STARTING_BITS = 32; /* enough to retrieve the first artifact day one */

function defState() {
  return {
    jump: 0, points: 0, bits: STARTING_BITS,
    artifacts: Array(24).fill(false),
    start: Date.now(), last: Date.now(), best: 0, screwups: 0,
    seasonStart: Date.now(),
    sprintsLogged: 0, seasonPoints: 0, peakJump: 0, pmNotes: [],
    sprintWeeks: 2, avgPoints: 30, seasonSprints: 6,
    ptsPerJump: 15, artifactsPerSprint: 4,
    defBits: 30, defJumps: 1, defAll: false,
  };
}
const SETUP_DEFAULTS = { sprintWeeks: 2, avgPoints: 30, seasonSprints: 6 };

/* Recompute the engine dials from the PO's plain-language config, same
   derivation the base game uses: a season is seasonSprints long, both
   tracks (jumps, artifacts) are tuned to finish on that sprint. */
function applySeasonConfig() {
  S.sprintWeeks = Math.max(1, Math.min(8, Math.round(S.sprintWeeks || 2)));
  S.avgPoints = Math.max(1, Math.min(999, Math.round(S.avgPoints || 30)));
  S.seasonSprints = Math.max(2, Math.min(52, Math.round(S.seasonSprints || 6)));
  S.artifactsPerSprint = 24 / S.seasonSprints;
  S.ptsPerJump = Math.max(1, Math.round(S.avgPoints * S.seasonSprints / 12));
}

let S = loadState();
function loadState() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY));
    if (j && Array.isArray(j.artifacts) && j.artifacts.length === 24) return { ...defState(), ...j };
  } catch (e) {}
  return defState();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
}
