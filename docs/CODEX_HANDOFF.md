# Codex Handoff: Alien Tower Battle

## 1. Project goal

Build a polished but initially small 3D action-strategy game for tablet/mobile. Two compact groups of futuristic towers face each other on a flat alien battlefield. Towers fire automatically. The player taps enemies to redirect one available friendly attacker, times a whole-base shield, and may permanently convert a firing tower into a mobile soldier.

The first milestone is an **offline playable vertical slice**, not the complete commercial game.

## 2. Creative direction

### World
- Clean, simple science-fiction technology placed on an alien planet.
- Flat reddish-brown battlefield, bright artificial blue sky, distant alien rock formations, occasional purple or blue crystals.
- The battlefield itself must remain uncluttered and readable.
- Fixed camera behind and slightly above the blue base. No player-controlled rotation or zoom.
- Both bases must remain visible on the same screen.

### Player and enemy language
- Player faction: blue glow, pale gray/blue-gray structures and armor.
- Enemy faction: red glow, darker gray structures and armor.
- Shapes should be clean and readable at iPad viewing distance, not overly mechanical or covered in tiny details.

### Approved references
- Tower: `reference_art/approved/zenith_tower_character_sheet.png`
- Soldier: `reference_art/approved/energy_infantry_character_sheet.png`
- Red special creature: `reference_art/approved/void_wyrm_shark_character_sheet.png`
- Blue special creature: `reference_art/approved/blue_giant_primal_beast_character_sheet.png`

The sheets contain concept text and speculative stats. Their **visual design is authoritative**; their printed gameplay numbers are not.

## 3. Core game rules

### Match setup
- A new player begins with 3 towers.
- In a normal match, both sides always begin with the same number of tower structures.
- Towers are positioned in a compact, slightly circular/staggered cluster rather than a straight row.
- The win condition is to destroy every enemy tower structure.
- A tower that has produced a soldier still remains a destructible structure and still counts toward the win condition.

### Active towers
- Every unconverted, undestroyed tower carries one equipped gun.
- Towers automatically seek and fire at valid targets.
- The player may tap an enemy tower or enemy soldier to redirect **one suitable available friendly attacker** to that target.
- Tapping must not cause every friendly tower to focus the same target.
- Other friendly attackers continue their existing automatic behavior.
- Tower weapons emerge from the structure without a large visible rotating turret. The top/energy channel may pulse when firing.

### Converting a tower into a soldier
- During battle, the player can select an active tower and choose `Deploy Soldier`.
- This action is permanent for that match.
- The tower structure remains in place and remains destructible.
- Its gun is permanently disabled.
- It produces exactly one soldier.
- It never creates another soldier, even after that soldier dies.
- The soldier moves straight toward the enemy side.
- Soldiers automatically prioritize enemy ground soldiers when any are valid threats.
- Otherwise, a soldier attacks the tower generally in front of its lane.
- A player tap may redirect one soldier to a different valid target.
- Soldiers and towers can damage both soldiers and towers.

### Shield
- One shield button protects the entire friendly base area, including friendly towers and friendly soldiers currently within the shield volume.
- The shield lasts 5 seconds.
- It blocks normal incoming damage while active.
- The shield has 3 total activations per match.
- After each activation ends, the next activation is unavailable for 10 seconds.
- Shield activations cannot overlap or be queued.
- After the third use, the shield becomes permanently disabled for that match.
- The AI follows the same shield-use limit.

### Match resolution
- Destroy all enemy tower structures to win.
- If neither side has any remaining unit capable of dealing damage, declare a draw and show Restart/Main Menu. Do not silently restart.
- No fixed battle timer in the first version.

## 4. AI strategies

The full game should offer selectable AI personalities. The first prototype only needs Fortress AI, but architecture must support the other strategies.

### Fortress AI
- Converts no towers.
- Every tower remains a gun platform.
- Uses targeting and shields.

### Everything AI
- Eventually converts every tower into a soldier.
- Conversion should occur over time rather than all in one frame.
- The empty structures remain valid targets and must be destroyed.

### Mix AI
- Converts approximately half its towers into soldiers.
- Keeps approximately half as gun towers.
- For odd tower counts, randomly choose which side receives the extra unit while preserving reasonable balance.

### Difficulty
Difficulty should primarily change reaction time, target selection quality, conversion timing, and shield timing—not inflate health dramatically.

## 5. First playable vertical slice — required now

Build only the following:
- Godot 4.x 3D project.
- One flat alien battlefield.
- Fixed three-quarter camera with all 6 starting towers visible.
- 3 blue towers and 3 red towers.
- Temporary simplified 3D models are acceptable.
- One basic gun type.
- Automatic targeting and shooting.
- Tap/click an enemy to assign one friendly attacker.
- Tower health, soldier health, projectiles, damage, destruction.
- Select a friendly tower and permanently deploy one soldier.
- Whole-base shield with 3 uses, 5-second duration, 10-second cooldown.
- Fortress AI.
- Pause, victory, defeat, draw, restart, and main-menu flow.
- Mouse controls in desktop testing and touch controls on tablet/mobile.
- Debug overlay or developer panel exposing core balance values during testing.

## 6. Explicitly deferred — document and architect for later, but do not build now

These are part of the intended game and must remain in the roadmap:

### Progression
- Players earn coins/points through battles and boss victories.
- New players own 3 towers.
- Defeating a boss unlocks one additional tower.
- The original concept allows repeated boss victories to continue increasing owned tower count, potentially to 25+ towers.
- Before implementing large counts, test battlefield readability and set a practical active-battle cap if needed. Ownership and deployed count may become separate concepts.

### Store / armory / loadout
- Main menu has a dedicated store/armory area.
- Players buy or unlock different guns using earned currency (the conversation used both “coins/points” and “rings”; begin with one soft currency internally and leave room for a second currency later).
- Players can view their towers and switch equipped guns before battle.
- Converting a tower into a soldier remains an in-battle tactical choice, not a permanent store assignment.
- Loadout UI should eventually support selecting weapons per tower or applying a weapon to multiple towers.

### Additional guns
Future weapons should differ in behavior, not merely be direct power upgrades. Candidate archetypes:
- Basic energy rifle/cannon
- Rapid-fire gun
- Heavy slow cannon
- Accurate energy beam/laser
- Short-range spread weapon
- Long-range slow precision weapon

No missile weapon is required for the core design. The user specifically preferred avoiding missiles in normal tower combat.

### Boss mode
- Bosses are not part of regular AI or PvP matches.
- Bosses have a separate selectable mode/encounter.
- No linear level campaign is required; players select an opponent or boss and choose difficulty.
- Early remembered boss inspirations: a brown burrowing/inchworm sand creature and a purple-green octopus creature firing red fiery beams.
- Each boss victory grants a tower unlock under the current concept.

### Special creatures used in normal battles
Two rare unlockable special units exist outside boss mode:

**Red Dragon Megalodon / Void Wyrm Shark**
- Approved visual reference is the Void Wyrm Shark sheet.
- Swoops down and destroys/eats one tower.
- Unlock target discussed: 8,000 currency.

**Blue Giant / Primal Beast**
- Approved visual reference is the Blue Giant sheet.
- Jumps onto one tower and crushes it.
- Unlock target discussed: 8,000 currency.

Special interaction concept:
- When opposing matching or conflicting special creatures appear, they may neutralize each other or result in no tower destruction.
- Exact cancellation rules are not yet fully locked and must be designed/tested later.
- AI gets access to one special creature in roughly 5 out of 20 eligible battles (25% chance), so a player's special creature may sometimes be canceled or have no effect.
- These should be rare dramatic events, not routine attacks.

### Multiplayer
- Eventual player-versus-player mode is intended.
- Do not build networking initially.
- Build combat simulation deterministically enough that online synchronization can be added later.
- Future requirements include accounts, matchmaking, reconnection, authoritative results, anti-cheat, and latency handling.

### Additional content
- More alien battlefields/biomes.
- Cosmetic tower variations that preserve silhouette and function.
- Damage states: sparks, smoke, fire, armor fragments, collapse/wreckage.
- Audio, haptics, onboarding/tutorial, settings, accessibility, save data, analytics.

## 7. Screens and navigation

### Prototype flow
1. Main Menu
2. Battle Setup
3. Battle
4. Victory / Defeat / Draw
5. Restart or Main Menu

### Future full menu
- Battle
- Bosses
- Practice
- Armory / Store
- Tower Loadout
- Statistics / Collection
- Settings

### Battle HUD
- Shield button
- Shield uses remaining
- Shield cooldown indicator
- Deploy Soldier button when a valid friendly tower is selected
- Selected friendly unit indicator
- Selected target indicator
- Readable tower and soldier damage states/health
- Pause button

Keep HUD large and touch-friendly. Avoid tiny text and excessive panels during combat.

## 8. Battlefield layout

For 3 towers per side, use triangular/staggered clusters:

```text
                    RED SIDE

                     R2
               R1          R3

                central combat space

               B1          B3
                     B2

                    BLUE SIDE
             fixed camera behind blue
```

Exact spacing should visually suggest a compact base. The original memory estimated roughly 13 meters between nearby towers in real-world scale, but visual readability takes priority.

For future tower counts, define layouts procedurally or as authored formations. Do not simply create one long row.

## 9. Interaction design

### Desktop test controls
- Left click enemy: assign one available attacker.
- Left click friendly tower: select tower.
- `Deploy Soldier` UI button: convert selected tower.
- Shield UI button or keyboard shortcut: activate shield.
- Escape: pause.

### Touch controls
- Tap enemy: assign one available attacker.
- Tap friendly tower: select tower and reveal context action.
- Tap `Deploy Soldier`: confirm conversion with a brief clear prompt or hold action to prevent accidental conversion.
- Tap shield: immediate activation if available.

No camera controls in normal play.

## 10. Architecture requirements

- Use data-driven resources/configuration for unit stats, weapon stats, shield settings, rewards, and AI timings.
- Separate simulation state from presentation where practical.
- Use clear state machines for tower, soldier, shield, AI, and match state.
- Avoid hard-coding exactly three towers into combat logic. The first scene uses three, but systems must support variable counts.
- Use object pooling for projectiles/effects once needed.
- Include deterministic random seeds for AI decisions where practical.
- Save progression later through a versioned save-data schema.
- Keep art replaceable: prototype meshes/materials should be swappable without rewriting gameplay code.

## 11. Naming conventions

Working project name: `AlienTowerBattle`.

Suggested core classes/scenes:
- `MatchController`
- `Battlefield`
- `CombatUnit`
- `TowerUnit`
- `SoldierUnit`
- `WeaponController`
- `Projectile`
- `ShieldController`
- `TargetingController`
- `AIController`
- `MatchHUD`
- `GameConfig`

Use descriptive names and typed GDScript where possible.

## 12. Definition of done for vertical slice

The vertical slice is complete when:
- A match launches from the main menu.
- Both sides spawn three tower structures.
- Active towers automatically acquire and attack targets.
- The player can tap an enemy and redirect exactly one friendly attacker.
- Damage and destruction work reliably.
- The player can convert a selected tower into exactly one soldier.
- The converted tower never fires or spawns again, but remains destructible and required for victory.
- Soldiers move, prioritize enemy soldiers, and otherwise attack a forward tower.
- Shield protects the friendly base and nearby friendly soldiers.
- Shield lasts 5 seconds, has 10-second recharge, and exactly 3 uses.
- Fortress AI can complete a match.
- Victory, defeat, and draw states are detected correctly.
- Restart creates a clean new match without duplicate signals, objects, or stale state.
- Core values can be adjusted from data/config without editing combat algorithms.
- Desktop mouse and touch input both work.

## 13. Design authority and ambiguity rule

When an exact number is not specified, choose a reasonable temporary value from `GAMEPLAY_CONFIG.md`, expose it in data, and continue. Do not block implementation for minor balancing questions. Ask only about major creative changes that alter the fundamental game.
