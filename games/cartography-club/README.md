# Cartography Club

A standalone game variant, sibling to the base "Days Since Defect" game.
Same offline, zippable, no-build-step shape: open `index.html` or serve the
folder (`python3 -m http.server`), no server required.

Full spec: `../../docs/specs/cartography-club-spec.md`.

## What's fully working

- The Jumper Machine: logging sprint points charges toward the next jump,
  jumps happen automatically at threshold across all 12 biomes.
- Bits accrue in real time (`bitsPerDay`, same formula shape as the base
  game) and the Retrieve Artifact prop pulls a random unowned artifact
  once enough bits are banked.
- Defect reporting: one required post-mortem question, the configured
  jump/bits penalty applies, the clean streak resets.
- The finale (jump 12 + all 24 artifacts): fight the Temporal Paradox,
  win, and start a new season with a recap.
- Settings (sprint length, average points, season length) recompute the
  pacing dials the same way the base game does.
- All content (12 biomes, 24 artifacts) is exactly what's in the spec.

## Documented shortcuts (not full parity with the base game yet)

- **No art.** Biomes and artifacts render as plain text on colored
  backgrounds, no sprites. Swap in real art by extending `scene.js` and
  `room.css` to read image paths once assets exist; the data shape
  (`BIOMES`/`ARTIFACTS` in `src/data.js`) is already in the right order to
  drive that.
- **The finale is a simplified HP bar**, not the base game's full
  throw/impact-animation boss fight. `attackParadox()` in `machine.js` is
  a plain counter; port the animation from the base game's `boss.js` if
  you want the same visual flourish.
- **No season history / recap log**, defect post-mortems and season
  recaps are computed but shown via a plain `alert()`, not saved anywhere
  or given a proper modal. The base game's `features.js` (seasons tab,
  fridge magnets, fortune cookie) has no equivalent here at all.
- **No fortune cookie / to-do board / fridge magnets.** Those are base-game
  features not mentioned in this spec, intentionally left out.

## Run it

```
python3 -m http.server 8100
```

Then visit `http://localhost:8100/` (or open `index.html` directly).
