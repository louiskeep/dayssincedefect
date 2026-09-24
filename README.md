# Days Since Defect

A small, offline browser game for a team's sprint reviews. It's a "days since last
incident" board reimagined as a cozy pixel break room: log your sprints to level up,
let bits pile up while the build stays green, spend them on office bobbleheads, and own
your defects when they happen. Collect all 24 bobbleheads and hit max level to fight the
Defect Dragon and win the season.

No install, no server, no build step. It's plain HTML/CSS/JS and saves to the browser's
localStorage, so the whole thing zips up and runs from a folder.

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8099
```

then visit `http://localhost:8099/`.

## The room

Everything happens by clicking props in the break room:

- **Calendar**: log a sprint (points level you up)
- **Vending machine**: spend bits on a random bobblehead (24 to collect)
- **Fire alarm**: report a defect (answer one post-mortem question, take the hit)
- **To-do board**: team to-dos and the season's post-mortem log
- **Fortune cookie**: draw a random sprint-review question
- **Fridge**: your earned achievement magnets

Facilitators can tune the season length and difficulty, and edit the question bank, from
the settings (⚙) panel: set your sprint length, average points per sprint, and desired
season length, and the game balances leveling and collecting to finish together.

## Layout

```
index.html      title / landing screen (the front door)
game.html       the game screen
src/
  game.js       all game logic and content (bobbleheads, config, engine, UI)
  game.css      styles
assets/         pixel art: backgrounds, characters, props, bobbleheads
docs/
  DESIGN.md     design notes
  reference.png original style reference
  specs/        historical specs and content drafts
archive/        earlier prototypes and dev-only review pages (kept for history,
                not part of the live game; internal links may be stale)
```

The whole game is `index.html` + `game.html` + `src/`. Nothing in `archive/`,
`docs/`, or the `*-backup*/` folders is loaded at runtime.
