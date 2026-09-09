# Days Since Last Screwup: Content (v5 levels + items)

The canonical level progression and item list. Numbers and rules live in
`screwup-game-spec-v5.md`; this is the flavor.

**The clean split:**
- **Levels change HIM only** (worn / on-body). Bought with sprint points. He stands
  and levels up in a generic **break room**.
- **Bits buy box spins → office-stereotype BOBBLEHEADS.** 24 of them, collected onto
  a **shelf** (uniform slots, drag-and-drop or auto-fill). No cubicle, no bespoke
  item placement. Collect all 24 to be ready for the boss.

Base character: office-1 (navy polo, lanyard, jeans, sneakers), generated with
office-1 as the consistency anchor so every level is the same guy.

---

## Part A: the 12 levels (all on-body, sprint points)

**Level 0, the Coder (base).** Navy polo, lanyard. *+0 Potential (allegedly).*

| Lv | Upgrade (on him) | What changes | Joke stat |
|--:|---|---|---|
| 1 | Button-down shirt | polo to a light-blue button-down | +3 Dad Energy (and you don't even have kids!) |
| 2 | Slacks | jeans to grey pleated slacks | +4 Business Casual (the pleats mean business) |
| 3 | Dress shoes | sneakers to brown dress shoes | +5 Corner-Office Aura (they pinch, but you look employed) |
| 4 | Blue-light glasses | amber-tinted glasses on | +8 Alertness (are we sure the light was the problem?) |
| 5 | Company t-shirt | shirt open over a branded company tee | +6 Team Spirit (a shirt instead of a raise, again) |
| 6 | Crossfit class | he buffs up, broad shoulders, filled sleeves | +15 Gains (he will tell you about it) |
| 7 | Cyborg eyes | glowing cybernetic eyes / HUD implants | +12 Perception (you can see the bug now; still won't fix it) |
| 8 | Suspicious black backpack | a big bulging tactical backpack rides his back | -5 Sneak (what did I even put in this thing?) |
| 9 | Robot arm | one arm becomes a chrome cybernetic limb | +30 Grip (a firm handshake, at last) |
| 10 | Wifi antenna | a company-issue antenna sprouts from his head | +10 Connectivity (5 bars in the bathroom, no escape from Slack) |
| 11 | Company credit card | a shiny black card clipped to his belt | +30 Purchasing Power (it's for "work") |
| 12 | Power suit | a huge robotic exo-suit swallows him whole | +100 Executive Presence (still, technically, an IC) |

**The Promotion (finale).** Reach level 12 with all 24 items: banner drops,
**"PROMOTION! Your new role: defeat the Defect Dragon."** The backpack unfolds into
a many-barreled cannon, he loads every cubicle item, and opens fire. *+∞ Scope.*

Each level is one full-body sprite (accumulated look) that cross-fades in with a
flash on level-up. All twelve are the same guy plus gear, no desk or props (those
are items).

---

## Part B: the 24 office bobbleheads (bits)

Bought from the box one spin at a time, each a new, unowned **office-stereotype
bobblehead figurine** that lands on the **shelf**. Uniform little figures (big head,
small body, on a base), so they slot onto shelf rows cleanly, no bespoke placement.
Every bobblehead is also a **shot** in the finale (one = -1 HP, Dragon HP = 24, so
you need the whole set).

| # | Bobblehead | The bit |
|--:|---|---|
| 1 | The Boss | tie, coffee mug, permanent "quick sync?" face |
| 2 | The Intern | oversized backpack, terrified, lanyard to the knees |
| 3 | The Sales Shark | slicked hair, headset, finger-guns |
| 4 | The IT Guy | hoodie, "did you try turning it off and on?" |
| 5 | The HR Rep | cardigan, clipboard, suspiciously warm smile |
| 6 | The CEO | power suit, sunglasses indoors |
| 7 | The Accountant | green visor, calculator, sleeve garters |
| 8 | The Creative | black turtleneck, giant glasses, artisanal scarf |
| 9 | The Coffee Fiend | bucket-sized mug, thousand-yard stare |
| 10 | The Remote Worker | blazer up top, pajama bottoms, cat on shoulder |
| 11 | The Office Gossip | mid-lean, hand cupped, eyebrows up |
| 12 | The Overachiever | three phones, energy drink, no sleep |
| 13 | The Slacker | reclined, feet up, AirPods, "5 more minutes" |
| 14 | The Consultant | pinstripes, briefcase, only speaks in buzzwords |
| 15 | The Security Guard | uniform, flashlight, takes it very seriously |
| 16 | The Receptionist | headset, front-desk smile, sees all |
| 17 | The Data Nerd | lab coat, glasses, laptop full of charts |
| 18 | The DevOps Firefighter | literal fire helmet, "prod is down" |
| 19 | The Product Manager | sticky notes everywhere, roadmap scroll |
| 20 | The QA Tester | magnifying glass, tiny net, found a bug |
| 21 | The Marketing Guru | megaphone, on-trend fit, "let's make it viral" |
| 22 | The Facilities Legend | tool belt, hard hat, fixes anything |
| 23 | The Founder-Bro | vest, cold brew, "we're a family here" |
| 24 | The Office Veteran | suspenders, reading glasses, "back in my day" |

Rules (from the spec): 24 bobbleheads, `spinCost = production × (2 + 0.18 × owned)`,
completes around sprint 6 (with the levels). Shelf holds all 24; the finale fires
them at the Dragon (each -1 HP, Dragon HP 24).

---

## Modularity

This file is one **theme pack**: 12 on-body upgrades + 24 cubicle items + their
art + the dragon. Swap it for another (wizard's tower, barista's cafe, knight's
keep) and the same engine + math runs a new season. Only the nouns change.
