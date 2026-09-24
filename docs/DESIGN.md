# Days Since Last Incident — design decisions

> **v3 (current, BUILT).** Simplified per `screwup-game-spec-v3.md`, in
> `v3.html` / `v3.css` / `v3.js`. Sprint points → levels → one character per level
> (roster of 20) → bits/day = 2^level; a no-duplicate 60-item chest
> (`spinCost = 8 × 1.23^s`); dress-up from chest loot; defect = -30% bits + counter
> reset; Defect Dragon at level 20 (throw-everything animation + VICTORY screen +
> new-season prestige). Cartoon skin; placeholder emoji crew awaiting Higgsfield
> stickers. Play at `/v3.html`. v2 (`v2.html`) and v1 (`index.html`) kept as history.

---

> **v2 pivot (superseded by v3).** Cam's reference `reference.png` reframes the
> game as an **idle dashboard** ("Data Ops"): the reference set the layout +
> economy; the skin is now a **bright cartoon** theme (Cam's call, replacing the
> dark 16-bit terminal look) — chunky sticker panels, bold outlines, candy colors,
> rounded fonts (Fredoka/Baloo). Built in `v2.html` / `v2.css` / `v2.js` (v1 sticker
> prototype kept in `index.html`). Two currencies:
> **bits** idle-accumulate by the clock (workers × decoration multipliers ×
> permanent bonuses); **Sprint Points** are entered manually at each retro (~50/
> sprint, tickets closed) and hire **workers** (roles: Code Review, Debugging, Data
> Entry, Testing, Sysadmin, Documentation). Stations upgrade with bits; decorations
> give +% all-bits; streak length grants permanent % bonuses. Shipping a **defect
> = -30% bits + streak reset** (default, retunable). **Win gate:** all workers hired
> + each has an outfit + an activity + enough decoration → **Defect Dragon** boss
> (mechanic TBD; Cam's placeholder: the crew throws all decorations at it, it
> explodes, you win). **Art:** hybrid — placeholder pixel now, swap Higgsfield-
> generated scene/worker art into the same slots later. Long arc: 12-24 sprints
> (6-12 months). Economy numbers are first-pass and need tuning.

---


A low-stress standup game for a database / data-science team. Clean days earn
**bits** for the whole team; spend them together on characters, outfits,
activities, and decorations, and arrange a living diorama shelf. Report an
incident and the streak resets, but the collection is never lost. Re-skin of the
original `screwup-game-spec.md`.

## Locked decisions

- **Currency: bits.** Bank formats by size (`b` → `Kb` → `Mb`). Reaching 1 Kb
  (1,024 bits, roughly a year clean) is its own milestone.
- **Accrual = streak tier + crew.** Streak tier: 1 b/day for days 1-7, 2 b/day
  for 8-30, 3 b/day from day 31. **Crew income:** every owned character earns
  +1 bit/day since the day it joined (`since` per character) — the Cookie-Clicker
  loop, more characters means faster bits. Board shows the split ("10 b/day · 1
  streak + 9 crew"). On an incident, earned bits (tier + milestone + crew) bank
  first, then the streak and every character's `since` reset to today, so nothing
  is lost and the rate rebuilds.
- **Decorate tab.** A slide-up bar: switch the owned background, and drag owned
  decorations from a tray onto the shelf (double-click a placed item to remove).
  Buying a decoration adds it to inventory; you place it from Decorate.
- **Sandbox unlock.** Settings → 🔓 Unlock everything grants all characters +
  items + 5,000 bits for free experimentation.
- **Milestones:** 7d +5 · 14d +10 · 30d +25 (Chrome Hard Hat) · 50d +50 (Trophy)
  · 100d +100 (gilded skin). Bonuses re-earn each streak; unlocks are permanent.
- **Look: Bright Sticker Shelf.** Light, warm, glossy die-cut stickers on a
  wooden shelf. Cohesive inline-SVG character art (swap for Higgsfield-generated
  art in the polish pass).
- **9 characters** with data-team names: Norm (Gnome, free) · Goodboy (Dog, 40) ·
  Grok (Caveman, 40) · Stack (Programmer, 40) · Gantt (PM, 40) · Cron (Robot, 75)
  · Sir Query (Warrior, 75) · Null (Alien, 75) · Merlint (Wizard, 150).
- **Dress-up = 3 slots per character:** hat, outfit, activity. Activities loop
  (coding types, coffee sips, biking rolls, RCA ticket flutters, nap drifts,
  rubber-duck debugging bobs).
- **Shelf = free diorama.** Drag characters and decorations anywhere; positions
  saved per item. Decorations are placeable props + whole-shelf backdrops.
- **Cosmetics: own once, use anywhere** (single manager, no grind).
- **Incidents record a note** → incident log in Settings.
- **Sync:** offline, one source-of-truth screen; copy/paste **team code**
  (base64 of full state) to back up or hand off the host.
- **Shipped as a zippable folder** (`index.html` + `styles.css` + `game.js` +
  `catalog.js` + `assets/`).

## Build status

- Phases 1-5 wired in v0.1: bit economy, store + buying, diorama shelf with
  drag, dress-up + activities, incident + milestone flow with confetti,
  settings + team code + incident log.
- **v0.2 art upgrade (`art.js`):** flat stickers replaced with a paper-doll
  **rig**. Every character is built from shared anchored parts, so outfits,
  hats, activities, expressions, and idle behaviours are authored once and work
  on all 9. Live now: universal outfits (cape/lab coat/scarf/hawaiian/hero),
  activities as arm-pose + held-prop + loop (coding, coffee, biking, RCA,
  napping, debugging), idle micro-behaviours (blink, glance, head-scratch,
  yawn, natter), post-incident "oof" face, gold skin, signature default hats.
- **v0.3:** crew-income economy, Decorate tab (background switch + drag-to-place
  decorations + double-click remove), sandbox unlock button.
- **Art direction: on hold.** Cam rejected both the flat-sticker and the
  Paper-Mario/pixel proofs (see `style-lab.html`); he is making his own style
  reference. When it lands, re-skin the rig in `art.js` to match (the rig, dress-up,
  activities, and idle behaviours stay; only the drawing changes).
- **Next:** apply Cam's art reference, more activities/decor content, sound.

## Art architecture (the cohesive method)

`art.js` is a paper-doll engine. `buildCharacter(cid, {hat,outfit,activity,
gold,oof})` composes one SVG on a fixed grid (viewBox 0 0 100 132) with shared
anchors (head 50,58 · hat seat 50,40 · torso 30..70 · right hand 72,108).
Outfits draw to the torso box, hats to the hat seat, activities pose the front
arm + fill the held slot. CSS classes on the root `.char` drive expressions and
poses (`transform-box: view-box`). The idle ticker in `game.js` toggles those
classes at random. Higgsfield art later fills the same slots as textures.

## Run it (dev)

Static files, no build. From this folder:
`python3 -m http.server 8099 --bind 0.0.0.0` then open
`http://192.168.4.55:8099/`. Edit a file and refresh; no rebuild.

`DEMO-CODE.txt` holds a team code that loads a populated shelf for demos.
