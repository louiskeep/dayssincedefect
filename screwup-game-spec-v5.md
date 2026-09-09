# Days Since Last Screwup: Spec v5 (the transformation)

*One office coder. Sprint points level him up, and every level bolts on gear that
turns him from a polo-shirted drone into a ridiculous cyborg warlord. Bits open
chests full of items. At the top level he loads every item into his backpack gun
and blasts the Defect Dragon.*

Two inputs (sprint points, bits), one visible hero who transforms, one finish.
Tuned for a **~3 month first run (12 levels)**, and built **modular** so a new art
pack re-themes the whole game for another season.

---

## 1. The loop

Every ~2 weeks at retro:

1. **Enter sprint points** → level up. Each level **bolts a new upgrade onto the
   character** (a visible transformation), plays a **level-up celebration**, and
   gives **+50% bits/day**.
2. **Bits** pile up automatically. **Spend bits on the chest** to collect **items**
   he can hold and use.
3. At **the top level with all items collected**, he loads everything into his
   backpack gun and **blasts the Defect Dragon**. Win, finish.

| Currency | Source | Spends on |
|---|---|---|
| **Sprint Points** | typed at retro | **levels** (character upgrades + bits multiplier) |
| **Bits** | generated per day | **chest** items (the ammo you need to win) |

Win condition: **max level AND all 24 chest items**, then fire the whole collection
at the Dragon. Short on items, not enough firepower, you lose and keep collecting.

---

## 2. Levels are the character (sprint points)

12 levels, gentle ladder, so a typical team finishes in about three months.

```
pointsToClear(L) = 12 + 2L          →  L1 = 14, L2 = 16, … L11 = 34
cumulativeSP(L)  = sum of pointsToClear(1..L-1)          // 264 total to level 12
bitsPerDay       = BASE × 1.5 ^ level × streakBonus       // +50% per level
```

At 40 pts/sprint the team reaches **level 12 around sprint 7 (~3.3 months)**; a
faster team is quicker. Each level: a **celebration**, **+50% bits/day**, and the
next **upgrade**.

### The 12 upgrades (office coder to power suit)

Base character: **office-1** (navy polo, lanyard, jeans, sneakers). **Levels change
HIM only** (worn / on-body); the cubicle and its stuff come from items (§4).
Canonical list + joke stats in `screwup-game-content.md`; summary:

| Lv | Upgrade (on him) | Lv | Upgrade (on him) |
|--:|---|--:|---|
| 1 | Button-down shirt | 7 | Cyborg eyes |
| 2 | Slacks | 8 | Suspicious black backpack (the gun) |
| 3 | Dress shoes | 9 | Robot arm |
| 4 | Blue-light glasses | 10 | Wifi antenna |
| 5 | Company t-shirt | 11 | Company credit card |
| 6 | Crossfit (buff) | 12 | Power suit (huge mech) |

**The Promotion (finale):** at level 12 with all 24 items, the banner drops
("PROMOTION! Your new role: defeat the Defect Dragon"), the backpack unfolds into
the cannon, and he fires every cubicle item at the Dragon.

Each level is one full-body sprite (same guy + accumulated gear, no desk/props)
that cross-fades in with a flash (§6).

---

## 3. Bits and the clean streak

- **Production** `= 1.5^level × streakBonus`, accrued by the calendar.
- **Streak bonus:** 7 clean days ×1.1, 14 ×1.2, 21+ ×1.3; a defect resets it to
  ×1.0. Chest is priced on base production, so a clean streak buys more spins.
- **Report a defect** takes 30% of bits and resets the "days since last screwup"
  counter + streak; levels and items are untouched.

---

## 4. The chest: items (bits)

- A **Spin** gives one new, unowned **item** he can hold/use. **24 items total.**
- Priced on production so it finishes with the levels:

```
spinCost = (BASE × 1.5^level) × (2 + 0.18 × itemsOwned)     // ~2 to 6 days of output
```

- At 40 pts/sprint this **completes around sprint 6**, right as level 12 lands, so
  **levels and items finish together**.
- Every item **appears in his cubicle** (furniture, desk gear, decor); the cubicle
  fills from bare to packed as you collect. Each item is also **ammo**: one item =
  **1 shot / -1 HP** in the finale. Full list in `screwup-game-content.md`.

No tickets, no circus, no swappable backgrounds. One fixed scene (his cubicle);
bits buy the items that fill it, and those items are the win material.

---

## 5. The finish: load the gun, blast the Dragon

- **Unlocks at level 12 with all 24 items.**
- The cyborg **loads every item into the backpack gun** and fires them at the
  Defect Dragon. **Each item = 1 shot, -1 HP. Dragon HP = 24.** All 24 = exactly
  enough; short of the set you can't finish it and lose (go collect more).
- On the kill: explosion, confetti, **VICTORY**, and a **season report card** (sprint
  points, best streak, screwups, items, sprints).
- **Finish.** Optional new season keeps a prestige badge (or start a new *theme*, §8).

---

## 6. Feasibility + art (browser)

Fully browser-native, no server, still a zippable folder:

- **Character:** transparent PNG sprites from Higgsfield, generated with office-1 fed
  back as an `image_references` anchor so the guy stays consistent while gaining gear.
  Milestone transformations cross-fade with a level-up flash; a light CSS/JS rig gives
  idle bob, blink, and an item-hold pose.
- **Items:** transparent PNG props that appear in the fixed cubicle scene (desk,
  shelves, walls, floor) as bought; draggable. No swappable backgrounds in v1.
- **Boss:** DOM/canvas animation (backpack gun fires item projectiles, HP bar,
  confetti). Standard, performant.
- **Pipeline:** generate in Higgsfield (~2 credits/image), background-remove, drop
  into the theme's asset folder.

Volume: base (done), 12 level sprites, 24 cubicle-item props, the empty cubicle, the dragon.

---

## 7. Modular theme packs (replay with new art)

The engine is data-driven so a new **theme pack** re-skins the whole game without
touching code. A pack is a folder plus a small config:

```
themes/coder-cyborg/
├── theme.json        // name, 12 levels (label + stat + sprite), 24 items, dragon, scene
└── assets/           // level-01.png … level-12.png, item-*.png, dragon.png, scene.png
```

`theme.json` names each level's upgrade + joke stat + sprite file, the 24 items, the
dragon, and the background. Swap the folder (new generated art + edited config) and
the same engine runs a fresh campaign: a wizard leveling into an archmage, an intern
into a CEO, a knight into a dragon-slayer. The economy math is theme-independent.

The build reads the active theme at load, so "run it again with a new theme" is:
generate a new pack, point the game at it, play. No engine changes.

---

## 8. What changed from earlier

- **12 levels, ~3 month run** (was 20 / ~6 months); gentler ladder.
- **Levels transform the character** (office to cyborg), not an abstract multiplier.
- **Tickets and the circus removed.** One earned currency (bits), one manual input.
- **Chest = 24 items**, the ammo and the toys; Dragon HP 24; finish is a backpack-gun
  barrage.
- **Modular theme packs** so the game re-skins and replays.
- **Base character locked:** office-1.

Reused: `1.5^level` production, streak bonus, income-tied chest price and the
"levels + items finish together" pacing, the -30% defect, the season report.

---

## 9. Open (minor)

- Art for the 12 upgrades and 24 items (generate + approve as we go).
- Whether joke stats just flavor popups or roll into a shown "Power" score.
- Whether a won season resets, ends, or rolls into a new theme.
