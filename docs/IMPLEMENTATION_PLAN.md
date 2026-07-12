# Incremental Implementation Plan

## Phase 0 — Project setup
- Create Godot 4.x 3D project.
- Establish folders, autoload/config, input actions, coding conventions, and a simple test scene.
- Add a project README with run/export instructions.

## Phase 1 — Static battlefield
- Flat alien terrain, sky/environment, fixed camera, 3 blue and 3 red placeholder towers.
- Confirm all structures are visible on common tablet aspect ratios.
- Add simple selection highlighting.

## Phase 2 — Tower combat
- CombatUnit base, health, damage, death.
- Basic weapon and projectile.
- Automatic target acquisition.
- Tap-to-assign exactly one friendly attacker.
- Health/damage visualization and tower destruction.

## Phase 3 — Match lifecycle
- MatchController, win/loss/draw evaluation.
- Main menu, battle launch, pause, results, restart.
- Ensure restarts are clean and repeatable.

## Phase 4 — Soldier conversion
- Select tower and deploy soldier.
- Permanently disable source tower gun and spawn exactly one soldier.
- Soldier movement, ground-unit priority, forward-tower fallback, manual redirection.
- Source tower remains destructible and required for victory.

## Phase 5 — Shield
- Whole-base dome, 5-second duration, 10-second cooldown, 3 uses.
- Damage interception and HUD state.
- AI shield usage.

## Phase 6 — AI and tuning
- Fortress AI first.
- Difficulty reaction settings.
- Debug balance panel and telemetry: match duration, damage, shield timing, unit survival.
- Play-test and tune values.

## Phase 7 — Visual replacement pass
- Replace placeholders with simplified 3D models based on approved sheets.
- Add blue/red faction variants, firing pulses, damage states, destruction effects, sound, and haptics.

## Phase 8 — Second prototype milestone
- Add Everything AI and Mix AI.
- Add battle setup screen for AI strategy and difficulty.
- Add basic local save for settings only.

## Later roadmap
1. Currency and persistent progression.
2. Armory/store and weapon loadouts.
3. Additional weapons.
4. Boss mode and tower unlock progression.
5. Blue Giant and Void Wyrm special units.
6. Expanded tower formations and larger tower counts.
7. Additional maps and cosmetics.
8. Online PvP only after offline combat is stable and deterministic.

## Codex working style
- Make small, reviewable commits or checkpoints.
- Keep the project runnable after every phase.
- Add tests for pure logic where practical.
- Do not invent major game systems outside this handoff.
- Put uncertain balance values in configuration and proceed.
