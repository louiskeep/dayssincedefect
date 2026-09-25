/* Office Aquarium: static content: the 24 fish (name, flavor, facts) and the
   12 hats. Pure data, no state and no DOM here. Order matters: fish reveal in
   this list order as points cross each pointsPerFish threshold, per
   docs/specs/office-aquarium-spec.md section 2. */

const FISH = [
  ["The Boss Fish", "big, slow, always circling near the top", [
    "Has never once used the door of its own castle.",
    "Considers 'just circling back' a full personality.",
    "Technically the biggest fish in the tank, mostly by volume of opinions."]],
  ["The Intern Shrimp", "tiny, frantic, somehow already stressed", [
    "Cc'd on every conversation in the tank, understands none of it.",
    "Once tried to move a rock that was clearly load-bearing.",
    "Thriving, allegedly, according to its own status updates."]],
  ["The Sales Shark", "obviously", [
    "Has pitched the filter on its own value proposition twice.",
    "Refers to feeding time as 'a huge win for the team.'",
    "Circles the glass like it's closing a deal."]],
  ["The IT Eel", "hides in the rocks until something breaks", [
    "Has been 'about to fix that' for three consecutive seasons.",
    "Only surfaces when the filter makes a weird noise.",
    "Once unplugged and replugged the whole tank. Nobody knows why. It worked."]],
  ["The HR Anemone", "soft, welcoming, quietly stings if provoked", [
    "This is a safe space. It is also, technically, recording.",
    "Has mediated more tank disputes than anyone will admit to starting.",
    "Surprisingly firm about the no-feeding-after-6pm policy."]],
  ["The CEO Angelfish", "glides, rarely blinks, expensive to feed", [
    "Its door is always open. Its calendar, never.",
    "Once described the whole tank as 'a family, but scalable.'",
    "Requires premium flakes. Regular flakes are beneath its vision."]],
  ["The Accountant Puffer", "counts every grain of gravel, inflates under stress", [
    "Found the missing pellet. It cost four hours of everyone's time.",
    "Inflates slightly whenever someone mentions 'informal budgeting.'",
    "Keeps a private ledger of who ate what and when."]],
  ["The Creative Betta", "flashy, dramatic, fights its own reflection", [
    "Has asked, unprompted, to make the gravel 'bigger, but smaller.'",
    "Considers its own reflection a rival brand.",
    "Redesigned the castle logo four times this week."]],
  ["The Coffee Fiend Catfish", "bottom-feeder, never actually sleeps", [
    "Technically doesn't need to eat. Feeds anyway.",
    "Vibrates faintly near the filter intake. This is normal, apparently.",
    "Has never once missed a 3am feeding, requested or not."]],
  ["The Remote Worker Clownfish", "technically present, mostly hiding in the anemone", [
    "That's not it typing, that's a bubble hitting the glass again.",
    "Attends every tank meeting from inside the anemone, camera off.",
    "Somehow still the most reliable fish in the tank."]],
  ["The Office Gossip Guppy", "travels in a pack, spreads fast", [
    "Knew about the new filter before the filter did.",
    "Has never kept a secret, including its own age.",
    "Travels exclusively in a tight, whispering school."]],
  ["The Overachiever Tetra", "schools obsessively, never stops moving", [
    "PTO stands for Probably Testing, Obviously, as far as it's concerned.",
    "Has personally reviewed the whole tank's swim patterns, unasked.",
    "Never actually rests. This is presented as a virtue."]],
  ["The Slacker Snail", "gets there eventually, allegedly", [
    "Reply-all is the only cardio it does, and it doesn't even do that.",
    "Has been 'on its way over' since the last feeding.",
    "Technically completed a full lap of the tank. Eventually."]],
  ["The Consultant Lionfish", "impressive-looking, questionable ROI", [
    "Recommends leveraging core competencies to move the algae needle.",
    "Charges a full pellet just to look at the filter.",
    "Nobody is sure what it actually does, and it prefers it that way."]],
  ["The Security Guard Grouper", "big, still, watching everything", [
    "Doesn't care if you're the CEO Angelfish. Badge, please.",
    "Has not moved from that rock in three days. Everything is fine.",
    "Sees all. Reports selectively."]],
  ["The Receptionist Cleaner Fish", "knows everyone's business, keeps things running", [
    "Knows where every fish is at all times. Sleeps well anyway.",
    "The tank would functionally collapse without it. Nobody says thanks.",
    "Cleans up more messes than anyone will admit exist."]],
  ["The Data Nerd Discus", "meticulously symmetrical, mildly delicate", [
    "Given enough dimensions, it will prove literally anything.",
    "Reacts poorly to asymmetric gravel placement.",
    "Has a spreadsheet. Nobody asked. Everyone should look at it."]],
  ["The DevOps Firefighter Fish", "appears exactly when something's on fire", [
    "3am page, no problem. It's always the filter.",
    "Has never once been asked to attend a calm meeting.",
    "Somehow already awake before the alarm goes off."]],
  ["The Product Manager Pufferfish", "sketches the tank's roadmap in bubbles", [
    "It's not a bug the tank didn't want, it's a feature nobody asked for.",
    "Has a roadmap. It changes daily. This is considered normal.",
    "Sketches quarterly plans in bubbles that pop before Q2."]],
  ["The QA Tester Crab", "pokes at everything, finds the one loose rock", [
    "Found 47 problems with the castle. You're welcome. Also, sorry.",
    "Pokes every rock in the tank on principle.",
    "Has never once accepted 'it works on my side of the glass.'"]],
  ["The Marketing Guru Neon Tetra", "bright, loud, surprisingly effective", [
    "Wants the whole tank to go viral. Organically. By Friday.",
    "Genuinely got the filter trending once. Nobody knows how.",
    "Insists every fish has 'a personal brand,' whether they want one or not."]],
  ["The Facilities Legend Loach", "fixes the filter nobody else understands", [
    "Duct tape, spare parts, and zero questions asked.",
    "The only fish who has actually read the filter manual.",
    "Fixed the light timer blind, by feel, in under a minute."]],
  ["The Founder-Bro Betta", "insists the tank is basically the ocean now", [
    "Ramen-flake profitable, emotionally bankrupt.",
    "Refers to the gravel as 'our current infrastructure.'",
    "Has pitched the tank to three separate visiting fish this week."]],
  ["The Office Veteran Koi", "been there since before the no-feeding-after-6pm rule", [
    "New CEO Angelfish, old koi. Seen it all before.",
    "Remembers when the filter was a completely different filter.",
    "Still the calmest fish in the tank, on principle."]],
];

const HATS = [
  ["Tiny Top Hat", "surprisingly formal for something with gills"],
  ["Party Hat", "off-brand, always slightly too big"],
  ["Sunglasses, worn indoors, always", "the CEO Angelfish's personal favorite"],
  ["Hard Hat", "for a fish that takes safety very seriously"],
  ["Wizard Hat", "casts no spells, radiates confidence anyway"],
  ["Sales-style Headset", "just circling back, from the reef"],
  ["Plastic Dollar-Store Crown", "self-appointed royalty"],
  ["Beret", "the Creative Betta insisted"],
  ["Propeller Cap", "technically increases swim speed by 0%"],
  ["Cowboy Hat", "yeehaw, from the bottom of the tank"],
  ["Graduation Cap", "congratulations on surviving another sprint"],
  ["Slightly Crooked Halo", "nobody believes it, including the fish"],
];
