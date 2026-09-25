# Sprint Garden

A code skeleton for the Sprint Garden game variant. Spec:
`docs/specs/sprint-garden-spec.md` (read that first, this README covers
implementation status, not design).

Sprint points auto-plant flowers (16, in a fixed order); once planted,
every plant grows through 3 levels automatically as sprints are logged and
produces bits along the way. Enough banked bits auto-plants trees (8,
bigger and pricier). A logged defect is a pest event: every still-growing
plant skips its next level-up, no currency lost. Full Bloom (all 24 species
at level 3) ends the season.

## Run it

```
python3 -m http.server 8100
```

then visit `http://localhost:8100/games/sprint-garden/`, or just
double-click `index.html`.

## What's actually implemented

All the mechanics in the spec's sections 1-5 are real, not stubs:

- Threshold-based auto-planting for both flowers and trees, in list order.
- The per-plant production sum (`economy.js`), not a flat formula.
- The per-sprint growth tick, capped at level 3.
- Pest events that skip growth instead of costing points or bits.
- The Full Bloom completion check and a basic recap.

## What's a placeholder, not a shortcut in the mechanics

- **No art.** Plants render as labeled cards (name + level), not sprites.
  Swapping in real art means editing `renderPlantCard()` in `src/scene.js`
  and adding image rules to `src/room.css`; the data/state shape doesn't
  change.
- **`baseProduction` and `baseTreeCost` values in `src/data.js`/`src/state.js`
  are placeholders.** The spec fixes the shape (flowers low, trees high,
  trees cost more per copy owned) but not exact numbers; these need real
  playtesting to tune, same as the base game's formulas did.
- **The growth tick fires once per logged sprint**, not on a real-world
  clock, since there's no server and no reliable way to drive a timer from
  a static local file. This matches the spec's own framing ("every
  completed sprint").
- **No harvest-festival animation.** Full Bloom shows a plain text recap
  modal instead of reusing the base game's throw/impact code, that's real
  UI work, not core mechanics, and was left out of this skeleton pass.

## Explicitly NOT implemented

The spec's "Storm Event" (section 7) is deferred, not built here. It's a
genuinely new mechanic (a timed group-response window), not required to
ship Full Bloom at parity with the other two game variants, and the spec
itself calls it out as a later addition, not v1 scope.
