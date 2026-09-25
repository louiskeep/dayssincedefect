# Office Aquarium: Spec v1

*Sprint points directly grow a shared tank, one weird fish at a time, up to
24. Bits pile up as fish food; feeding reveals a fun fact. No combat, no
losing, ambient idle progress.*

Same two levers as the base game (sprint points, days between sprints), same
one-input-plus-one-prop interaction model. Built for one operator to run in
under a minute before sprint review: type points, click log, watch what
reveals. No shop, no picking which fish, no picking hats.

## 1. The loop

Every sprint at retro:

1. **Enter sprint points** into one field, click log. Points accumulate
   toward the next fish threshold. Crossing a threshold **reveals the next
   fish** (sequential, not random, so the gallery fills in a fixed curated
   order), with a name and one-line flavor. This is the whole PO action.
2. **Bits ("fish food") accrue automatically** between sprints. Clicking the
   **Feed the Tank** prop, whenever enough food is banked, auto-picks one
   random currently-owned fish and reveals one fun fact about it. One
   button, no fish-picking menu.
3. Occasionally (see §4), a feeding also awards a **hat**, automatically and
   randomly assigned to a random owned fish. Never a separate purchase or
   equip action.
4. The moment fish #24 arrives, "The Reef Is Complete": a calm full-tank
   reveal, no fight. If the season's configured length runs out first, the
   season still ends and recaps normally, complete or not, same as any
   other season today.

| Currency | Source | Spends on |
|---|---|---|
| **Sprint Points** | typed at retro | next fish reveal (sequential, threshold-based) |
| **Bits (fish food)** | accrue per day | Feed the Tank prop → random fact + occasional hat |

## 2. Fish thresholds (sprint points)

```
pointsPerFish = round(avgPoints * seasonSprints / 24)
```

Derived from season config the same way the base game derives
`ptsPerLevel`, so all 24 fish complete right around season end regardless
of a team's configured sprint length or velocity. Cumulative points crossing
another `pointsPerFish` multiple reveals the next unowned fish in list
order.

### The 24 fish

| # | Fish | Flavor |
|--:|---|---|
| 1 | The Boss Fish | big, slow, always circling near the top |
| 2 | The Intern Shrimp | tiny, frantic, somehow already stressed |
| 3 | The Sales Shark | obviously |
| 4 | The IT Eel | hides in the rocks until something breaks |
| 5 | The HR Anemone | soft, welcoming, quietly stings if provoked |
| 6 | The CEO Angelfish | glides, rarely blinks, expensive to feed |
| 7 | The Accountant Puffer | counts every grain of gravel, inflates under stress |
| 8 | The Creative Betta | flashy, dramatic, fights its own reflection |
| 9 | The Coffee Fiend Catfish | bottom-feeder, never actually sleeps |
| 10 | The Remote Worker Clownfish | technically present, mostly hiding in the anemone |
| 11 | The Office Gossip Guppy | travels in a pack, spreads fast |
| 12 | The Overachiever Tetra | schools obsessively, never stops moving |
| 13 | The Slacker Snail | gets there eventually, allegedly |
| 14 | The Consultant Lionfish | impressive-looking, questionable ROI |
| 15 | The Security Guard Grouper | big, still, watching everything |
| 16 | The Receptionist Cleaner Fish | knows everyone's business, keeps things running |
| 17 | The Data Nerd Discus | meticulously symmetrical, mildly delicate |
| 18 | The DevOps Firefighter Fish | appears exactly when something's on fire |
| 19 | The Product Manager Pufferfish | sketches the tank's roadmap in bubbles |
| 20 | The QA Tester Crab | pokes at everything, finds the one loose rock |
| 21 | The Marketing Guru Neon Tetra | bright, loud, surprisingly effective |
| 22 | The Facilities Legend Loach | fixes the filter nobody else understands |
| 23 | The Founder-Bro Betta | insists the tank is basically the ocean now |
| 24 | The Office Veteran Koi | been there since before the no-feeding-after-6pm rule |

## 3. Bits, feeding, and facts

```
bitsPerDay = round(6 * (1 + 0.15 * fishOwned) * streakBonus(daysSinceLastDefect))
feedCost = 10                       // flat, cheap, meant to be clicked often
```

No exponential level term (there's no leveling person in this game); food
production scales linearly with how many fish are already in the tank.
Defect handling: identical shape to the base game's configurable
`defBits`/`defAll` (a logged defect costs a chunk of banked food and resets
the clean streak).

Each fish entry in content data carries 3-5 short facts. Feeding an owned
fish reveals one fact it hasn't shown yet (falls back to repeating once all
are seen). Sample facts (full bank is a content-writing pass, not an
engineering one):

- **The Boss Fish:** "Has never once used the door of its own castle."
- **The IT Eel:** "Has been 'about to fix that' for three consecutive seasons."
- **The Coffee Fiend Catfish:** "Technically doesn't need to eat. Feeds anyway."

## 4. Hats (automatic bonus, not a shop)

Every 5th feeding also triggers a hat drop: one random hat from the unowned
pool, placed on one random currently-owned fish. No purchase screen, no
equip menu, purely a surprise layered on top of the feed action.

### The 12 hats

| # | Hat | Flavor |
|--:|---|---|
| 1 | Tiny Top Hat | surprisingly formal for something with gills |
| 2 | Party Hat | off-brand, always slightly too big |
| 3 | Sunglasses, worn indoors, always | the CEO Angelfish's personal favorite |
| 4 | Hard Hat | for a fish that takes safety very seriously |
| 5 | Wizard Hat | casts no spells, radiates confidence anyway |
| 6 | Sales-style Headset | "just circling back, from the reef" |
| 7 | Plastic Dollar-Store Crown | self-appointed royalty |
| 8 | Beret | the Creative Betta insisted |
| 9 | Propeller Cap | technically increases swim speed by 0% |
| 10 | Cowboy Hat | yeehaw, from the bottom of the tank |
| 11 | Graduation Cap | congratulations on surviving another sprint |
| 12 | Slightly Crooked Halo | nobody believes it, including the fish |

## 5. The finish: the reef is complete

- Triggers automatically the instant fish #24 arrives, no separate action.
- Calm reveal: all 24 fish visible at once in the completed tank, no fight,
  no HP bar. Season ends, recap shown (points, streak, defects, fish, hats
  collected, facts learned).
- If the configured season length elapses before all 24 arrive, the season
  still ends and recaps as-is, same "hadActivity" logic as the base game,
  completion is a bonus, not a requirement.

## 6. Feasibility + art

One tank background scene, 24 fish sprites (simple side-profile, easy to
batch-generate), 12 hat overlay sprites. No boss-fight animation needed;
the "reef complete" reveal is a static full-tank composite, cheaper to
build than the base game's finale.

## 7. What's new (not a reskin)

Unlike Cartography Club, this needs real new state and logic:

- Points gate the collection directly (no separate leveling ladder).
- A linear (not exponential) production formula.
- A fact-tracking field per fish (`seen: boolean[]`) so feeding doesn't
  repeat until exhausted.
- A hat-ownership array plus a fish-to-hat assignment array, and the
  every-5th-feeding trigger.
