/* Days Since Defect — static game data + sprite URLs.
   Pure tables, no DOM and no state. Everything here is read by the render and
   economy code in the other src/*.js files (all loaded as plain scripts sharing
   one global scope, in the order set by game.html). */

/* technomancer ladder: [gear-panel/card art (tech sprite), name, joke stat]. */
const LEVELS = [
  ["tech-00.png","The Coder",""],
  ["tech-01.png","Ergonomic exo-suit","+3 Posture"],
  ["tech-02.png","Debug Duck","+6 Insight"],
  ["tech-03.png","Watch","+4 Punctuality"],
  ["tech-04.png","Magic blue-light glasses","+8 Alertness"],
  ["tech-05.png","Earbuds","+9 Deep Work"],
  ["tech-06.png","Cold-brew IV","+12 Uptime"],
  ["tech-07.png","Spellbook","+15 Compute"],
  ["tech-08.png","Rune-etched chrome arm","+30 Grip"],
  ["tech-09.png","Triple monitor array","+11 Multitasking"],
  ["tech-10.png","Wizard cloak","+13 Arcana"],
  ["tech-11.png","Duck power suit","+25 Firepower"],
  ["prop-keycard.png","Access Keycard","+∞ Clearance"],
];
/* the character sprite shown IN THE ROOM per level. Lv 2 (duck), Lv 11 (duck suit) and Lv 12
   (keycard) do not change the human, so the hero holds at the wizard-cloak form. */
const HERO=["tech-00.png","tech-01.png","tech-01.png","tech-03.png","tech-04.png","tech-05.png",
  "tech-06.png","tech-07.png","tech-08.png","tech-09.png","tech-10.png","tech-10.png","tech-10.png"];
const BOB = [
  ["The Boss","+5 Synergy","Let's take this offline. And also online. And into a meeting."],
  ["The Intern","+3 Enthusiasm","Cc'd on everything. Understands none of it. Thriving."],
  ["The Sales Shark","+8 Charisma","Just circling back to circle back on the circle back."],
  ["The IT Guy","+7 Uptime","The ticket says 'urgent.' They all say 'urgent.'"],
  ["The HR Rep","+6 Diplomacy","This is a safe space. Also, this is being recorded."],
  ["The CEO","+10 Vision","My door is always open. My calendar, never."],
  ["The Accountant","+9 Precision","I found the missing cent. It cost us four hours."],
  ["The Creative","+7 Aesthetic","Can we make the logo bigger, but also smaller?"],
  ["The Coffee Fiend","+12 Alertness","I can hear colors now. Deploy on Friday, sure."],
  ["The Remote Worker","+5 Flexibility","That's not me typing, that's my cat standing on the keyboard again."],
  ["The Scrum Master","+9 Focus","You really don't hit your stride until your 3rd standup of the day."],
  ["The Overachiever","+10 Hustle","PTO stands for Probably Typing, Obviously."],
  ["The Slacker","+6 Chill","Reply-all is the only cardio I do."],
  ["The Consultant","+9 Buzzwords","Let's leverage our core competencies to move the needle."],
  ["The Security Guard","+7 Vigilance","Badge? I don't care if you're the CEO. Badge."],
  ["The Receptionist","+8 Awareness","I know where everyone is. Always. Sleep well."],
  ["The Data Nerd","+11 Insight","Give me enough dimensions and I'll prove anything you want."],
  ["The DevOps Firefighter","+10 Resilience","3am page, no problem. It's always the DNS."],
  ["The Product Manager","+8 Roadmapping","It's not a bug we didn't want, it's a feature we didn't know we needed."],
  ["The QA Tester","+9 Scrutiny","I found 47 bugs. You're welcome. And I'm sorry."],
  ["The Marketing Guru","+8 Reach","Let's make it go viral. Organically. By Friday."],
  ["The Facilities Legend","+10 Fixit","Duct tape, WD-40, and zero questions asked."],
  ["The Founder-Bro","+7 Grindset","Ramen profitable, emotionally bankrupt."],
  ["The Office Veteran","+9 Wisdom","New CEO, old me. See you at the next all-hands."],
];
/* funny flavor shown when each level-up item unlocks (index 0 = level 1). */
const GEARLINE = [
  "He stands unnervingly straight now.",
  "The duck has commit access now. It earned it.",
  "Time is a construct. Standup is not.",
  "Enchanted lenses. The 2am deploy only feels like 1am.",
  "Noise-cancelling, including your questions.",
  "Blinking is optional now.",
  "Reads the docs. The forbidden technique.",
  "The handshake is now load-bearing.",
  "One for the code, one for the logs, one to stare into the void.",
  "Did someone say business casual?",
  "Absolute unit.",
  "Finally allowed in through the front door.",
];

/* ---------- sprite loading ----------
   Sprite PNGs in assets/ already have transparent backgrounds baked in, so we just hand back the
   URL. (Earlier builds stripped the background at runtime with a canvas, but reading canvas pixels
   is blocked for images loaded over file://, which broke a plain double-click open. No canvas now,
   so the game runs straight from the filesystem.) Bump ASSET_VER when a sprite PNG is replaced. */
const ASSET_VER=65;
function keyed(file){return Promise.resolve("assets/"+file+"?a="+ASSET_VER);}
