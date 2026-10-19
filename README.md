# Abacus Trainer

An interactive soroban that explains how the abacus works, walks you through using it, and drills you with problems that get harder as you go.

## Running it

```sh
npm install
npm run dev      # local dev server
npm test         # unit tests (model, solver, generators, lesson content)
npm run build    # typecheck + static build into dist/
```

The build is a static site with a relative base path, so `dist/` can be served from anywhere (GitHub Pages included).

## Layout

| Path | What it is |
|------|------------|
| `src/model/` | Frame specs, rod/bead state, bead moves. Pure data; stores how many beads per deck touch the bar, so soroban (1/4) and suanpan (2/5) are just different specs. |
| `src/solver/` | Reference add/sub solver that records the technique each digit needs (direct, five-complement, ten-complement, combined), problem generators, and captions for demos. |
| `src/lessons/` | Level content as data: explanation text, live "try it" tasks, solver-driven demos, practice sets. |
| `src/ui/` | Preact components: the SVG abacus, demo player, practice sessions, free play. |
| `src/progress.ts` | Per-set attempt history in localStorage, with export/import. |

## How problems are made

Practice problems come from rejection sampling: random terms are run through the solver, and a problem is kept only if every technique it needs is allowed for the level (and it uses the level's target technique, when there is one). So a "direct" problem never sneaks in a carry.

Answers are currently checked by final value only. The frame logs every bead move, which is what later technique grading will use.

## Status

Levels 0 to 5 (anatomy, setting and reading numbers, direct addition and subtraction, five-complements, ten-complements, combined five/ten complements). Multiplication and division are next. Free play includes a suanpan frame to show the model handles it; lessons are soroban only.
