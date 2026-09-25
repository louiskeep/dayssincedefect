/* Cartography Club: content tables. Pure data, no DOM, no state.
   Mirrors the base game's data.js shape (see docs/specs/cartography-club-spec.md). */

/* [name, flavor], one per Jumper Machine charge (12 total). */
const BIOMES = [
  ["The Primordial Cubicle", "before walls had corners, or feelings"],
  ["The Age of the Rotary Phone", "communication existed, technically"],
  ["The Fax Machine Epoch", "screaming across time itself"],
  ["The Great Water-Cooler Civilization", "where all real decisions were made"],
  ["The Cubicle-Farm Expansion", "a great flourishing of beige"],
  ["The First Standup", "nobody remembers why it's still 15 minutes"],
  ["The Reign of Clippy", "\"it looks like you're building a company\""],
  ["The Open-Office Uprising", "walls fell, headphones rose"],
  ["The Slack Enlightenment", "every thought, instantly regretted"],
  ["The Remote-Work Diaspora", "the office scattered across a thousand kitchens"],
  ["The AI Ascension", "the interns became prophets, briefly"],
  ["The Founders' Myth", "the era before anyone remembers what the company does"],
];

/* [name], one per artifact (24 total), retrieved in random order via the
   Retrieve Artifact prop. No separate flavor column, the name carries the joke. */
const ARTIFACTS = [
  "A rotary phone that only dials Karen from accounting",
  "A fax machine, eternally jammed",
  "The First Ergonomic Chair, cursed",
  "A stapler with a name (Milton's, allegedly)",
  "The Original Water Cooler, still gossiping",
  "A Rolodex containing one working number",
  "The First \"Reply All,\" preserved in amber",
  "A CRT monitor that only displays spreadsheets",
  "The Founding Whiteboard, never fully erased",
  "A landline with a cord long enough to reach the parking lot",
  "The First PowerPoint, 400 slides, never presented",
  "A time capsule labeled \"open when profitable\"",
  "The Original Company Mug, chipped, sacred",
  "A pager that still goes off at 3am",
  "The First Employee Handbook, mostly redacted",
  "A floppy disk labeled FINAL_v2_ACTUALFINAL",
  "The Ancient Vending Machine, demands exact change and worship",
  "A dot-matrix printer, still screeching somewhere",
  "The First Org Chart, drawn on a napkin",
  "A Nokia phone, indestructible, also lost",
  "The Original Foosball Table, one leg missing",
  "A VHS tape titled Company Values 1997",
  "The Sacred Beanbag Chair of the First Standup",
  "The Founders' Napkin, the actual original business plan",
];

const POSTMORTEM_Q = "What's one thing that would have caught this sooner?";
