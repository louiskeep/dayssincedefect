# Sprint Garden: Spec v1

*An incremental garden. Sprint points auto-plant flowers on a schedule;
each plant grows through 3 levels over time and produces bits; enough
banked bits auto-plants bigger, crazier trees. Defects stunt growth for a
cycle instead of costing currency directly.*

Same two levers as the base game (sprint points, days between sprints), same
one-input-plus-one-prop interaction model. Built for one operator to run in
under a minute before sprint review: type points, click log, watch what
grows. No shop, no species picking, plants choose themselves in a fixed
order.

## 1. The loop

Every sprint at retro:

1. **Enter sprint points** into one field, click log. Points accumulate
   toward the next flower threshold. Crossing a threshold **auto-plants the
   next flower in sequence** (Tier 1, see §2), revealed with a small
   sprouting animation. This is the whole PO action.
2. **Bits accrue automatically** from every currently-planted, non-dormant
   plant's production (see §3). Clicking the **Tend the Garden** prop,
   whenever enough bits are banked, **auto-plants the next tree in
   sequence** (Tier 2, see §4). One button, no species menu.
3. Independent of any click: every plant already in the ground **grows one
   level every completed sprint**, up to its cap of level 3, entirely
   automatic, nothing to press.
4. A logged defect doesn't touch points or bits directly. Instead it's a
   **pest event**: every currently-growing (not yet level-3) plant skips
   its next scheduled level-up. Already-mature plants are unaffected.
5. Once the team owns at least one of every species (16 flowers + 8 trees,
   §2/§4), all at level 3, "Full Bloom" triggers: a harvest-festival
   reveal, season ends, recap shown.

| Currency | Source | Spends on |
|---|---|---|
| **Sprint Points** | typed at retro | next flower, auto-planted at threshold |
| **Bits** | produced by owned plants | next tree, auto-planted at threshold |

## 2. Flowers (Tier 1, sprint points)

```
pointsPerFlower = round(avgPoints * seasonSprints / 16)
```

Same derivation pattern as the base game's `ptsPerLevel`, tuned so all 16
flowers land across the season. Flowers plant in list order, no randomness,
so the bed fills predictably and visibly.

| # | Flower | Flavor |
|--:|---|---|
| 1 | Marigold | cheap, cheerful, technically repels something |
| 2 | Daisy | the "no thoughts, head empty" of flowers |
| 3 | Tulip | stands up straight, judges the others |
| 4 | Sunflower | reaches for the sun before anyone asks it to |
| 5 | Petunia | loud colors, quiet drama |
| 6 | Lavender | allegedly calming, definitely overpriced |
| 7 | Zinnia | thrives on neglect, weirdly thriving anyway |
| 8 | Snapdragon | mildly aggressive, mostly harmless |
| 9 | Cosmos | looks delicate, survives anything |
| 10 | Poppy | a little too intense for a Tuesday |
| 11 | Chrysanthemum | the office veteran of flowers |
| 12 | Aster | shows up late, still gets full credit |
| 13 | Pansy | surprisingly resilient, contrary to the name |
| 14 | Iris | sharp-edged, elegant, keeps to itself |
| 15 | Foxglove | pretty, faintly ominous, HR has concerns |
| 16 | Hollyhock | towers over everyone, never says why |

## 3. Growth and production

Every owned plant instance has a level (1, 2, or 3) and levels up
automatically once per completed sprint until it caps at 3, unless a pest
event (§1.4) skips that cycle.

```
speciesProduction[level] = baseProduction * [1, 2.2, 5][level-1]
bitsPerDay = sum(speciesProduction[plant.level] for plant in ownedPlants)
```

`baseProduction` is set per species (flowers low, trees high, see §4), so
total bits/day grows as the garden fills and matures, not just as new
species are added. This replaces the base game's flat exponential formula
entirely; production is a sum over what's actually planted.

## 4. Trees (Tier 2, bits, "bigger and crazier")

```
treeCost(T) = round(baseTreeCost * 1.6^ownedTreeCount)
```

Once enough bits are banked from your flowers, the next tree in sequence
auto-plants, same no-menu pattern as flowers. Trees have much higher
`baseProduction` than any flower, this is the payoff for having grown a
mature flower bed.

| # | Tree | Flavor |
|--:|---|---|
| 1 | The Coffee Tree | obviously, the whole team's real MVP |
| 2 | The Money Tree (fake, everyone knows) | planted ironically, watered sincerely |
| 3 | The Server-Room Ficus | thrives on recycled air and quiet dread |
| 4 | The Bonsai of Infinite Scope | pruned constantly, grows anyway |
| 5 | The Legacy Oak | nobody remembers planting it, nobody will remove it |
| 6 | The Founders' Redwood | improbably tall, improbably still standing |
| 7 | The Cherry Blossom of Q4 | blooms once a year, briefly, beautifully, then it's over |
| 8 | The World Tree of Uptime | roots in three data centers, holds up everything |

## 5. The finish: full bloom

- Triggers once all 24 species (16 flowers + 8 trees) are owned and every
  one is at level 3.
- Reveal: a harvest-festival scene showing the fully mature garden, reusing
  the base game's throw/impact animation code repurposed as a harvest toss
  rather than an attack, no HP bar, no losing.
- Season report card: points, defects (pest events), sprints, species
  owned, average plant level.

## 6. Feasibility + art

One garden-bed background scene at a handful of fill states (sparse,
half-full, full), 16 flower sprites at 3 growth stages each, 8 tree sprites
at 3 growth stages each. More art volume than the other two specs (24
species times 3 stages), but each sprite is small and simple.

## 7. What's new (not a reskin), plus the deferred stretch

This is the most different of the three from the base engine:

- Plants are individually owned instances with their own level state, not
  a single global ladder or a flat collection array.
- Production is summed across owned plants at their current level, not one
  flat formula.
- A two-tier currency gate (points buy the cheap tier, bits buy the
  expensive tier) rather than one currency per track.
- Defects stunt a timer instead of docking currency, a different penalty
  shape than the base game's `defBits`/`defLevels`/`defAll`.

**Deferred, not in v1:** a "Storm Event" where a below-average sprint opens
a short window for a save-the-garden action. Genuinely new code (a timed
group-response state), not required to ship Full Bloom at parity with the
other two specs.
