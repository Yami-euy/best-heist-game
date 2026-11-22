# The Star of Merdeka

[![Make the best heist game](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![Rank](https://make.fun/badge/best-heist-game-20261122-0559/Yami-euy/best-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![Reward](https://make.fun/badge/best-heist-game-20261122-0559/Yami-euy/best-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

A side-view platformer heist game, built from scratch in plain JavaScript
and canvas. You are Rook, a thief slipping into a museum after midnight to
steal the Star of Merdeka — a diamond in the vault — and get out the shutter
door before the guards lay a hand on you.

The sprites are hand-drawn characters, props and backgrounds cut from a
sprite sheet: the clown-masked thief, the black-clad thief with a laptop,
gas-masked crew, police with flashlights and batons, money stacks, gold
bars, duffel bags, safes, the vault, CCTV cameras, red lasers, crates,
drums, tires, ladders and shutter doors. Every category of the sheet is
used: characters, items and props, platforms and backgrounds.

## How to play

- **A / D or ← / →** — run left and right
- **W / ↑ / Space** — jump (coyote time + jump buffer, so jumps feel fair)
- **W / S on a ladder** — climb up and down
- **Shift** — sneak (slower, much harder for guards and cameras to spot)
- **Walk over loot** — money, gold and bags are picked up AUTOMATICALLY the
  instant you touch them. No button, no waiting, no hold-to-grab. If you
  can see it and you touch it, it is yours.
- **E near the vault** — grab the Star of Merdeka (big radius, instant, one
  press). A big yellow prompt — "Tekan E untuk ambil berlian!" — tells you
  when you are close enough. No channel, no hold.
- **E near the laptop** — hack the lasers off for 8 seconds (once per level that has one)
- **Q** — smoke bomb (2 per level early on, 1 per level from level 7)
- **X near a guard** — stun him for 4 seconds (frozen, blind, cannot catch you; 2 charges per level, refilled every level). A stunned guard shakes it off and investigates the spot where he was stunned. One stun, one guard — you cannot freeze the whole floor at once.
- **Walk over a jammer** — a signal jammer lying in the level (one per level from level 2) is pocketed automatically, like loot. **F** spends one jammer to shut ALL cameras off for 6 seconds. There is no free EMP anymore: F only works if you carry a jammer you found.
- **Click** — toss a coin; the nearest guard walks over to investigate

## The ten levels

The heist gets harder every floor. Guards patrol faster and see further,
cameras sweep faster, lasers multiply, loot spreads out, and tools get
scarcer — but every level can be beaten with planning. Difficulty scaling
per level:

| Level | Guards | Cameras | Lasers | Loot | Tools |
|-------|--------|---------|--------|------|-------|
| 1 Rooftop & Stairs | 1 (95) | 0 | 0 | 3 | smoke 2, stun 2 |
| 2 The Vault | 2 (95) | 2 | 2 | 2 + ◆ | smoke 2, stun 2, jammer 1 |
| 3 Getaway | 2 (105) | 1 | 2 | 2 | smoke 2, stun 2, jammer 1 |
| 4 Second Floor | 2 (110) | 2 | 1 | 4 + ◆ | smoke 2, stun 2, jammer 1 |
| 5 The Gallery | 3 (120) | 2 | 2 | 4 + ◆ | smoke 2, stun 2, jammer 1 |
| 6 The Archive | 3 (130) | 3 | 2 | 5 + ◆ | smoke 2, stun 2, jammer 1 |
| 7 The Strongroom | 4 (140) | 3 | 3 (1 sliding) | 5 + ◆ | smoke 1, stun 2, jammer 1 |
| 8 The Server Room | 4 (150) | 4 | 3 | 6 + ◆ | smoke 1, stun 2, jammer 1 |
| 9 The Penthouse | 5 (160) | 4 | 4 (1 sliding) | 6 + ◆ | smoke 1, stun 2, jammer 1 |
| 10 The Grand Vault | 5 (170) | 5 | 4 | 6 + ◆◆ | smoke 1, stun 2, jammer 1 |

(Guard numbers are patrol speed in px/s; chase speed is faster still and
grows with the level, from 200 up to 260. Camera sweep speed and cone
range grow the same way.)

1. **Rooftop & Stairs** — climb ladders, hop between steel platforms, grab
   three bags of loot while one guard patrols the floor.
2. **The Vault** — the Star sits in front of a huge vault door, guarded by
   red lasers, two sweeping CCTV cameras and two guards. Hack the laptop to
   kill the lasers, grab the diamond with E, then reach the exit.
3. **Getaway** — you already have the Star. The alarm starts at 40, the
   guards converge and the camera sweeps faster. Two lasers, one camera, two
   guards between you and the shutter door. Do not stop.
4. **Second Floor** — two guards (one on the high platform), two cameras,
   one laser, four loot, and a diamond on the middle platform under the
   camera. A jammer lies on the far right floor.
5. **The Gallery** — four platforms, three guards, a laptop to hack, two
   lasers, four loot, and a diamond on the far end of the top platform.
6. **The Archive** — three cameras sweep the hall, three faster guards, two
   lasers, five loot, and a diamond on the middle platform — right where
   the third guard patrols.
7. **The Strongroom** — four guards, three cameras, and a laser that SLIDES
   across the high platform. One smoke bomb only. Hack the laptop, then move.
   The diamond sits on the top platform in the fourth guard's patrol.
8. **The Server Room** — four cameras, four guards, three lasers, six loot,
   one diamond on the top platform. One smoke bomb. Plan every step.
9. **The Penthouse** — five guards, four cameras, four lasers (one sliding),
   six loot, one diamond on the top platform in the fifth guard's patrol.
   One smoke bomb. Stun the one in your way, jam the cameras.
10. **The Grand Vault** — the biggest Star of all, plus a second diamond on
    the top platform. Five guards, five cameras, four lasers, the alarm
    already at 20 — and the exit only opens once you hold BOTH diamonds.
    The longest getaway in the game.

## The rules of the night

- A guard's **yellow cone** is its sight. Cross it in the open and suspicion
  climbs; at "?" it comes to look, at "!" it chases you. A guard that
  touches you catches you — there is no fighting back.
- A camera's **red cone** sweeps back and forth. Cross it and the alarm meter
  climbs fast. The only way to shut cameras off is a **jammer** you picked up
  in the level (F, 6 seconds) — there is no free EMP.
- A **laser beam** is a red line across the room. Touch it and the alarm
  jumps by 60. Jump over it, or hack the laptop to turn the lasers off.
- **Stun (X)** freezes one guard for 4 seconds — he cannot move, see or catch
  you, and the full alarm cannot re-order him while he is stunned. When he
  wakes he investigates the spot. It costs one of 2 charges per level, and
  pressing X with no guard nearby (or on an already-stunned guard) spends
  nothing.
- **Crates, drums and tires are cover** — a cone cannot see through them.
  Read the patrols before you move; the cones tell you where it is safe.
- The **alarm meter** rises while you are seen and falls while you hide.
  At full it trips — and now it MEANS it: **every guard switches to chase
  at once** ("!" over every head, a flashing red "ALARM! SEMUA POLISI
  MENGEJAR!" banner, the siren), they hunt the last spot you were seen
  and do not give up until the meter falls back below 50. Smoke still
  breaks their tracking (they fall back to your last seen spot), a camera
  that spots you feeds your position to every guard, and a coin still pulls
  the nearest guard away. Breaking line of sight lets the meter fall again —
  the alarm is a manhunt, not an instant loss, but you have to move.
  (v3 fixed two real bugs here: the meter used to be fed by the chasing
  guards themselves, so a tripped alarm could never drain and never clear;
  and the guards used to chase your live position through walls, so hiding
  was impossible. Now the meter drains when nobody sees you, the hunt
  clears below 50, and the guards hunt your last seen spot.)
- **Tools have a cost**: smoke bombs are limited (and scarcer upstairs),
  stun charges are 2 per level, and a jammer must be found in the level
  before F does anything — one jammer, one 6-second blackout. A coin only
  distracts the nearest guard. Spend them where they matter.
- Finish without ever being detected for the **ghost bonus (+500)**. The
  score also counts loot, the diamond (+1000 each), and a time bonus for a
  fast getaway.
- **The loot counter is per level** (v4 fix): the HUD and the "LEVEL SELESAI"
  screen always show this level's collected / total — never more than the
  total. The v3 bug carried the count across levels (cumulative numerator,
  per-level denominator, so level 2 showed 8/3) and a retry after being
  caught re-counted the same loot. Now the counter resets every level, the
  diamond exit needs every diamond of THIS level, and the win screen shows
  the run total (52 loot across all 10 levels).

## Verified (v4, headless play-test, 111/111 checks pass)

- **Loot counter, proven on all 10 levels:** every level starts at 0/total
  and ends at total/total on its "LEVEL SELESAI" screen (3/3, 3/3, 2/2, 5/5,
  5/5, 6/6, 6/6, 7/7, 7/7, 8/8); the run total is 52/52 on the win screen.
  A retry after being caught resets the level counter to 0, and re-collecting
  the same loot counts 1, not 2. Zero console/page errors.
- **Diamonds in the upper levels:** levels 4–9 each hide one diamond (on a
  platform a guard patrols, under a camera), level 10 hides two; every one
  is taken with a single press of E and adds exactly 1 to the counter. The
  level-10 exit stays shut until BOTH diamonds are held.
- **Stun (X), proven end to end:** 2 charges per level; X near a guard
  freezes him for 4 seconds (no movement, no vision, touching him does not
  catch you) and spends exactly 1 charge; X on an already-stunned guard or
  far from any guard spends nothing; on recovery the guard investigates the
  stun spot (suspicion ~50, decaying) and returns to patrol.
- **Jammer (F), proven end to end:** every level from 2 starts with 0
  jammers and F does nothing; walking over the jammer pockets it (HUD
  "Jammer: 1"); F spends it and all cameras go dark for 6 seconds — a thief
  standing in a camera cone raises no alarm while jammed; a second F with
  0 jammers does nothing.
- **Grab unchanged:** small loot is still walk-over automatic, the diamond
  and the laptop are still one instant press of E. Real-key controls
  verified: hold D runs, Space jumps, W climbs a ladder. A static
  reachability check confirms every loot, diamond, jammer, laptop and exit
  is reachable from the spawn on all 10 levels.

## Verified (v3, headless play-test, 41/41 checks pass)

- **Alarm chase, proven end to end:** standing on a laser twice trips the
  meter to 100, and every guard switches to chase at once (suspicion 100,
  "!" overhead) and runs toward the last seen spot; while the alarm is up
  they never give up. Hide (no guard cone, no camera on you) and the meter
  drains at 8/s, the alarm clears below 50, and every guard stands down to
  investigate. Zero console/page errors.
- **Every level winnable:** all 10 levels were played through — every loot
  grabbed by walking over it, the diamond taken with E on levels 2 and 10,
  the laptop hacked with E where present, the exit opened and the level
  completed (level 10 ends in the win screen). A static reachability check
  also confirms every loot, diamond, laptop and exit is reachable from the
  spawn by walking, jumping and ladders on all 10 levels.
- **Grab unchanged:** small loot is still walk-over automatic, the diamond
  and the laptop are still one instant press of E. Nothing about the grab
  was touched.

Open `game/index.html` in a desktop browser (or serve the `game/` folder
with any static server). No network, no libraries, no build step — plain
JavaScript modules and canvas, with small WebAudio blips for detection,
loot, the alarm and the win.

## Source layout

Each file does one job, named for it:

- `game/src/config.js` — every number the game tunes against
- `game/src/input.js` — keyboard and mouse state
- `game/src/levels.js` — the ten levels (platforms, ladders, guards, cameras, lasers, loot)
- `game/src/physics.js` — AABB collision, line-of-sight, vision-cone tests
- `game/src/guards.js` — patrols, vision cones, suspicion, investigate, chase
- `game/src/cameras.js` — sweeping cones and the jammer blackout
- `game/src/lasers.js` — laser beams and the laptop hack
- `game/src/thief.js` — run, jump, climb, sneak, walk-over grab, E interactions
- `game/src/alarm.js` — the alarm meter and the alarm state
- `game/src/sprites.js` — sprite manifest and loader
- `game/src/render.js` — the museum at night, the cones, the HUD, the screens
- `game/src/audio.js` — WebAudio blips, no sound files
- `game/src/shots.js` — deterministic staged states (`?shot=`) for screenshots
- `game/src/main.js` — the game loop and the state machine

## Screenshots

The cover (`1-cover.jpg`) is the Vault level mid-heist: the thief on a
platform, two guards with yellow cones, a camera with a red cone, the
glowing diamond in front of the vault and the alarm meter, all in one frame.
The alarm shot (`2-alarm.jpg`) is the proof of the alarm fix: level 7 with
the meter at 100, the red ALARM banner, and all four guards in "!" chase.
The others show the getaway with the Star, and the clean-getaway screen.
Every screenshot is a real render of the game's own code, staged with
`?shot=`.
