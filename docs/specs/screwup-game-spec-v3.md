# Days Since Last Screwup: Spec v3 (build spec)

*A calm, once-a-sprint team game. Enter your sprint points at retro, grow a crew
of 20, spin a chest full of loot, and after ~20 sprints beat the Defect Dragon.*

This is the spec we build v3 from. It strips the v2 idle dashboard down to: one
manual input (sprint points, every ~2 weeks), one automatic output (bits per
day), one sink (a mystery chest), and one finish line (the boss at level 20).
Supersedes the v2 workstation/decoration-multiplier economy.

---

## 1. The shape of it

- **Check in about once every two weeks**, at retro. Type in the points your team
  completed. That is the only required action.
- **Sprint points are progress.** They fill a level bar. Each level cleared
  **unlocks one of 20 characters** for the crew.
- **Every character doubles bit production.** Bits accrue automatically by the
  calendar, so the number is current whenever the file opens.
- **Bits buy loot.** A **mystery chest** drops a **new cosmetic every spin** (no
  duplicates) to dress the crew. The spin price climbs each time, so richer bits
  are always worth chasing.
- **Level 20 unlocks the Defect Dragon.** A quick fight animation plays, the crew
  wins, a win screen celebrates the run.
- **Shipping a defect is the only setback** (§7): it takes 30% of your bits and
  resets the headline "days since last screwup" counter. It never touches your
  level or crew, so real progress is safe.

Two currencies, two jobs:

| Currency | How you get it | What it does |
|---|---|---|
| **Sprint Points (SP)** | typed in each retro (your real velocity) | fills levels → unlocks characters → drives the whole run |
| **Bits** | generated automatically per day | spins the mystery chest |

No stations, no per-item rates, no upgrade store, no overclock. Bits come from one
formula and are spent on one thing.

---

## 2. Levels and sprint points (the game math)

**Points to clear a level rise slowly.** Clearing level *L* (advancing to *L+1*):

```
pointsToClear(L) = 38 + 2L        →  L1 = 40, L2 = 42, L3 = 44, … L19 = 76
```

**Cumulative points to reach level L:**

```
cumulativeSP(L) = (L − 1) × (38 + L)
```

Your **level** is the highest *L* whose cumulative cost your running SP total has
passed. A big sprint can clear more than one level; a late one can take two
sprints.

### The full ladder to the boss

| Level | Clear cost | Cumulative SP to reach | Characters | Bits / day |
|---:|---:|---:|---:|---:|
| 1 | 40 | 0 | 1 | 2 |
| 2 | 42 | 40 | 2 | 4 |
| 3 | 44 | 82 | 3 | 8 |
| 4 | 46 | 126 | 4 | 16 |
| 5 | 48 | 172 | 5 | 32 |
| 6 | 50 | 220 | 6 | 64 |
| 7 | 52 | 270 | 7 | 128 |
| 8 | 54 | 322 | 8 | 256 |
| 9 | 56 | 376 | 9 | 512 |
| 10 | 58 | 432 | 10 | 1,024 |
| 11 | 60 | 490 | 11 | 2,048 |
| 12 | 62 | 550 | 12 | 4,096 |
| 13 | 64 | 612 | 13 | 8,192 |
| 14 | 66 | 676 | 14 | 16,384 |
| 15 | 68 | 742 | 15 | 32,768 |
| 16 | 70 | 810 | 16 | 65,536 |
| 17 | 72 | 880 | 17 | 131,072 |
| 18 | 74 | 952 | 18 | 262,144 |
| 19 | 76 | 1,026 | 19 | 524,288 |
| **20 (boss)** | n/a | **1,102** | 20 | 1,048,576 |

**Pacing** (1,102 SP to the boss):

| Team velocity | Sprints to boss | Real time (2-wk sprints) |
|---|---|---|
| 40 pts/sprint | ~28 | ~13 months |
| 45 pts/sprint | ~25 | ~11 months |
| 50 pts/sprint | ~22 | ~10 months |
| 55 pts/sprint | ~20 | ~9 months |

Lands the run in the 6-12 month window: about one level per sprint early, a bit
more than a sprint per level near the end.

---

## 3. Characters and bit production

- **One character unlocks each level.** At level *L* the crew is *L* strong. Level
  1 starts with one already, so the shelf is never empty.
- **Each character adds +100% production**, i.e. every new character doubles the
  daily rate. That is the entire production formula:

```
bitsPerDay = 2 ^ (level)          // level == characters unlocked
```

Level 1 → 2/day, level 10 → 1,024/day, level 20 → 1,048,576/day. Gentle for
months, then genuinely idle-game exponential at the end, which is what makes the
last stretch feel powerful.

**Accrual is by the calendar.** On open, `bits += bitsPerDay × daysSinceLastOpen`.
Nobody logs in daily; the file catches up. Fractional days count.

*(No overclock upgrade in v3: production comes only from leveling, so bits have
exactly one use, the chest. Kept out on purpose to stay simple.)*

### 3a. Clean-streak bonus

Days without a screwup multiply production, so a long clean run pays off:

| Days clean | Multiplier |
|---:|---:|
| 0-6 | ×1.0 |
| 7-13 | ×1.1 |
| 14-20 | ×1.2 |
| 21+ | ×1.3 |

```
streakMult = 1 + 0.1 × min(floor(daysClean / 7), 3)      // caps at ×1.3
production = 2^level × streakMult
```

A defect (§7) resets the counter to ×1.0. The chest is priced on base `2^level`,
so the streak bonus is pure upside: at ×1.3 you afford ~30% more spins.

### The 20-character roster

Placeholders now; we generate 20 stickers/animations in Higgsfield once the style
is locked. The names are the fun part; swap freely.

| # | Character | # | Character |
|--:|---|--:|---|
| 1 | Norm the Gnome | 11 | Sudo the Penguin |
| 2 | Goodboy the Dog | 12 | Blip the Ghost |
| 3 | Grok the Caveman | 13 | Biscuit the Bear |
| 4 | Stack the Programmer | 14 | Vector the Fox |
| 5 | Gantt the PM | 15 | Quill the Owl |
| 6 | Cron the Robot | 16 | Sprocket the Automaton |
| 7 | Sir Query the Knight | 17 | Mocha the Barista |
| 8 | Null the Alien | 18 | Kelp the Axolotl |
| 9 | Merlint the Wizard | 19 | Bramble the Mushroom-Folk |
| 10 | Pixel the Cat | 20 | Comet the Astronaut |

Unlock order can be this list, or randomized per team for variety.

---

## 4. Bits sink: the Mystery Chest

Bits exist to be spent on collecting. One button.

- **Spin** costs bits and drops **one cosmetic you do not already own** (hats,
  outfits, held props, character skins, desk decorations). **Never a duplicate.**
- The pool is **60 items**; 60 spins completes the collection.
- **Price is a set number of days of production**, tied to income so it never
  goes trivial and never locks you out:

```
spinCost = 2^level × (1.5 + 0.15 × itemsOwned)      // bits, priced on BASE production
```

That is: the next item costs **1.5 days of production** at the start and climbs to
**~10 days** by the 60th, at every level. Because it scales with `2^level`, a spin
costs the same relative to income whether you are level 3 or level 18. Chest is
priced on base production (no streak), so a clean-streak bonus (§3a) buys you
*more* spins, not fewer.

### What a run looks like (40 pts / 8 tickets per sprint, clean)

At 40 pts/sprint you clear roughly one level per sprint, reaching the boss around
sprint 28. Bits earned per fortnight and the chest price track together:

| Sprint | Level | Bits/day | Earned / 2 wks | Tickets | Items | Spin cost | as days |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 2 | 5 | 73 | 8 | 8/60 | 11 | 2.7d |
| 7 | 7 | 166 | 2,330 | 8 | 31/60 | 787 | 6.1d |
| **14 (halfway)** | 12 | 5,325 | 74,547 | 8 | 47/60 | 35,021 | 8.6d |
| 21 | 16 | 85,197 | 1,192,755 | 8 | 60/60 | 678,298 | 10.3d |
| 28 (boss) | 20 | 1,363,149 | 19,084,083 | 8 | 60/60 | complete | 10.3d |

The point of the table: **relative cost stays flat** (a spin is always ~3-10 days
of production), so nothing gets trivially cheap. Halfway through, a team earns
~75k bits a fortnight and a spin costs ~35k (about 8 days of output). Collection
completes around sprint 21, a bit before the boss.

**Tickets stay flat** (8 a sprint, one ticket a circus spin, §4b), because they
are not multiplied like bits. So circus pricing is consistent by design: the team
gets ~8 spins of the wheel per sprint the whole way through.

---

## 4b. Tickets and the Circus (side economy)

A second, playful currency tied to real throughput, separate from the level path.

- **Log sprint takes two numbers now:** sprint points (drive levels) and **tickets
  completed (5-25)**. Tickets completed are both a season stat and become spendable
  **🎟️ tickets**. The pun is the point: the tickets you closed become tickets for
  the fair.
- **The Circus** spends tickets on quick minigames. Rewards feed the main game so
  the side path matters:
  - **bits**, scaled to your current level (`bitsPerDay × {1,3,8}`) so a payout is
    always relevant, whether you are at level 3 or 18;
  - **exclusive circus prizes**, 10 carnival cosmetics (🎩🎀🎭🍭🎈🧸🪅🤡🎪🃏) you
    cannot get from the chest, equippable on the crew;
  - **your ticket back** now and then.
- **Prize Wheel** is the first minigame (1 ticket a spin, six weighted segments).
  Next candidates: Whack-a-Bug, High Striker, Plinko.
- Tickets and circus prizes carry the same season lifecycle as bits and the chest:
  circus prizes are kept through a new season (a trophy), spendable tickets reset.

## 5. The finish: Defect Dragon (level 20)

- Unlocks the moment you reach level 20 with all 20 characters.
- **A quick fight animation plays** (the crew piles on, the Dragon takes hits and
  bursts into confetti) followed by a **season report card**: sprint points earned,
  tickets completed, best clean streak, screwups survived, chest collection %,
  circus prizes, sprints and circus plays. Short and celebratory, never a
  fail-state.
- **After the win:** offer a new season (reset level + crew, keep a prestige badge
  and the completed collection) so the game can run again next half.

---

## 6. Worked example: the first sprints

- **Start.** Level 1, 1 character, **2 bits/day**, 0 SP.
- **Retro 1: +50 SP.** Clears level 1 (40), 10 to spare → **level 2**, character 2
  → **4 bits/day**. First couple of chest spins affordable within days.
- **Retro 2: +50 SP** (100 total). Clears levels 2 and 3 → **level 4**, character 4
  → **16 bits/day**, ~9 items collected.
- **Retro ~10 (~500 SP).** Around **level 11**, **2,048 bits/day**, ~32 items.
- **Retro ~22 (~1,102 SP).** **Level 20**, 20 characters, **~1M bits/day**,
  collection basically complete, Defect Dragon unlocks. Fight, confetti, win.

---

## 7. Screwups (recommended in, light)

The game is named for it, and it only touches the cosmetic currency, so it earns
its place cheaply:

- A **Report a defect** button. On confirm: `bits ×= 0.7` (lose 30% of the pile)
  and the big **"Days Since Last Screwup" counter resets to zero**. SP, level, and
  characters are untouched, so velocity is always safe.
- The headline counter (with best streak and reset count) is the game's identity
  and sits at the top of the screen at all times.
- Optional one-line note per defect feeds a small incident log, good for a laugh
  at retro. Whole layer is a toggle for teams that want the pure builder.

---

## 8. What changes from the v2 build

Keep: the crew, cosmetics/dress-up, the cartoon skin, the retro cadence, the
"days since" counter, the boss.

Drop: per-worker stations and individual rates, real-time bits/sec, decoration %
multipliers, the priced upgrade store, and overclock. Bits are one number from
the date; the sink is the chest.

New state shape (small, mostly derived):

```json
{
  "version": 3,
  "team": "The Data Team",
  "spTotal": 0,                     // level + characters + bitsPerDay derive from this
  "sprintsLogged": 0,
  "lastOpen": "2026-09-01",         // for calendar bit accrual
  "bits": 0,
  "spins": 0,                       // chest spins taken (drives next price)
  "inventory": [],                  // cosmetic item ids collected (no dupes)
  "crew": [ { "id": "gnome", "hat": null, "outfit": null, "prop": null, "skin": null } ],
  "screwupStart": "2026-09-01",     // the headline "days since" timer
  "bestStreakDays": 0,
  "resetCount": 0,
  "history": []                     // defect log
}
```

---

## 9. Tuning knobs (all in one place)

| Knob | Default | Effect |
|---|---|---|
| `pointsToClear(L)` | `38 + 2L` | steepness of the level ladder (harder each level) |
| Boss level | 20 | length of the whole run |
| Production per character | ×2 (+100%) | how fast bits explode |
| Streak bonus | +0.1 / week, cap ×1.3 | reward for clean days |
| Chest pool size | 60 | length of the collection |
| `spinCost` = `2^level × (1.5 + 0.15·owned)` | 1.5-10.4 days of output | keeps relative cost flat, completes ~sprint 21 |
| Defect penalty | −30% bits | how much a screwup hurts |
| Tickets per sprint | 5-25 (manual) | circus spending power |
| Wheel payouts | `bitsPerDay × {1,3,8}` | how strong a spin feels |
| Circus prize pool | 10 | length of the exclusive-cosmetic goal |
| Season reset / prestige | on | replayability after the boss |

---

## 10. Settled + still open

**Settled:** 20-character roster (names above, art via Higgsfield later); no
overclock; chest gives a new item every spin, pool 60, growth 1.23; boss is a
quick fight animation + win screen; defect layer in (light, toggleable).

**Still open (not blocking a build):**
1. Unlock order for the 20: fixed list, or randomized per team?
2. Chest pool contents: exact 60 cosmetics (hats / outfits / props / skins / decor)
   and how they attach to the sticker art (settled once the art style lands).
3. Season / prestige details after the first Dragon.

*Next: build v3 from this. The art style + the 60-item pool get finalized against
whatever Higgsfield sticker style we lock.*
