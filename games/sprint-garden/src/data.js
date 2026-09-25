/* Sprint Garden content: the 16 flowers (Tier 1, sprint points) and 8 trees
   (Tier 2, bits). Canonical list + numbers in docs/specs/sprint-garden-spec.md.
   baseProduction values are placeholders for tuning once real play data exists;
   the shape (flowers low, trees high) is what the spec requires, not the exact
   numbers. */

/* [name, flavor, baseProduction (bits/day at level 1)] */
const FLOWERS=[
  ["Marigold","cheap, cheerful, technically repels something",1.0],
  ["Daisy","the \"no thoughts, head empty\" of flowers",1.15],
  ["Tulip","stands up straight, judges the others",1.3],
  ["Sunflower","reaches for the sun before anyone asks it to",1.45],
  ["Petunia","loud colors, quiet drama",1.6],
  ["Lavender","allegedly calming, definitely overpriced",1.75],
  ["Zinnia","thrives on neglect, weirdly thriving anyway",1.9],
  ["Snapdragon","mildly aggressive, mostly harmless",2.05],
  ["Cosmos","looks delicate, survives anything",2.2],
  ["Poppy","a little too intense for a Tuesday",2.35],
  ["Chrysanthemum","the office veteran of flowers",2.5],
  ["Aster","shows up late, still gets full credit",2.65],
  ["Pansy","surprisingly resilient, contrary to the name",2.8],
  ["Iris","sharp-edged, elegant, keeps to itself",2.95],
  ["Foxglove","pretty, faintly ominous, HR has concerns",3.1],
  ["Hollyhock","towers over everyone, never says why",3.25],
];

/* [name, flavor, baseProduction (bits/day at level 1)] */
const TREES=[
  ["The Coffee Tree","obviously, the whole team's real MVP",8],
  ["The Money Tree (fake, everyone knows)","planted ironically, watered sincerely",11],
  ["The Server-Room Ficus","thrives on recycled air and quiet dread",14],
  ["The Bonsai of Infinite Scope","pruned constantly, grows anyway",17],
  ["The Legacy Oak","nobody remembers planting it, nobody will remove it",20],
  ["The Founders' Redwood","improbably tall, improbably still standing",23],
  ["The Cherry Blossom of Q4","blooms once a year, briefly, beautifully, then it's over",26],
  ["The World Tree of Uptime","roots in three data centers, holds up everything",29],
];

/* growth multiplier per level, index 0 = level 1 */
const LEVEL_MULT=[1,2.2,5];
