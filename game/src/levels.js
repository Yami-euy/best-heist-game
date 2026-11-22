// levels.js — the 10 levels of The Star of Merdeka (side-view platformer).
// Coordinates are canvas pixels (1280x720, HUD 56px, ground top y=660).
// Platforms are ONE-WAY (land on top when falling, jump through from below).
// Solids (crates, drums) block movement AND guard line-of-sight.
// Loot is walk-over (instant). Diamonds + laptop use E (instant, big radius).
// The jammer is a walk-over pickup (one per level from level 2): F spends one
// to shut all cameras off for 6 seconds. There is no free EMP anymore.
// Per-guard difficulty: def.speed / def.cone / def.chase override the globals.
// Per-level tools: level.smoke (default 2). Stun: 2 charges per level (X).
// Jump reach: ~145px up, ~150px across — platform gaps are kept <= 60px.

export const LEVELS = [
  {
    id: 1,
    name: 'ROOFTOP & STAIRS',
    sub: 'Climb in, grab the loot, reach the door. The crew is waiting.',
    bg: 'bg-top',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 540, w: 340, h: 18 },
      { x: 460, y: 440, w: 360, h: 18 },
      { x: 880, y: 540, w: 340, h: 18 },
    ],
    ladders: [
      { x: 360, y: 540, w: 36, h: 120 },
      { x: 470, y: 440, w: 36, h: 220 },
      { x: 890, y: 540, w: 36, h: 120 },
    ],
    solids: [
      { x: 280, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 1000, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 760, y: 400, w: 60, h: 40, sprite: 'tires' },
    ],
    loot: [
      { x: 200, y: 505, kind: 'money', value: 200, taken: false },
      { x: 620, y: 405, kind: 'bag-brown', value: 400, taken: false },
      { x: 1040, y: 505, kind: 'gold', value: 300, taken: false },
    ],
    diamonds: [], // level 1: no diamond yet, learn the ropes
    jammer: null, // level 1: no cameras, no jammer needed
    laptop: null,
    lasers: [],
    cameras: [],
    guards: [
      { x: 500, minX: 480, maxX: 900, floorY: 660, dir: 1, speed: 55, cone: 280, chase: 190 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'loot' },
    alarmStart: 0,
    decor: [
      { sprite: 'blueprint', x: 700, y: 300, h: 90 },
      { sprite: 'cables', x: 150, y: 640, h: 40 },
      { sprite: 'chair', x: 1150, y: 590, h: 70 },
      { sprite: 'computer', x: 800, y: 400, h: 40 },
      { sprite: 'mask-clown', x: 60, y: 180, h: 60 },
    ],
    crew: [
      { sprite: 'clown-stand', x: 1150, y: 660 },
    ],
  },
  {
    id: 2,
    name: 'THE VAULT',
    sub: 'The Star of Merdeka is in the vault. Mind the lasers and the cameras.',
    bg: 'bg-mid',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 520, w: 320, h: 18 },
      { x: 420, y: 400, w: 360, h: 18 },
      { x: 900, y: 520, w: 320, h: 18 },
    ],
    ladders: [
      { x: 340, y: 520, w: 36, h: 140 },
      { x: 430, y: 400, w: 36, h: 260 },
      { x: 910, y: 520, w: 36, h: 140 },
    ],
    solids: [
      { x: 300, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 980, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 1060, y: 480, w: 60, h: 40, sprite: 'tires' },
    ],
    // The vault: a tall prop against the back wall (drawn behind the thief).
    // The diamond floats in front of its door. Press E near it — instant, no hold.
    vault: { x: 560, y: 480, w: 160, h: 180 },
    loot: [
      { x: 600, y: 365, kind: 'money', value: 200, taken: false },
      { x: 1060, y: 485, kind: 'gold', value: 300, taken: false },
    ],
    diamonds: [{ x: 640, y: 560, taken: false }],
    jammer: { x: 1140, y: 625, taken: false }, // far right ground, in guard 2's patrol
    laptop: { x: 200, y: 660, used: false },
    lasers: [
      { x1: 240, x2: 360, y: 600, cooldown: 0 },
      { x1: 920, x2: 1040, y: 600, cooldown: 0 },
    ],
    cameras: [
      { x: 1120, y: 180, baseAngle: 2.1, sweep: 0.5, phase: 0 },
      { x: 200, y: 180, baseAngle: 1.2, sweep: 0.5, phase: 2 },
    ],
    guards: [
      { x: 300, minX: 80, maxX: 420, floorY: 660, dir: 1, speed: 60, cone: 290, chase: 200 },
      { x: 900, minX: 880, maxX: 1200, floorY: 660, dir: -1, speed: 60, cone: 290, chase: 200 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'diamond' },
    alarmStart: 0,
    decor: [
      { sprite: 'computer', x: 600, y: 360, h: 40 },
      { sprite: 'blueprint', x: 950, y: 300, h: 90 },
      { sprite: 'cables', x: 450, y: 640, h: 40 },
      { sprite: 'chair', x: 150, y: 590, h: 70 },
      { sprite: 'mask-skull', x: 1240, y: 180, h: 60 },
      { sprite: 'crowbar', x: 850, y: 620, h: 50 },
      { sprite: 'wrench', x: 880, y: 620, h: 50 },
    ],
    crew: [],
  },
  {
    id: 3,
    name: 'GETAWAY',
    sub: 'You have the Star. Get to the shutter and get out. The alarm is already up.',
    bg: 'bg-dark',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 540, w: 340, h: 18 },
      { x: 460, y: 430, w: 360, h: 18 },
      { x: 880, y: 540, w: 340, h: 18 },
    ],
    ladders: [
      { x: 360, y: 540, w: 36, h: 120 },
      { x: 470, y: 430, w: 36, h: 230 },
      { x: 890, y: 540, w: 36, h: 120 },
    ],
    solids: [
      { x: 300, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 1000, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 760, y: 390, w: 60, h: 40, sprite: 'tires' },
    ],
    loot: [
      { x: 200, y: 505, kind: 'bag-blue', value: 400, taken: false },
      { x: 1040, y: 505, kind: 'money', value: 200, taken: false },
    ],
    diamonds: [], // already carried from level 2
    jammer: { x: 720, y: 625, taken: false }, // mid ground, just past the first laser
    laptop: null,
    lasers: [
      { x1: 580, x2: 700, y: 600, cooldown: 0 },
      { x1: 900, x2: 1020, y: 600, cooldown: 0 },
    ],
    cameras: [
      { x: 640, y: 180, baseAngle: 1.9, sweep: 0.55, phase: 1.5 },
    ],
    guards: [
      { x: 300, minX: 300, maxX: 700, floorY: 660, dir: 1, speed: 65, cone: 300, chase: 210 },
      { x: 480, minX: 480, maxX: 800, floorY: 430, dir: -1, speed: 65, cone: 300, chase: 210 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'none' },
    alarmStart: 40,
    decor: [
      { sprite: 'bg-wall-shutter', x: 1180, y: 400, h: 200 },
      { sprite: 'computer', x: 620, y: 390, h: 40 },
      { sprite: 'blueprint', x: 200, y: 300, h: 90 },
      { sprite: 'cables2', x: 950, y: 640, h: 40 },
      { sprite: 'chair', x: 150, y: 590, h: 70 },
      { sprite: 'power-drill', x: 850, y: 620, h: 40 },
      { sprite: 'extinguisher', x: 880, y: 620, h: 50 },
    ],
    crew: [
      { sprite: 'gas-run', x: 1120, y: 660 },
      { sprite: 'clown-stand', x: 1180, y: 660 },
    ],
  },
  {
    id: 4,
    name: 'SECOND FLOOR',
    sub: 'Two guards now, and a camera watches the gold. Take the high road.',
    bg: 'bg-top',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 540, w: 340, h: 18 },
      { x: 460, y: 440, w: 360, h: 18 },
      { x: 880, y: 540, w: 340, h: 18 },
    ],
    ladders: [
      { x: 360, y: 540, w: 36, h: 120 },
      { x: 470, y: 440, w: 36, h: 220 },
      { x: 890, y: 540, w: 36, h: 120 },
    ],
    solids: [
      { x: 280, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 1000, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 760, y: 400, w: 60, h: 40, sprite: 'tires' },
    ],
    loot: [
      { x: 220, y: 505, kind: 'money', value: 200, taken: false },
      { x: 620, y: 405, kind: 'bag-brown', value: 400, taken: false },
      { x: 1050, y: 505, kind: 'gold', value: 300, taken: false },
      { x: 200, y: 625, kind: 'money', value: 200, taken: false },
    ],
    diamonds: [{ x: 640, y: 400, taken: false }], // middle platform, under camera 640
    jammer: { x: 1140, y: 625, taken: false }, // far right ground, camera 1120 watches it
    laptop: null,
    lasers: [
      { x1: 560, x2: 680, y: 600, cooldown: 0 },
    ],
    cameras: [
      { x: 640, y: 180, baseAngle: 2.0, sweep: 0.5, phase: 0 },
      { x: 1120, y: 180, baseAngle: 2.2, sweep: 0.45, phase: 2 },
    ],
    guards: [
      { x: 500, minX: 480, maxX: 900, floorY: 660, dir: 1, speed: 70, cone: 300, chase: 215 },
      { x: 1000, minX: 920, maxX: 1180, floorY: 540, dir: -1, speed: 70, cone: 300, chase: 215 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'loot' },
    alarmStart: 0,
    decor: [
      { sprite: 'blueprint', x: 700, y: 300, h: 90 },
      { sprite: 'cables', x: 150, y: 640, h: 40 },
      { sprite: 'chair', x: 1150, y: 590, h: 70 },
      { sprite: 'computer', x: 800, y: 400, h: 40 },
      { sprite: 'mask-clown', x: 60, y: 180, h: 60 },
    ],
    crew: [],
  },
  {
    id: 5,
    name: 'THE GALLERY',
    sub: 'Four platforms, three guards, and a laptop that can kill the lasers.',
    bg: 'bg-mid',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 560, w: 280, h: 18 },
      { x: 400, y: 460, w: 300, h: 18 },
      { x: 760, y: 360, w: 280, h: 18 },
      { x: 1000, y: 540, w: 220, h: 18 },
    ],
    ladders: [
      { x: 300, y: 560, w: 36, h: 100 },
      { x: 410, y: 460, w: 36, h: 200 },
      { x: 770, y: 360, w: 36, h: 300 },
      { x: 1010, y: 540, w: 36, h: 120 },
    ],
    solids: [
      { x: 200, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 600, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 900, y: 500, w: 60, h: 40, sprite: 'tires' },
      { x: 1100, y: 600, w: 60, h: 60, sprite: 'crate' },
    ],
    loot: [
      { x: 180, y: 525, kind: 'money', value: 200, taken: false },
      { x: 540, y: 425, kind: 'gold', value: 300, taken: false },
      { x: 880, y: 325, kind: 'bag-blue', value: 400, taken: false },
      { x: 1100, y: 505, kind: 'money', value: 200, taken: false },
    ],
    diamonds: [{ x: 1000, y: 300, taken: false }], // top platform, far right end, camera 960
    jammer: { x: 200, y: 625, taken: false }, // far left ground, in guard 1's patrol
    laptop: { x: 700, y: 660, used: false },
    lasers: [
      { x1: 300, x2: 420, y: 600, cooldown: 0 },
      { x1: 850, x2: 970, y: 600, cooldown: 0 },
    ],
    cameras: [
      { x: 320, y: 170, baseAngle: 1.8, sweep: 0.5, phase: 0 },
      { x: 960, y: 170, baseAngle: 2.3, sweep: 0.45, phase: 1 },
    ],
    guards: [
      { x: 350, minX: 100, maxX: 600, floorY: 660, dir: 1, speed: 75, cone: 310, chase: 225 },
      { x: 900, minX: 700, maxX: 1200, floorY: 660, dir: -1, speed: 75, cone: 310, chase: 225 },
      { x: 500, minX: 420, maxX: 680, floorY: 460, dir: 1, speed: 75, cone: 310, chase: 225 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'loot' },
    alarmStart: 0,
    decor: [
      { sprite: 'computer', x: 600, y: 420, h: 40 },
      { sprite: 'blueprint', x: 950, y: 300, h: 90 },
      { sprite: 'cables', x: 450, y: 640, h: 40 },
      { sprite: 'chair', x: 150, y: 590, h: 70 },
      { sprite: 'mask-skull', x: 1240, y: 180, h: 60 },
      { sprite: 'crowbar', x: 850, y: 620, h: 50 },
      { sprite: 'wrench', x: 880, y: 620, h: 50 },
    ],
    crew: [],
  },
  {
    id: 6,
    name: 'THE ARCHIVE',
    sub: 'Three cameras sweep the hall. The gold sits in the open — take it fast.',
    bg: 'bg-mid',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 520, w: 320, h: 18 },
      { x: 440, y: 420, w: 340, h: 18 },
      { x: 900, y: 520, w: 320, h: 18 },
    ],
    ladders: [
      { x: 340, y: 520, w: 36, h: 140 },
      { x: 470, y: 420, w: 36, h: 240 },
      { x: 910, y: 520, w: 36, h: 140 },
    ],
    solids: [
      { x: 280, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 1000, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 720, y: 380, w: 60, h: 40, sprite: 'tires' },
      { x: 1100, y: 600, w: 60, h: 60, sprite: 'crate' },
    ],
    loot: [
      { x: 200, y: 485, kind: 'money', value: 200, taken: false },
      { x: 620, y: 385, kind: 'bag-brown', value: 400, taken: false },
      { x: 1040, y: 485, kind: 'gold', value: 300, taken: false },
      { x: 200, y: 625, kind: 'money', value: 200, taken: false },
      { x: 700, y: 625, kind: 'bag-blue', value: 400, taken: false },
    ],
    diamonds: [{ x: 620, y: 360, taken: false }], // middle platform, guard 3 patrols it
    jammer: { x: 1150, y: 625, taken: false }, // far right ground, guard 2's patrol
    laptop: null,
    lasers: [
      { x1: 420, x2: 540, y: 600, cooldown: 0 },
      { x1: 760, x2: 880, y: 600, cooldown: 0 },
    ],
    cameras: [
      { x: 200, y: 170, baseAngle: 1.9, sweep: 0.5, phase: 0 },
      { x: 640, y: 170, baseAngle: 2.1, sweep: 0.5, phase: 1.5 },
      { x: 1100, y: 170, baseAngle: 2.2, sweep: 0.45, phase: 3 },
    ],
    guards: [
      { x: 400, minX: 80, maxX: 700, floorY: 660, dir: 1, speed: 80, cone: 320, chase: 235 },
      { x: 1000, minX: 800, maxX: 1200, floorY: 660, dir: -1, speed: 80, cone: 320, chase: 235 },
      { x: 600, minX: 480, maxX: 740, floorY: 420, dir: 1, speed: 80, cone: 320, chase: 235 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'loot' },
    alarmStart: 0,
    decor: [
      { sprite: 'blueprint', x: 700, y: 300, h: 90 },
      { sprite: 'cables', x: 150, y: 640, h: 40 },
      { sprite: 'chair', x: 1150, y: 590, h: 70 },
      { sprite: 'computer', x: 800, y: 380, h: 40 },
      { sprite: 'mask-skull', x: 60, y: 180, h: 60 },
      { sprite: 'power-drill', x: 850, y: 620, h: 40 },
      { sprite: 'extinguisher', x: 880, y: 620, h: 50 },
    ],
    crew: [],
  },
  {
    id: 7,
    name: 'THE STRONGROOM',
    sub: 'A laser slides across the high platform. Hack the laptop, then move.',
    bg: 'bg-mid',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 560, w: 280, h: 18 },
      { x: 400, y: 460, w: 280, h: 18 },
      { x: 720, y: 360, w: 280, h: 18 },
      { x: 1040, y: 520, w: 180, h: 18 },
    ],
    ladders: [
      { x: 300, y: 560, w: 36, h: 100 },
      { x: 410, y: 460, w: 36, h: 200 },
      { x: 730, y: 360, w: 36, h: 300 },
      { x: 1050, y: 520, w: 36, h: 140 },
    ],
    solids: [
      { x: 200, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 600, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 900, y: 320, w: 60, h: 40, sprite: 'tires' },
      { x: 1150, y: 600, w: 60, h: 60, sprite: 'crate' },
    ],
    loot: [
      { x: 180, y: 525, kind: 'money', value: 200, taken: false },
      { x: 520, y: 425, kind: 'gold', value: 300, taken: false },
      { x: 840, y: 325, kind: 'bag-brown', value: 400, taken: false },
      { x: 1120, y: 485, kind: 'money', value: 200, taken: false },
      { x: 200, y: 625, kind: 'bag-blue', value: 400, taken: false },
    ],
    diamonds: [{ x: 840, y: 300, taken: false }], // top platform, guard 4 patrols it
    jammer: { x: 200, y: 625, taken: false }, // far left ground, guard 1's patrol
    laptop: { x: 650, y: 660, used: false },
    lasers: [
      { x1: 280, x2: 400, y: 600, cooldown: 0 },
      { x1: 700, x2: 820, y: 600, cooldown: 0 },
      { x1: 950, x2: 1070, y: 500, cooldown: 0, slide: 50, slideSpeed: 0.7, slidePhase: 0 },
    ],
    cameras: [
      { x: 200, y: 170, baseAngle: 1.9, sweep: 0.5, phase: 0, speed: 1.1 },
      { x: 640, y: 170, baseAngle: 2.1, sweep: 0.5, phase: 1.5, speed: 1.1 },
      { x: 1100, y: 170, baseAngle: 2.2, sweep: 0.45, phase: 3, speed: 1.1 },
    ],
    guards: [
      { x: 300, minX: 80, maxX: 550, floorY: 660, dir: 1, speed: 85, cone: 320, chase: 245 },
      { x: 900, minX: 650, maxX: 1200, floorY: 660, dir: -1, speed: 85, cone: 320, chase: 245 },
      { x: 500, minX: 420, maxX: 660, floorY: 460, dir: 1, speed: 85, cone: 320, chase: 245 },
      { x: 820, minX: 740, maxX: 980, floorY: 360, dir: -1, speed: 85, cone: 320, chase: 245 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'loot' },
    alarmStart: 0,
    smoke: 1,
    decor: [
      { sprite: 'computer', x: 600, y: 420, h: 40 },
      { sprite: 'blueprint', x: 950, y: 300, h: 90 },
      { sprite: 'cables', x: 450, y: 640, h: 40 },
      { sprite: 'chair', x: 150, y: 590, h: 70 },
      { sprite: 'mask-skull', x: 1240, y: 180, h: 60 },
      { sprite: 'crowbar', x: 850, y: 620, h: 50 },
      { sprite: 'wrench', x: 880, y: 620, h: 50 },
      { sprite: 'safe', x: 120, y: 660, h: 60 },
    ],
    crew: [],
  },
  {
    id: 8,
    name: 'THE SERVER ROOM',
    sub: 'Four cameras, four guards, one smoke bomb. Plan every step.',
    bg: 'bg-dark',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 540, w: 300, h: 18 },
      { x: 420, y: 440, w: 300, h: 18 },
      { x: 780, y: 340, w: 300, h: 18 },
      { x: 1080, y: 540, w: 140, h: 18 },
    ],
    ladders: [
      { x: 320, y: 540, w: 36, h: 120 },
      { x: 430, y: 440, w: 36, h: 220 },
      { x: 790, y: 340, w: 36, h: 320 },
      { x: 1090, y: 540, w: 36, h: 120 },
    ],
    solids: [
      { x: 220, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 600, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 900, y: 300, w: 60, h: 40, sprite: 'tires' },
      { x: 1150, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 100, y: 600, w: 52, h: 60, sprite: 'drum' },
    ],
    loot: [
      { x: 180, y: 505, kind: 'money', value: 200, taken: false },
      { x: 540, y: 405, kind: 'gold', value: 300, taken: false },
      { x: 900, y: 305, kind: 'bag-brown', value: 400, taken: false },
      { x: 1140, y: 505, kind: 'money', value: 200, taken: false },
      { x: 200, y: 625, kind: 'bag-blue', value: 400, taken: false },
      { x: 700, y: 625, kind: 'gold', value: 300, taken: false },
    ],
    diamonds: [{ x: 900, y: 280, taken: false }], // top platform, guard 4 patrols it
    jammer: { x: 620, y: 625, taken: false }, // mid ground, in the gap between guard patrols
    laptop: null,
    lasers: [
      { x1: 300, x2: 420, y: 600, cooldown: 0 },
      { x1: 640, x2: 760, y: 600, cooldown: 0 },
      { x1: 980, x2: 1100, y: 600, cooldown: 0 },
    ],
    cameras: [
      { x: 160, y: 170, baseAngle: 1.9, sweep: 0.5, phase: 0, speed: 1.15 },
      { x: 480, y: 170, baseAngle: 2.0, sweep: 0.5, phase: 1, speed: 1.15 },
      { x: 800, y: 170, baseAngle: 2.1, sweep: 0.5, phase: 2, speed: 1.15 },
      { x: 1120, y: 170, baseAngle: 2.2, sweep: 0.45, phase: 3, speed: 1.15 },
    ],
    guards: [
      { x: 300, minX: 80, maxX: 600, floorY: 660, dir: 1, speed: 90, cone: 330, chase: 250 },
      { x: 900, minX: 650, maxX: 1200, floorY: 660, dir: -1, speed: 90, cone: 330, chase: 250 },
      { x: 520, minX: 440, maxX: 700, floorY: 440, dir: 1, speed: 90, cone: 330, chase: 250 },
      { x: 880, minX: 800, maxX: 1060, floorY: 340, dir: -1, speed: 90, cone: 330, chase: 250 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'loot' },
    alarmStart: 0,
    smoke: 1,
    decor: [
      { sprite: 'computer', x: 600, y: 400, h: 40 },
      { sprite: 'blueprint', x: 950, y: 300, h: 90 },
      { sprite: 'cables', x: 450, y: 640, h: 40 },
      { sprite: 'chair', x: 150, y: 590, h: 70 },
      { sprite: 'mask-skull', x: 1240, y: 180, h: 60 },
      { sprite: 'power-drill', x: 850, y: 620, h: 40 },
      { sprite: 'extinguisher', x: 880, y: 620, h: 50 },
      { sprite: 'safe', x: 120, y: 660, h: 60 },
    ],
    crew: [],
  },
  {
    id: 9,
    name: 'THE PENTHOUSE',
    sub: 'Five guards. One smoke bomb. Stun the one in your way, jam the cameras.',
    bg: 'bg-dark',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 560, w: 260, h: 18 },
      { x: 380, y: 460, w: 280, h: 18 },
      { x: 700, y: 360, w: 280, h: 18 },
      { x: 1020, y: 480, w: 200, h: 18 },
    ],
    ladders: [
      { x: 280, y: 560, w: 36, h: 100 },
      { x: 390, y: 460, w: 36, h: 200 },
      { x: 710, y: 360, w: 36, h: 300 },
      { x: 1030, y: 480, w: 36, h: 180 },
    ],
    solids: [
      { x: 180, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 560, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 840, y: 320, w: 60, h: 40, sprite: 'tires' },
      { x: 1150, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 80, y: 600, w: 52, h: 60, sprite: 'drum' },
    ],
    loot: [
      { x: 170, y: 525, kind: 'money', value: 200, taken: false },
      { x: 500, y: 425, kind: 'gold', value: 300, taken: false },
      { x: 820, y: 325, kind: 'bag-brown', value: 400, taken: false },
      { x: 1110, y: 445, kind: 'money', value: 200, taken: false },
      { x: 200, y: 625, kind: 'bag-blue', value: 400, taken: false },
      { x: 680, y: 625, kind: 'gold', value: 300, taken: false },
    ],
    diamonds: [{ x: 820, y: 300, taken: false }], // top platform, guard 5 patrols it
    jammer: { x: 200, y: 625, taken: false }, // far left ground, guard 1's patrol
    laptop: { x: 640, y: 660, used: false },
    lasers: [
      { x1: 280, x2: 400, y: 600, cooldown: 0 },
      { x1: 600, x2: 720, y: 600, cooldown: 0 },
      { x1: 900, x2: 1020, y: 600, cooldown: 0 },
      { x1: 100, x2: 220, y: 500, cooldown: 0, slide: 40, slideSpeed: 0.9, slidePhase: 1 },
    ],
    cameras: [
      { x: 200, y: 170, baseAngle: 1.9, sweep: 0.5, phase: 0, speed: 1.2 },
      { x: 520, y: 170, baseAngle: 2.0, sweep: 0.5, phase: 1, speed: 1.2 },
      { x: 840, y: 170, baseAngle: 2.1, sweep: 0.5, phase: 2, speed: 1.2 },
      { x: 1140, y: 170, baseAngle: 2.2, sweep: 0.45, phase: 3, speed: 1.2 },
    ],
    guards: [
      { x: 250, minX: 80, maxX: 500, floorY: 660, dir: 1, speed: 95, cone: 340, chase: 255 },
      { x: 700, minX: 550, maxX: 950, floorY: 660, dir: -1, speed: 95, cone: 340, chase: 255 },
      { x: 1100, minX: 1000, maxX: 1250, floorY: 660, dir: 1, speed: 95, cone: 340, chase: 255 },
      { x: 480, minX: 400, maxX: 640, floorY: 460, dir: 1, speed: 95, cone: 340, chase: 255 },
      { x: 800, minX: 720, maxX: 960, floorY: 360, dir: -1, speed: 95, cone: 340, chase: 255 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'loot' },
    alarmStart: 0,
    smoke: 1,
    decor: [
      { sprite: 'computer', x: 600, y: 420, h: 40 },
      { sprite: 'blueprint', x: 950, y: 300, h: 90 },
      { sprite: 'cables', x: 450, y: 640, h: 40 },
      { sprite: 'chair', x: 150, y: 590, h: 70 },
      { sprite: 'mask-skull', x: 1240, y: 180, h: 60 },
      { sprite: 'crowbar', x: 850, y: 620, h: 50 },
      { sprite: 'wrench', x: 880, y: 620, h: 50 },
      { sprite: 'safe', x: 120, y: 660, h: 60 },
    ],
    crew: [],
  },
  {
    id: 10,
    name: 'THE GRAND VAULT',
    sub: 'The biggest Star of all. Five guards, five cameras — and the alarm is already up.',
    bg: 'bg-dark',
    spawn: { x: 90, y: 596 },
    ground: { x: 0, y: 660, w: 1280, h: 60 },
    platforms: [
      { x: 60, y: 540, w: 300, h: 18 },
      { x: 420, y: 440, w: 320, h: 18 },
      { x: 800, y: 340, w: 300, h: 18 },
      { x: 1120, y: 540, w: 120, h: 18 },
    ],
    ladders: [
      { x: 320, y: 540, w: 36, h: 120 },
      { x: 430, y: 440, w: 36, h: 220 },
      { x: 830, y: 340, w: 36, h: 320 },
      { x: 1130, y: 540, w: 36, h: 120 },
    ],
    solids: [
      { x: 280, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 1000, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 760, y: 400, w: 60, h: 40, sprite: 'tires' },
      { x: 1150, y: 600, w: 60, h: 60, sprite: 'crate' },
      { x: 100, y: 600, w: 52, h: 60, sprite: 'drum' },
      { x: 940, y: 300, w: 60, h: 40, sprite: 'tires' },
    ],
    vault: { x: 560, y: 480, w: 160, h: 180 },
    loot: [
      { x: 200, y: 505, kind: 'money', value: 200, taken: false },
      { x: 560, y: 405, kind: 'gold', value: 300, taken: false },
      { x: 940, y: 305, kind: 'bag-brown', value: 400, taken: false },
      { x: 1170, y: 505, kind: 'money', value: 200, taken: false },
      { x: 200, y: 625, kind: 'bag-blue', value: 400, taken: false },
      { x: 700, y: 625, kind: 'gold', value: 300, taken: false },
    ],
    diamonds: [
      { x: 640, y: 560, taken: false }, // in front of the vault door
      { x: 940, y: 280, taken: false }, // top platform, guard 5 patrols it
    ],
    jammer: { x: 1140, y: 625, taken: false }, // far right ground, guard 3's patrol
    laptop: { x: 200, y: 660, used: false },
    lasers: [
      { x1: 300, x2: 420, y: 600, cooldown: 0 },
      { x1: 620, x2: 740, y: 600, cooldown: 0 },
      { x1: 940, x2: 1060, y: 600, cooldown: 0 },
      { x1: 100, x2: 220, y: 480, cooldown: 0, slide: 50, slideSpeed: 0.8, slidePhase: 0 },
    ],
    cameras: [
      { x: 160, y: 170, baseAngle: 1.9, sweep: 0.5, phase: 0, speed: 1.25 },
      { x: 440, y: 170, baseAngle: 2.0, sweep: 0.5, phase: 0.8, speed: 1.25 },
      { x: 720, y: 170, baseAngle: 2.1, sweep: 0.5, phase: 1.6, speed: 1.25 },
      { x: 1000, y: 170, baseAngle: 2.2, sweep: 0.45, phase: 2.4, speed: 1.25 },
      { x: 1200, y: 170, baseAngle: 2.3, sweep: 0.4, phase: 3.2, speed: 1.25 },
    ],
    guards: [
      { x: 300, minX: 80, maxX: 550, floorY: 660, dir: 1, speed: 100, cone: 350, chase: 260 },
      { x: 750, minX: 600, maxX: 1000, floorY: 660, dir: -1, speed: 100, cone: 350, chase: 260 },
      { x: 1100, minX: 1050, maxX: 1250, floorY: 660, dir: 1, speed: 100, cone: 350, chase: 260 },
      { x: 540, minX: 440, maxX: 720, floorY: 440, dir: 1, speed: 100, cone: 350, chase: 260 },
      { x: 940, minX: 820, maxX: 1080, floorY: 340, dir: -1, speed: 100, cone: 350, chase: 260 },
    ],
    exit: { x: 1215, y: 556, w: 55, h: 104, needs: 'diamond' },
    alarmStart: 20,
    smoke: 1,
    decor: [
      { sprite: 'computer', x: 600, y: 400, h: 40 },
      { sprite: 'blueprint', x: 950, y: 300, h: 90 },
      { sprite: 'cables', x: 450, y: 640, h: 40 },
      { sprite: 'chair', x: 150, y: 590, h: 70 },
      { sprite: 'mask-skull', x: 1240, y: 180, h: 60 },
      { sprite: 'crowbar', x: 850, y: 620, h: 50 },
      { sprite: 'wrench', x: 880, y: 620, h: 50 },
      { sprite: 'safe', x: 120, y: 660, h: 60 },
      { sprite: 'step-ladder', x: 1100, y: 660, h: 80 },
    ],
    crew: [
      { sprite: 'gas-run', x: 1120, y: 660 },
      { sprite: 'clown-stand', x: 1180, y: 660 },
    ],
  },
];

// Deep-clone a level so a retry starts from a pristine copy.
export function freshLevel(index) {
  return JSON.parse(JSON.stringify(LEVELS[index]));
}
