/* ============================================================================
   catalog.js  —  all game content: characters, cosmetics, activities, decor.
   Data only. Prices are in "bits". Edit freely; game.js reads from here.
   ============================================================================ */

/* The 9 collectible characters. `starter: true` is owned for free on day one.
   `art` maps to an SVG builder in game.js (drawCharacter). */
const CHARACTERS = [
  { id: "gnome",   name: "Norm",      kind: "Gnome",           band: "Starter",   price: 0,   starter: true,
    wink: "Keeps the garden and the git history tidy." },
  { id: "dog",     name: "Goodboy",   kind: "Dog",             band: "Common",    price: 40,
    wink: "Has never once caused an incident. Allegedly." },
  { id: "caveman", name: "Grok",      kind: "Caveman",         band: "Common",    price: 40,
    wink: "Just discovered SQL. Extremely excited about it." },
  { id: "coder",   name: "Stack",     kind: "Programmer",      band: "Common",    price: 40,
    wink: "90% coffee, 10% stack traces." },
  { id: "pm",      name: "Gantt",     kind: "Project Manager", band: "Common",    price: 40,
    wink: "Will move the deadline, never the scope." },
  { id: "robot",   name: "Cron",      kind: "Robot",           band: "Uncommon",  price: 75,
    wink: "Runs like clockwork. Complains only in the logs." },
  { id: "warrior", name: "Sir Query", kind: "Warrior",         band: "Uncommon",  price: 75,
    wink: "Slays the N+1. Fears the full table scan." },
  { id: "alien",   name: "Null",      kind: "Alien",           band: "Uncommon",  price: 75,
    wink: "Nobody knows what it does. Returns unexpectedly." },
  { id: "wizard",  name: "Merlint",   kind: "Wizard",          band: "Legendary", price: 150,
    wink: "Turns spaghetti into clean code. Usually." },
];

/* Hats + outfits share one "cosmetic" pool with a `slot`. Own once, wear on
   anyone, one per slot per character. Rendered as a labelled sticker badge for
   now; upgraded to drawn art in the polish pass. */
const COSMETICS = [
  // hats
  { id: "hardhat",   name: "Hard Hat",       slot: "hat",    price: 8,  glyph: "⛑️" },
  { id: "party",     name: "Party Hat",      slot: "hat",    price: 6,  glyph: "🎉" },
  { id: "crown",     name: "Crown",          slot: "hat",    price: 15, glyph: "👑" },
  { id: "tophat",    name: "Top Hat",        slot: "hat",    price: 12, glyph: "🎩" },
  { id: "propeller", name: "Propeller Cap",  slot: "hat",    price: 10, glyph: "🪀" },
  // outfits
  { id: "cape",      name: "Cape",           slot: "outfit", price: 25, glyph: "🦸" },
  { id: "labcoat",   name: "Lab Coat",       slot: "outfit", price: 35, glyph: "🥼" },
  { id: "hawaiian",  name: "Hawaiian Shirt", slot: "outfit", price: 30, glyph: "🌺" },
  { id: "scarf",     name: "Scarf",          slot: "outfit", price: 20, glyph: "🧣" },
  { id: "hero",      name: "Hero Suit",      slot: "outfit", price: 45, glyph: "🦹" },
];

/* Activities: a looping behaviour assigned to a character's activity slot.
   `glyph` is the little prop; `anim` is a CSS class applied to that prop. */
const ACTIVITIES = [
  { id: "coding",    name: "Coding",         price: 20, glyph: "💻", anim: "act-type",  blurb: "typing away" },
  { id: "coffee",    name: "Coffee Break",   price: 15, glyph: "☕", anim: "act-sip",   blurb: "sipping coffee" },
  { id: "biking",    name: "Biking",         price: 25, glyph: "🚲", anim: "act-roll",  blurb: "going for a ride" },
  { id: "rca",       name: "Writing an RCA", price: 20, glyph: "🎫", anim: "act-float", blurb: "closing a ticket" },
  { id: "napping",   name: "Napping",        price: 15, glyph: "💤", anim: "act-drift", blurb: "taking a nap" },
  { id: "debugging", name: "Debugging",      price: 20, glyph: "🦆", anim: "act-bob",   blurb: "rubber-duck debugging" },
];

/* Decorations. `kind: "prop"` are draggable objects on the shelf.
   `kind: "backdrop"` swaps the whole scene. `plain` backdrop is owned free. */
const DECORATIONS = [
  { id: "plant",     name: "Potted Plant",         kind: "prop", price: 20, glyph: "🪴" },
  { id: "picture",   name: "Framed Graph",         kind: "prop", price: 25, glyph: "🖼️" },
  { id: "lavalamp",  name: "Lava Lamp",            kind: "prop", price: 30, glyph: "🔮" },
  { id: "minirack",  name: "Mini Server Rack",     kind: "prop", price: 40, glyph: "🗄️" },
  { id: "lights",    name: "Fairy Lights",         kind: "prop", price: 35, glyph: "✨" },
  { id: "candle",    name: "'Prod is Fine' Candle",kind: "prop", price: 30, glyph: "🕯️" },
  { id: "snacks",    name: "Snack Bowl",           kind: "prop", price: 15, glyph: "🍿" },

  { id: "plain",      name: "Plain Shelf",  kind: "backdrop", price: 0,  starter: true, css: "bd-plain" },
  { id: "office",     name: "Cozy Office",  kind: "backdrop", price: 60, css: "bd-office" },
  { id: "datacenter", name: "Data Center",  kind: "backdrop", price: 80, css: "bd-datacenter" },
  { id: "night",      name: "Night Mode",   kind: "backdrop", price: 50, css: "bd-night" },
];

/* Streak milestones: one-time bit bonus + (sometimes) a permanent unlock.
   Bonuses re-earn on each fresh streak; `unlock` items stay forever. */
const MILESTONES = [
  { days: 7,   bonus: 5,   unlock: null,        label: "One clean week" },
  { days: 14,  bonus: 10,  unlock: null,        label: "Two weeks strong" },
  { days: 30,  bonus: 25,  unlock: "chromehat", label: "A whole month" },
  { days: 50,  bonus: 50,  unlock: "trophy",    label: "Fifty days" },
  { days: 100, bonus: 100, unlock: "gilded",    label: "Triple digits" },
];

/* Permanent, unbuyable rewards granted by milestones. */
const MILESTONE_ITEMS = {
  chromehat: { name: "Chrome Hard Hat", slot: "hat", glyph: "⛑️", shiny: true },
  trophy:    { name: "Golden Trophy",   kind: "prop", glyph: "🏆" },
  gilded:    { name: "Solid-Gold Skin", kind: "skin", glyph: "✨" },
};

/* Daily accrual tiers (bits per clean day). */
const ACCRUAL_TIERS = [
  { upTo: 7,        perDay: 1 },
  { upTo: 30,       perDay: 2 },
  { upTo: Infinity, perDay: 3 },
];
