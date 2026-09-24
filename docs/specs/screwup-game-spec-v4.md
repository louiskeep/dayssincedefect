# Days Since Last Screwup: Spec v4 (single-character idle)

*One dev. The whole team upgrades him. Sprint points raise his level and
multiply his bits, bits and tickets fill his shelf with items, and when every
level and every item is unlocked the team throws the whole collection at the
Defect Dragon to win.*

The shift from v3: **one character, not twenty.** Everyone pours into the same
little guy idling at the bottom of the screen in a dungeon-crawler office, and the
goal is a clean finish line: unlock all levels, collect all items, beat the
Dragon, done.

---

## 1. The loop

Every ~2 weeks at retro the team enters two numbers, then spends between check-ins:

1. **Enter sprint points** → advance **levels** (if you have enough). Each level
   plays a little **level-up celebration**, multiplies **bits/day**, and adds a
   piece of gear to his setup.
2. **Enter tickets completed (5-25)** → spend at the **circus**.
3. **Bits** pile up automatically from his multiplier. **Spend bits** on the
   **chest** (regular items) and **tickets** on the **circus** (bit bursts + special
   items).
4. **Unlock all levels and all items**, then **fight the Defect Dragon**: throw the
   whole collection at it. Win, finish.

Three currencies:

| Currency | Source | Spends on |
|---|---|---|
| **Sprint Points** | typed at retro | **levels** (multiplier + gear) |
| **Bits** | generated per day | **chest** items (the ones you need to win) |
| **Tickets** | typed at retro (5-25) | **circus** wheel (bit bursts + 10 special items) |

Win condition, explicitly: **all levels unlocked AND all 40 chest items collected**,
then throw everything at the Dragon. Miss items and you die, so the whole run is
about finishing the collection.

---

## 2. The character and his scene

The heart of v4. One model, so we make it great.

- **One base character**, **dungeon-crawler Paper Mario style**: flat paper
  cut-out with a bold ink outline and a standee shadow, in a little dungeon-office
  (torches, stone, a desk). Built in Higgsfield (see §8).
- **Animated with a light code rig** (not generated video): the paper sprite
  breathes, blinks, glances, and reacts. Cheap and fully controllable.
- **His shelf / canvas** is the bottom of the screen. Items live there. You can
  **drag any item around the canvas**, or **hand an item to the character** and he
  starts using it: puts on a hat, sips a coffee, sits at a computer, waves a foam
  sword. Handing him an item sets his idle activity.
- **Gear from levels** builds his battlestation in the scene (laptop, monitors,
  server rack). **Items from the chest/circus** are the collectible props he wears
  and plays with. **Backgrounds** swap the whole scene (dungeon, office, space
  station), unlocked as items.

---

## 3. Levels: the multiplier (sprint points)

Levels are unlocked only with sprint points. The ladder is reused from v3:

```
pointsToClear(L) = 38 + 2L          →  L1 = 40, L2 = 42, … L19 = 76
cumulativeSP(L)  = (L − 1) × (38 + L)      // 1,102 total to level 20
```

At **40 pts/sprint the team reaches level 20 at sprint 28**. Each level:

- plays a **level-up animation + celebration**,
- gives **+50% bits/day** (a ×1.5 multiplier step),
- **adds the next piece of gear** to his setup.

```
bitsPerDay = BASE × 1.5 ^ level × streakBonus         // BASE = 2
```

(+50% per level is Cam's call; it keeps level-ups feeling frequent and good. The
multiplier does not change collection pacing, because the chest is priced in days
of production, §6, so this stays a pure feel knob. Dial toward ×2 later if we want
grander data-scale numbers.)

### The 20 gear upgrades (one per level)

| Lv | Gear | Lv | Gear |
|--:|---|--:|---|
| 1 | Beat-up laptop | 11 | Server rack |
| 2 | Cup of coffee | 12 | Dual-GPU tower |
| 3 | Second monitor | 13 | Liquid-cooled rig |
| 4 | Mechanical keyboard | 14 | Private cluster |
| 5 | Ergonomic chair | 15 | Holo-display |
| 6 | Desk plant | 16 | AI copilot orb |
| 7 | Standing desk | 17 | Quantum core |
| 8 | Mechanical mouse | 18 | Neural uplink |
| 9 | Studio headphones | 19 | Data crown |
| 10 | Rubber duck | 20 | The Singularity Engine |

---

## 4. Bits and the clean streak

- **Production** accrues by the calendar (catches up while the team is away).
- **Clean-streak bonus** (reused): 7 clean days ×1.1, 14 days ×1.2, 21+ days ×1.3;
  a defect resets it to ×1.0. Priced on base production, so a clean streak buys
  more spins.
- Bits do exactly one thing: buy chest items.

---

## 5. Screwups

- **Report a defect** takes 30% of bits and resets the "days since last screwup"
  counter and the streak bonus. Levels, gear, and items are untouched.
- The counter, best streak, and reset count sit at the top of the screen.

---

## 6. Items: the chest and the circus

Two sources, and the split matters for the ending.

### Chest (bits): the 40 you need

- A **Spin** gives one new, unowned **regular item**. **40 items total.**
- Priced on production so it never goes trivial and completes with the levels:

```
spinCost = (BASE × 1.5^level) × (8 + 0.2 × itemsOwned)      // 8 to ~16 days of output
```

- At 40 pts/sprint this **completes around sprint 29**, right as level 20 lands, so
  **levels and items finish together** and the Dragon opens when both are done.
- Regular items are the win material: each one is **-1 HP** in the fight.

### Circus (tickets): 10 special extras

- **1 ticket a spin** (tickets stay flat, ~8/sprint, so circus pricing is constant).
- Rewards: **bit bursts**, ticket-backs, and **10 special circus items** (circus
  themed: balloon, plush, cotton candy, ringmaster hat...).
- Circus items are **not needed to finish**, but each does **-2 HP** in the fight,
  so they are a damage cushion, not a requirement.

### What items are

Every item is a prop for the one character or his scene: outfits, hats, held
items, decorations, activities, backgrounds. Drag them on the canvas or hand them
to him to wear/use.

---

## 7. The finish: throw everything at the Defect Dragon

- **Unlocks when all 20 levels and all 40 chest items are done.**
- The team hits **Fight**. The character **hurls the whole collection** at the
  Dragon, one item at a time: **regular items -1 HP, circus items -2 HP.**
- **Dragon HP = 40.** All 40 chest items = exactly enough to kill it; circus items
  are overkill margin. **If you are short on items, you die** and go back to
  collecting, so the incentive is to finish the set.
- On the kill: confetti, **VICTORY**, and a **season report card** (sprint points,
  tickets, best streak, screwups, items collected, sprints).
- **Finish.** Optionally a fresh season keeps a prestige badge and the collection.

---

## 8. Art production plan (Higgsfield)

One character makes this cheap (2 credits an image).

1. **Lock the dungeon-crawler Paper Mario style on the base character first.** Flat
   paper cut-out, bold outline, standee shadow, dungeon-office setting.
2. **Base + layers** at fixed anchors: outfits (body), hats (head), held items
   (hand), so they composite in code over the rig.
3. **Gear + backgrounds** as separate transparent pieces that drop into the scene.
4. **Chest/circus item props** as transparent PNGs, each draggable/handable.
5. Everything background-removed for clean compositing; the light rig animates the
   base and swaps activity poses when an item is handed over.

---

## 9. Worked example (40 pts / 8 tickets, clean)

- **Sprints 1-27:** each retro, enter points and tickets. Levels tick up (a
  celebration + a new piece of gear + a fatter multiplier each time). Bits buy
  chest items steadily (a spin costs ~8 days of output early, ~16 late). Tickets
  spin the circus for bit bursts and the odd special item.
- **~Sprint 28:** level 20 lands, the Singularity Engine bolts on.
- **~Sprint 29:** the 40th chest item drops. Levels and items both done.
- **Fight:** throw all 40 (+ any circus items) at the Dragon, 40 damage, it bursts.
  Victory, report card, finish.

---

## 10. Settled

- Single character, **dungeon-crawler Paper Mario** style, **light code rig**.
- Sprint points → levels; **+50% bits/day per level** + level-up celebration; boss
  at level 20 (~sprint 28).
- **Chest: 40 regular items** (bits), income-tied price, completes ~sprint 29,
  each **-1 HP**.
- **Circus: 10 special items** (tickets), **-2 HP**, not required; wheel also gives
  bit bursts.
- **No weapons.** Items are props on the canvas; hand one over and he uses it.
- **Dragon HP 40**, throw the whole collection, need all chest items or you die.
- Streak bonus and −30% defect carried from v3.

**Open (minor, not blocking):** exact 40-item + 10-circus lists (settle with the
art); whether a won season resets or the game just ends; final BASE/number feel.

*Next: lock the Paper Mario character in Higgsfield, then build v4 to this.*
