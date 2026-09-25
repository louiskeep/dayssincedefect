/* The Jumper Machine: charge-on-log, the Retrieve Artifact prop, defect
   handling, and the finale. Reuses the base game's throw/impact/HP-bar
   pattern from boss.js, renamed. See spec sections 2-4. */

/* ---------- log a sprint: charges the machine, jumps at threshold ---------- */
function doLog(points) {
  const n = Math.max(1, Math.min(999, points || 0));
  S.points += n;
  let lastJump = 0;
  S.sprintsLogged = (S.sprintsLogged || 0) + 1;
  S.seasonPoints = (S.seasonPoints || 0) + n;
  while (S.jump < 12 && S.points >= chargeToJump(S.jump)) {
    S.points -= chargeToJump(S.jump);
    S.jump++;
    lastJump = S.jump;
  }
  if (S.jump > (S.peakJump || 0)) S.peakJump = S.jump;
  save();
  return lastJump; /* 0 if no jump happened this log */
}

/* ---------- Retrieve Artifact prop ---------- */
function doRetrieve() {
  const cost = retrieveCost();
  if (ownedCount() >= 24 || S.bits < cost) return null;
  S.bits -= cost;
  const pool = [];
  S.artifacts.forEach((o, i) => { if (!o) pool.push(i); });
  const idx = pool[Math.floor(Math.random() * pool.length)];
  S.artifacts[idx] = true;
  save();
  return idx;
}

/* ---------- report a defect ---------- */
function defectResultJump() { return S.defAll ? 0 : Math.max(0, S.jump - S.defJumps); }
function doDefect() {
  const d = Math.floor(daysSince());
  if (d > S.best) S.best = d;
  const oldJump = S.jump;
  const bitsLost = Math.floor(S.bits * S.defBits / 100);
  S.screwups++;
  S.start = Date.now();
  S.last = Date.now();
  S.bits -= bitsLost;
  S.jump = defectResultJump();
  S.points = 0;
  save();
  return { jumpsLost: oldJump - S.jump, bitsLost };
}

/* ---------- readiness + finale (The Temporal Paradox) ---------- */
const readyForFinale = () => S.jump >= 12 && ownedCount() >= 24;
const isWon = () => { try { return localStorage.getItem("cartography_won") === "1"; } catch (e) { return false; } };
let paradoxHP = 24;

function resetFinale() { paradoxHP = 24; }

function attackParadox() {
  if (paradoxHP <= 0) return 0;
  const dmg = Math.min(6, paradoxHP);
  paradoxHP = Math.max(0, paradoxHP - dmg);
  if (paradoxHP <= 0) { try { localStorage.setItem("cartography_won", "1"); } catch (e) {} }
  return dmg;
}

function newSeason() {
  const keep = {
    sprintWeeks: S.sprintWeeks, avgPoints: S.avgPoints, seasonSprints: S.seasonSprints,
    ptsPerJump: S.ptsPerJump, artifactsPerSprint: S.artifactsPerSprint,
    defBits: S.defBits, defJumps: S.defJumps, defAll: S.defAll,
  };
  const recap = {
    points: S.seasonPoints, best: S.best, defects: S.screwups,
    artifacts: ownedCount(), jumps: S.peakJump, sprints: S.sprintsLogged, won: isWon(),
  };
  S = defState();
  Object.assign(S, keep);
  S.seasonStart = Date.now();
  try { localStorage.removeItem("cartography_won"); } catch (e) {}
  save();
  return recap;
}
