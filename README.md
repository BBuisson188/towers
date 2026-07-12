# Alien Tower Battle - Browser Prototype

This folder contains the current creative direction, approved visual references, prototype requirements, long-term roadmap, and the first static browser prototype for a mobile-friendly action-strategy game.

## Play locally

The prototype is plain HTML/CSS/JavaScript. For the most reliable local browser test, open a terminal in this folder and run:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

The same static files can be published with GitHub Pages later.

## Design docs

1. Read `docs/CODEX_HANDOFF.md` completely.
2. Read `docs/IMPLEMENTATION_PLAN.md` for the build sequence.
3. Use `docs/GAMEPLAY_CONFIG.md` for temporary prototype values.
4. Review `reference_art/approved/` for the locked visual direction.
5. Treat `reference_art/exploration/` as supporting reference only.

## Important instruction

Do not attempt to build the entire planned game at once. First create the offline vertical-slice prototype defined in the handoff. Future systems are documented so they can be added later without being forgotten.

## Current technical direction

Build as a static browser game for PC and iPad testing, hosted later through GitHub Pages. Keep gameplay values data-driven so they can be adjusted without rewriting combat code.

## Current playable build

The browser version now includes a complete 3-vs-3 match loop: automatic tower combat, manual target orders, permanent soldier deployment, player and AI shields, difficulty selection, damage and destruction, pause, victory/defeat, restart, touch controls, effects, and procedural sound. Players can also choose blue or red and unlock a faction-specific comeback special after losing their first tower: the Blue Giant or Red Megalodon targets one tower, waits out its shield, destroys it, and leaves.
