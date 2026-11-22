// shots.js — deterministic staged states for screenshots.
// ?shot=cover|alarm|loot|win|start|play|end — each stages the game into a
// fixed, readable frame, then the main loop renders it (paused).

import { freshLevel } from './levels.js';
import { createThief } from './thief.js';
import { createGuard } from './guards.js';
import { createCamera } from './cameras.js';
import { createLaser } from './lasers.js';
import { createAlarm } from './alarm.js';

export function shotFromUrl() {
  const q = new URLSearchParams(window.location.search);
  return q.get('shot') || null;
}

// Build a fully staged game state for the requested shot.
// Returns a state object in the same shape main.js uses.
export function stageShot(shot) {
  const base = {
    levelIndex: 1, // level 2 (The Vault) is the most photogenic
    score: 0, lootGot: 0, hasDiamond: false, diamondsGot: 0,
    runLootGot: 0, runLootTotal: 0, ghost: true,
    elapsed: 0, smokeLeft: 2, stunLeft: 2, jammerLeft: 0, coinCooldown: 0,
    lasersOffUntil: 0, camerasOffUntil: 0,
    popups: [], coins: [], smokes: [], prompt: '',
    exitOpen: false,
  };

  if (shot === 'start') {
    return { ...base, mode: 'title' };
  }
  if (shot === 'win' || shot === 'end') {
    // Level 3 staged at the exit, diamond carried, for the win backdrop.
    const l3 = freshLevel(2);
    const t3 = createThief(l3.spawn);
    t3.x = 1160; t3.y = 660 - 62; t3.dir = 1; t3.onGround = true;
    const g3 = l3.guards.map(createGuard);
    g3[0].x = 300; g3[0].dir = 1;
    g3[1].x = 900; g3[1].dir = -1;
    return {
      ...base, mode: 'win', level: l3, thief: t3, guards: g3,
      cameras: l3.cameras.map(createCamera), lasers: l3.lasers.map(createLaser),
      alarm: createAlarm(0), score: 2850, elapsed: 187, ghost: true,
      lootGot: 2, hasDiamond: true, exitOpen: true, levelIndex: 2,
      lootTotal: l3.loot.length, runLootGot: 8, runLootTotal: 8,
    };
  }

  // In-game shots use level 2 (The Vault).
  const level = freshLevel(1);
  const thief = createThief(level.spawn);
  const guards = level.guards.map(createGuard);
  const cameras = level.cameras.map(createCamera);
  const lasers = level.lasers.map(createLaser);
  const alarm = createAlarm(level.alarmStart);

  if (shot === 'cover') {
    // Mid-heist, everything visible in one frame: thief on platform B near
    // the vault, guards with cones, camera cone, lasers, diamond glowing.
    thief.x = 620; thief.y = 400 - 62; thief.dir = 1;
    thief.vx = 0; thief.vy = 0; thief.onGround = true;
    guards[0].x = 200; guards[0].dir = 1; guards[0].suspicion = 20;
    guards[1].x = 1000; guards[1].dir = -1; guards[1].suspicion = 0;
    alarm.value = 35;
    return {
      ...base, mode: 'shot', level, thief, guards, cameras, lasers, alarm,
      lootTotal: level.loot.length + level.diamonds.length,
    };
  }
  if (shot === 'alarm') {
    // PROOF OF THE v3 ALARM FIX: level 7, alarm fully tripped, and EVERY
    // guard is hunting the thief ("!" above every head, red ALARM banner).
    // Uses level 7 (4 guards on three floors) so the chase reads at a glance.
    const l7 = freshLevel(6);
    const t7 = createThief(l7.spawn);
    t7.x = 640; t7.y = 660 - 62; t7.dir = -1;
    t7.vx = 0; t7.vy = 0; t7.onGround = true;
    const g7 = l7.guards.map(createGuard);
    g7[0].x = 420; g7[0].dir = 1; g7[0].state = 'chase';
    g7[0].suspicion = 100; g7[0].everAlerted = true; g7[0].alarmChase = true;
    g7[1].x = 880; g7[1].dir = -1; g7[1].state = 'chase';
    g7[1].suspicion = 100; g7[1].everAlerted = true; g7[1].alarmChase = true;
    g7[2].x = 520; g7[2].dir = 1; g7[2].state = 'chase';
    g7[2].suspicion = 100; g7[2].everAlerted = true; g7[2].alarmChase = true;
    g7[3].x = 820; g7[3].dir = -1; g7[3].state = 'chase';
    g7[3].suspicion = 100; g7[3].everAlerted = true; g7[3].alarmChase = true;
    const a7 = createAlarm(0);
    a7.value = 100; a7.alarmed = true; a7.everTripped = true;
    return {
      ...base, mode: 'shot', level: l7, thief: t7, guards: g7,
      cameras: l7.cameras.map(createCamera), lasers: l7.lasers.map(createLaser),
      alarm: a7, levelIndex: 6,
      lootTotal: l7.loot.length + l7.diamonds.length,
    };
  }
  if (shot === 'loot') {
    // The thief just grabbed the diamond: it is gone, score popped, exit open.
    level.diamonds[0].taken = true;
    level.loot[0].taken = true;
    thief.x = 600; thief.y = 660 - 62; thief.dir = 1;
    thief.vx = 0; thief.vy = 0; thief.onGround = true;
    guards[0].x = 180; guards[0].dir = 1;
    guards[1].x = 1020; guards[1].dir = -1;
    alarm.value = 20;
    return {
      ...base, mode: 'shot', level, thief, guards, cameras, lasers, alarm,
      score: 1500, lootGot: 2, hasDiamond: true, diamondsGot: 1, exitOpen: true,
      lootTotal: level.loot.length + level.diamonds.length,
      popups: [{ x: 640, y: 480, text: '+1000 ◆ STAR!', life: 1.2 }],
    };
  }
  if (shot === 'play') {
    // Level 1, early play: thief on platform A, guard patrolling below.
    const l1 = freshLevel(0);
    const t1 = createThief(l1.spawn);
    t1.x = 220; t1.y = 540 - 62; t1.dir = 1; t1.onGround = true;
    const g1 = l1.guards.map(createGuard);
    g1[0].x = 600; g1[0].dir = -1;
    return {
      ...base, mode: 'shot', level: l1, thief: t1, guards: g1,
      cameras: [], lasers: [], alarm: createAlarm(0),
      lootTotal: l1.loot.length, levelIndex: 0,
    };
  }
  // Default: cover.
  thief.x = 620; thief.y = 400 - 62; thief.dir = 1;
  thief.onGround = true;
  return {
    ...base, mode: 'shot', level, thief, guards, cameras, lasers, alarm,
    lootTotal: level.loot.length + level.diamonds.length,
  };
}
