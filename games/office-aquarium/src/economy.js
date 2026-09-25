/* Office Aquarium: economy: the fish-food income curve and number
   formatters. Pure functions over the global `S`; no DOM here. */

const ownedCount = () => S.fishOwned.filter(Boolean).length;
const daysSince = () => (Date.now() - S.start) / DAY;
const streakBonus = d => d >= 21 ? 1.3 : d >= 14 ? 1.2 : d >= 7 ? 1.1 : 1;
/* Linear, not exponential: there's no leveling person driving production here,
   just more fish in the tank eating more food. */
const bitsPerDay = () => Math.round(6 * (1 + 0.15 * ownedCount()) * streakBonus(daysSince()));
const FEED_COST = 10;

function accrue() {
  const now = Date.now();
  const dd = (now - S.last) / DAY;
  if (dd > 0) { S.bits += bitsPerDay() * dd; S.last = now; }
}

function fmtDur(ms) {
  const d = Math.floor(ms / DAY), h = Math.floor(ms % DAY / 3600000), m = Math.floor(ms % 3600000 / 60000);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function fmtBits(n) {
  n = Math.floor(Math.max(0, n));
  const units = ["", "Kb", "Mb", "Gb", "Tb"];
  let u = 0, v = n;
  while (v >= 1000 && u < units.length - 1) { v /= 1000; u++; }
  if (u === 0) return n.toLocaleString();
  const disp = x => x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2);
  let s = disp(v);
  if (+s >= 1000 && u < units.length - 1) { v /= 1000; u++; s = disp(v); }
  return s + " " + units[u];
}
function fmtBitsWord(n) { const s = fmtBits(n); return /[A-Za-z]/.test(s) ? s : s + " food"; }
