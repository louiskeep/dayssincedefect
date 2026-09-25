# Office Aquarium

A code skeleton for the "Office Aquarium" game variant of Days Since Defect.
Full mechanics spec: `../../docs/specs/office-aquarium-spec.md`.

Same offline, no-build-step, no-server model as the base game: plain
HTML/CSS/JS, state saved to `localStorage`, zippable and runnable straight
from a folder.

## Run it

```
python3 -m http.server 8100
```

then visit `http://localhost:8100/`, or just double-click `index.html`.

## What's real vs. what's a placeholder

**Fully implemented per spec:**
- Point-gated sequential fish reveal (`pointsPerFish` derived from season
  config, same shape as the base game's `ptsPerLevel`).
- Linear bits ("food") production scaling with fish owned.
- Feed the Tank: random owned fish, unseen-fact-first reveal with fallback to
  repeats, every-5th-feeding random hat drop onto a random fish.
- Defect reporting: docks a configurable percentage of banked food, resets
  the clean streak, never touches fish or hats.
- Reef-complete finish at fish 24, with a basic recap and a new-season reset
  that preserves season config.
- Season-length settings (sprint weeks, avg points, season sprints), same
  pattern as the base game.

**Placeholder / shortcut, flagged for follow-up:**
- **No art.** Fish render as colored circles with a text label
  (`.fbody`/`.card-fish` in `src/room.css`); hats render as a single emoji
  badge. Swap in real sprites by giving those classes a
  `background-image` instead of a flat color, one asset per fish/hat.
- **No room scene / prop layout.** The base game positions clickable props
  over a background illustration; this skeleton uses a plain three-button
  toolbar instead, since there's no art to position props over yet. The
  mechanics are the same, just simpler chrome.
- **Facts bank is partial.** Each fish has 3 facts (the spec calls for
  3-5). Good enough to prove the "don't repeat until exhausted" logic
  works; writing a fuller bank is a content pass, not an engineering one.
- **No fridge-style achievements, to-do wall, or fortune cookie.** The base
  game has these as extra room props; they weren't in the Aquarium spec, so
  they're left out rather than half-built.
- **Season history is stored but not browsable.** `newSeason()` pushes a
  recap into `S.seasonHistory`, but there's no settings-panel tab to view
  past seasons yet (the base game has one under its Seasons tab).
