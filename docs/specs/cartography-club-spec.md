# Cartography Club: Spec v1

*A time-jumping expedition club charges up the Jumper Machine with sprint
points, leaping through 12 mythical eras of the office. Bits earned along
the way retrieve 24 artifacts pulled out of time.*

Same two levers as the base game (sprint points, days between sprints), same
one-input-plus-one-prop interaction model. Built for one operator (PO or
scrum master) to run in under a minute before sprint review: type points,
click log, watch what reveals. No menus, no picking.

## 1. The loop

Every sprint at retro:

1. **Enter sprint points** into one field, click log. If enough charge has
   built up, the Jumper Machine **jumps to the next mythical biome**,
   playing a jump animation and revealing the new era's name and one-line
   flavor. This is the whole PO action for the sprint.
2. **Bits accrue automatically** between sprints, same as the base game's
   idle income. Whenever the operator (or anyone) clicks the **Retrieve
   Artifact** prop and enough bits are banked, one random unowned artifact
   is pulled from across time and revealed. One button, no menu, no choice
   of which artifact.
3. At **jump 12 with all 24 artifacts retrieved**, the machine overloads:
   the team fires every artifact into the timestream to seal the loop shut.
   Season ends, recap shown.

| Currency | Source | Spends on |
|---|---|---|
| **Sprint Points** | typed at retro | charges the Jumper Machine → biome jumps |
| **Bits** | accrue per day | Retrieve Artifact prop → random artifact |

## 2. The Jumper Machine (sprint points)

Identical math to the base game's level ladder, renamed:

```
chargeToJump(J) = ptsPerLevel                // flat, from season config
```

`ptsPerLevel = round(avgPoints * seasonSprints / 12)`, same formula as
`state.js`. A typical team (30 pts/sprint, 6-sprint season) reaches jump 12
in about 6 sprints, same pacing as the live game.

### The 12 mythical office biomes

| Jump | Biome | Flavor |
|--:|---|---|
| 1 | The Primordial Cubicle | before walls had corners, or feelings |
| 2 | The Age of the Rotary Phone | communication existed, technically |
| 3 | The Fax Machine Epoch | screaming across time itself |
| 4 | The Great Water-Cooler Civilization | where all real decisions were made |
| 5 | The Cubicle-Farm Expansion | a great flourishing of beige |
| 6 | The First Standup | nobody remembers why it's still 15 minutes |
| 7 | The Reign of Clippy | "it looks like you're building a company" |
| 8 | The Open-Office Uprising | walls fell, headphones rose |
| 9 | The Slack Enlightenment | every thought, instantly regretted |
| 10 | The Remote-Work Diaspora | the office scattered across a thousand kitchens |
| 11 | The AI Ascension | the interns became prophets, briefly |
| 12 | The Founders' Myth | the era before anyone remembers what the company does |

Each jump swaps the room's background art to that era (one full-scene
illustration, no character sprite needed the way the base game has a
leveling hero, the room itself IS the thing that transforms).

## 3. Bits and the Retrieve Artifact prop

Identical formula to the base game's `bitsPerDay`/`spinCost`, renamed:

```
bitsPerDay = 8 * 1.5^jump * streakBonus(daysSinceLastDefect) * artifactBonus(owned)
retrieveCost = round(bitsPerDay * baseDays * (0.9 + 0.2 * owned/23))
```

Defect handling: identical shape to the base game's configurable
`defBits`/`defLevels`/`defAll` (a logged defect costs a chunk of banked
bits and resets the clean streak). No new penalty mechanic needed.

### The 24 artifacts from across time

| # | Artifact | Flavor |
|--:|---|---|
| 1 | A rotary phone that only dials Karen from accounting | |
| 2 | A fax machine, eternally jammed | |
| 3 | The First Ergonomic Chair, cursed | |
| 4 | A stapler with a name (Milton's, allegedly) | |
| 5 | The Original Water Cooler, still gossiping | |
| 6 | A Rolodex containing one working number | |
| 7 | The First "Reply All," preserved in amber | |
| 8 | A CRT monitor that only displays spreadsheets | |
| 9 | The Founding Whiteboard, never fully erased | |
| 10 | A landline with a cord long enough to reach the parking lot | |
| 11 | The First PowerPoint, 400 slides, never presented | |
| 12 | A time capsule labeled "open when profitable" | |
| 13 | The Original Company Mug, chipped, sacred | |
| 14 | A pager that still goes off at 3am | |
| 15 | The First Employee Handbook, mostly redacted | |
| 16 | A floppy disk labeled FINAL_v2_ACTUALFINAL | |
| 17 | The Ancient Vending Machine, demands exact change and worship | |
| 18 | A dot-matrix printer, still screeching somewhere | |
| 19 | The First Org Chart, drawn on a napkin | |
| 20 | A Nokia phone, indestructible, also lost | |
| 21 | The Original Foosball Table, one leg missing | |
| 22 | A VHS tape titled Company Values 1997 | |
| 23 | The Sacred Beanbag Chair of the First Standup | |
| 24 | The Founders' Napkin, the actual original business plan | |

Retrieved artifacts sit on a display shelf in the current-era room, visible
and browsable anytime, no interaction required to view them.

## 4. The finish: seal the loop

- Unlocks at jump 12 with all 24 artifacts retrieved.
- Reuses the base game's throw/impact/HP-bar boss-fight code exactly
  (`boss.js`), re-skinned: the team fires all 24 artifacts into the
  timestream at a target called **The Temporal Paradox**, HP 24, one
  artifact per hit, same win/confetti/recap flow.
- Season report card, same fields as today (points, streak, defects,
  artifacts, sprints), plus jump count.

## 5. Feasibility + art

Same production model as the base game: transparent PNG sprites, one
full-scene background per biome (12), one artifact icon per item (24), one
paradox-boss sprite. No new engine mechanics, this is the cheapest of the
three specs to build.

## 6. Modularity note

This is intentionally the same underlying engine as the live game
(`screwup-game-spec-v5.md`), just with a stronger narrative device: the
Jumper Machine literalizes "leveling up" as time travel, and biomes/
artifacts replace gear/bobbleheads. Zero new state fields, zero new
formulas. Unlike Office Aquarium and Sprint Garden (separate specs), this
one needs no new economy code, only new content and art.
