/* Office Aquarium: the game-specific mechanics: logging a sprint (fish
   reveal), feeding the tank (fact reveal + occasional hat drop), reporting a
   defect, and the reef-complete finish. Pure state changes; scene.js renders
   the result and modals.js opens/fills the dialogs. */

/* ---------- log a sprint: reveal the next fish ---------- */
function doLog(points) {
  const n = Math.max(1, Math.min(999, points || 0));
  S.points += n;
  S.seasonPoints = (S.seasonPoints || 0) + n;
  S.sprintsLogged = (S.sprintsLogged || 0) + 1;
  let revealed = -1;
  while (revealed === -1) {
    const nextIdx = ownedCount();
    if (nextIdx >= 24) break;
    if (S.points < S.pointsPerFish * (nextIdx + 1)) break;
    S.fishOwned[nextIdx] = true;
    revealed = nextIdx;
  }
  save();
  checkReefComplete();
  return revealed;   // -1 if no new fish this sprint, else the fish index revealed
}

/* ---------- feed the tank: one click, no fish picking ---------- */
function feedTank() {
  if (S.bits < FEED_COST) return null;
  const owned = []; S.fishOwned.forEach((o, i) => { if (o) owned.push(i); });
  if (owned.length === 0) return null;
  S.bits -= FEED_COST;
  S.feedCount = (S.feedCount || 0) + 1;

  const fishIdx = owned[Math.floor(Math.random() * owned.length)];
  const facts = FISH[fishIdx][2];
  const seen = S.fishSeenFacts[fishIdx] || (S.fishSeenFacts[fishIdx] = []);
  let factIdx, isNew = false;
  const unseen = facts.map((_, i) => i).filter(i => !seen.includes(i));
  if (unseen.length > 0) {
    factIdx = unseen[Math.floor(Math.random() * unseen.length)];
    seen.push(factIdx); isNew = true; S.factsLearned = (S.factsLearned || 0) + 1;
  } else {
    factIdx = Math.floor(Math.random() * facts.length);
  }

  let hatAwarded = null;
  if (S.feedCount % 5 === 0) {
    const unownedHats = []; S.hatsOwned.forEach((o, i) => { if (!o) unownedHats.push(i); });
    if (unownedHats.length > 0) {
      const hatIdx = unownedHats[Math.floor(Math.random() * unownedHats.length)];
      S.hatsOwned[hatIdx] = true;
      const bareFish = owned.filter(i => S.fishHat[i] == null);
      const targetFish = (bareFish.length > 0 ? bareFish : owned)[Math.floor(Math.random() * (bareFish.length > 0 ? bareFish.length : owned.length))];
      S.fishHat[targetFish] = hatIdx;
      S.hatsFound = (S.hatsFound || 0) + 1;
      hatAwarded = { hatIdx, fishIdx: targetFish };
    }
  }

  save();
  return { fishIdx, factIdx, isNew, hatAwarded };
}

/* ---------- report a defect: dock food, reset the clean streak ---------- */
function doDefect() {
  const d = Math.floor(daysSince()); if (d > S.best) S.best = d;
  const foodLost = Math.floor(S.bits * S.defBits / 100);
  S.screwups++; S.bits -= foodLost; S.start = Date.now(); S.last = Date.now();
  save();
  return foodLost;
}

/* ---------- the reef is complete ---------- */
function checkReefComplete() {
  if (S.reefComplete || ownedCount() < 24) return false;
  S.reefComplete = true;
  save();
  return true;
}

function recordSeason() {
  return {
    ts: Date.now(), points: S.seasonPoints || 0, sprints: S.sprintsLogged || 0,
    defects: S.screwups || 0, fish: ownedCount(), hats: S.hatsFound || 0,
    facts: S.factsLearned || 0, complete: S.reefComplete,
  };
}
function newSeason() {
  const hadActivity = (S.sprintsLogged || 0) > 0 || ownedCount() > 0 || S.screwups > 0;
  const ended = hadActivity ? recordSeason() : null;
  const keep = {
    sprintWeeks: S.sprintWeeks, avgPoints: S.avgPoints, seasonSprints: S.seasonSprints,
    pointsPerFish: S.pointsPerFish, defBits: S.defBits,
    seasonHistory: ended ? [...(S.seasonHistory || []), ended] : (S.seasonHistory || []),
  };
  S = defState(); Object.assign(S, keep); S.seasonStart = Date.now();
  save();
  return ended;
}
