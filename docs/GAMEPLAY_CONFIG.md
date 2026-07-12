# Temporary Gameplay Configuration

These are prototype starting values, not final balance. Put them in editable Godot Resources or a centralized configuration file.

## Design target
- Typical 3-vs-3 match: approximately 2–4 minutes.
- Player must have time to recognize danger and use a shield.
- Soldiers must be a meaningful tactical trade, not a strictly stronger or weaker tower.

## Towers
- Max health: 150
- Basic weapon damage: 12
- Fire interval: 1.0 seconds
- Projectile travel time across most of battlefield: about 0.7–1.0 seconds
- Target reacquisition delay: 0.25 seconds
- Destruction: disable weapon immediately; play 1–2 second collapse/effect; retain wreckage or remove after effect based on readability.

Approximate result: one basic tower needs 13 successful hits to destroy an undamaged tower.

## Soldiers
- Max health: 36
- Weapon damage: 10
- Fire interval: 0.85 seconds
- Movement speed: tune to cross the central battlefield in about 12 seconds without interruption
- Target range: medium-long, sufficient to fire while advancing
- Tower conversion time: 0.75 seconds with clear visual effect
- Soldier spawn offset: in front of source tower

Approximate result:
- A soldier dies to 3 tower hits or 4 soldier hits.
- A surviving soldier can threaten a tower but is vulnerable while crossing open ground.
- Soldier value comes from movement, target pressure, and anti-soldier priority—not raw durability.

## Targeting
- Each attacker owns one current target.
- Automatic priority for towers: nearby threatening soldier, then damaged/nearest enemy tower.
- Automatic priority for soldiers: enemy ground soldier, then lane/forward tower.
- Player tap assignment chooses one attacker using this order:
  1. currently idle valid attacker
  2. attacker with lowest retargeting cost
  3. nearest valid attacker
- Apply a brief 0.15-second highlight to show which friendly unit accepted the order.

## Shield
- Total uses: 3
- Active duration: 5 seconds
- Cooldown starts when shield ends: 10 seconds
- Damage blocked: 100% normal damage
- Shield activation feedback: bright blue dome, low-frequency energy sound, HUD pulse
- Special one-hit creatures/boss attacks: defer exact interaction; use normal blocking only in the prototype because those attacks do not exist yet.

## Fortress AI prototype
- Decision tick: every 0.5 seconds
- Easy reaction delay: 1.5–2.5 seconds
- Medium reaction delay: 0.8–1.5 seconds
- Hard reaction delay: 0.25–0.8 seconds
- Shield use: activate when projected incoming damage or low-health tower risk crosses a threshold; add imperfect timing on easier difficulties.
- Target selection: avoid perfect focus fire on Easy; improve damaged-target finishing and soldier threat response at higher difficulty.

## Draw detection
Declare draw if, for 8 continuous seconds:
- neither side has any active weapon or living soldier capable of attacking, or
- all remaining units have no reachable valid targets.

Do not declare draw merely because no damage has happened during an active shield or projectile travel period.

## Rewards — future placeholder only
- Win: 100 coins
- Loss: 25 coins
- Draw: 40 coins
- Boss victory: 300 coins plus 1 tower unlock
- Special creature unlock target: 8,000 coins

Do not implement economy in the first vertical slice, but keep reward hooks/events in the match result model.
