// main.js — game loop + state machine for The Star of Merdeka.
// States: loading -> title -> intro -> playing -> caught / levelComplete -> win.
// ?shot=... stages a fixed frame for screenshots (no update, one render).

import { CANVAS_W, CANVAS_H, SCORE, SMOKE_COUNT, SMOKE_DURATION, STUN_COUNT, STUN_RADIUS, JAMMER_DURATION, COIN_COOLDOWN, LASER_HACK_DURATION } from './config.js';
import { loadSprites } from './sprites.js';
import { createInput, } from './input.js';
import { unlockAudio, sfx } from './audio.js';
import { LEVELS, freshLevel } from './levels.js';
import { createThief, updateThief, tryInteract, nearestDiamond, interactPrompt, thiefInSmoke } from './thief.js';
import { createGuard, updateGuard, stunGuard, guardStunned } from './guards.js';
import { createCamera, updateCamera, disableAllCameras } from './cameras.js';
import { createLaser, updateLasers } from './lasers.js';
import { createAlarm, updateAlarm } from './alarm.js';
import { render, renderTitle, renderIntro, renderCaught, renderLevelComplete, renderWin } from './render.js';
import { shotFromUrl, stageShot } from './shots.js';
import { overlap } from './physics.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);

let images = null;
let g = null; // game state
let now = 0;
let lastTs = 0;

// Exposed for headless testing (loot/score/alarm assertions).
window.__game = null;

// Minimal test hook (does not affect gameplay): jump to a level and play it.
// Used by the automated play-test to verify every level's grab/exit/alarm.
window.__test = {
  startLevel(i) {
    startLevel(i, false);
    if (g) g.mode = 'playing';
  },
  teleport(x, y) {
    if (g) { g.thief.x = x; g.thief.y = y; g.thief.vx = 0; g.thief.vy = 0; }
  },
};

function startLevel(index, keepScore) {
  const level = freshLevel(index);
  const scoreAtStart = keepScore ? g.score : 0;
  // LOOT COUNTING (v4 fix): lootGot / hasDiamond are PER-LEVEL — they are
  // ALWAYS reset here. The v3 bug carried lootGot across levels (cumulative
  // numerator) while lootTotal was per-level, so the HUD showed 8/3 — and a
  // retry after being caught re-collected the same loot twice. Only the
  // score, the ghost flag and the elapsed time carry over; runLootGot /
  // runLootTotal count COMPLETED levels only (added at the exit, never on
  // retry), so the win screen's total can never double-count either.
  g = {
    mode: 'intro',
    levelIndex: index,
    level,
    thief: createThief(level.spawn),
    guards: level.guards.map(createGuard),
    cameras: level.cameras.map(createCamera),
    lasers: level.lasers.map(createLaser),
    alarm: createAlarm(level.alarmStart),
    score: scoreAtStart,
    lootGot: 0,
    lootTotal: level.loot.length + level.diamonds.length,
    hasDiamond: false,
    diamondsGot: 0,
    runLootGot: keepScore ? g.runLootGot : 0,
    runLootTotal: keepScore ? g.runLootTotal : 0,
    ghost: keepScore ? g.ghost : true,
    elapsed: keepScore ? g.elapsed : 0,
    levelTime: 0,
    // Per-level tool counts (harder levels give less): fall back to globals.
    smokeLeft: level.smoke ?? SMOKE_COUNT,
    stunLeft: level.stun ?? STUN_COUNT,
    // NO free EMP anymore: jammerLeft starts at 0 every level. Jammers are
    // picked up in the level (walk over one) and spent with F.
    jammerLeft: 0,
    coinCooldown: 0,
    coinTimer: 0,
    lasersOffUntil: 0,
    camerasOffUntil: 0,
    popups: [],
    coins: [],
    smokes: [],
    prompt: '',
    exitOpen: level.exit.needs === 'none',
    images,
  };
  window.__game = g;
}

function fullReset() {
  g = null;
  startLevel(0, false);
  g.mode = 'title';
  window.__game = g;
}

function popup(text, x, y) {
  g.popups.push({ text, x, y, life: 1.2 });
}

// Where does a thrown coin land? Highest platform top (or ground) below (x, y).
function coinLanding(x, y) {
  let landY = g.level.ground.y;
  for (const p of g.level.platforms) {
    if (x >= p.x && x <= p.x + p.w && p.y >= y && p.y < landY) landY = p.y;
  }
  return landY;
}

function handleEvents(events) {
  for (const e of events) {
    if (e.type === 'jump') sfx.jump();
    else if (e.type === 'loot') {
      g.lootGot += 1;
      g.score += e.value;
      popup(`+${e.value}`, e.x, e.y - 30);
      sfx.loot();
    } else if (e.type === 'jammer') {
      g.jammerLeft += 1;
      popup('+1 📻 JAMMER', e.x, e.y - 30);
      sfx.jammer();
    } else if (e.type === 'suspicious') sfx.suspicious();
    else if (e.type === 'alert') sfx.alert();
    else if (e.type === 'laser') {
      sfx.laser();
      popup('LASER!', g.thief.x + g.thief.w / 2, g.thief.y - 20);
    }
  }
}

function update(dt) {
  now += dt;
  g.now = now; // test hook: expose the game clock (headless tests poll this)
  const t = g.thief;
  const smoked = thiefInSmoke(t, now);

  // --- E: grab diamond / hack laptop (instant, one press) ---
  if (input.actionPressed()) {
    const what = tryInteract(t, g.level);
    if (what === 'diamond') {
      const d = nearestDiamond(t, g.level);
      d.taken = true;
      g.hasDiamond = true;
      g.diamondsGot += 1;
      g.lootGot += 1;
      g.score += SCORE.diamond;
      popup('+1000 ◆ STAR!', d.x, d.y - 40);
      sfx.diamond();
    } else if (what === 'laptop') {
      g.level.laptop.used = true;
      g.lasersOffUntil = now + LASER_HACK_DURATION;
      t.hacking = true;
      t.hackTimer = 1;
      popup('LASER OFF 8s', g.level.laptop.x, g.level.laptop.y - 40);
      sfx.hack();
    }
  }

  // --- Q: smoke bomb ---
  if (input.smokePressed() && g.smokeLeft > 0 && !smoked) {
    g.smokeLeft -= 1;
    t.smokeUntil = now + SMOKE_DURATION;
    g.smokes.push({ x: t.x + t.w / 2, y: t.y + t.h / 2, until: now + SMOKE_DURATION });
    sfx.smoke();
  }

  // --- X: stun the nearest guard (one guard per press, 4s frozen) ---
  if (input.stunPressed() && g.stunLeft > 0) {
    const tcx = t.x + t.w / 2, tcy = t.y + t.h / 2;
    let best = null, bestD = STUN_RADIUS;
    for (const gu of g.guards) {
      const d = Math.hypot(gu.x + gu.w / 2 - tcx, gu.y + gu.h / 2 - tcy);
      if (d < bestD) { best = gu; bestD = d; }
    }
    if (best && stunGuard(best, now)) {
      g.stunLeft -= 1;
      popup('STUN! 💫', best.x + best.w / 2, best.y - 20);
      sfx.stun();
    }
  }

  // --- F: spend a picked-up jammer (cameras off 6s). No free EMP: F only
  // works if you walked over a jammer in this level and carry one. ---
  if (input.jammerPressed() && g.jammerLeft > 0) {
    g.jammerLeft -= 1;
    g.camerasOffUntil = now + JAMMER_DURATION;
    popup('JAMMER! Kamera mati 6s', t.x + t.w / 2, t.y - 20);
    sfx.jammer();
  }

  // --- Click: toss a coin (distraction) ---
  g.coinCooldown = Math.max(0, g.coinCooldown - dt);
  if (input.mouse.clicked && g.coinCooldown <= 0) {
    const c = input.mouse.clicked;
    const landY = coinLanding(c.x, c.y);
    g.coins.push({ x: c.x, y: Math.min(c.y, landY - 6), life: 2, tx: c.x });
    g.coinCooldown = COIN_COOLDOWN;
    sfx.coin();
    // Nearest guard within 450px investigates the sound.
    let best = null, bestD = 450;
    for (const gu of g.guards) {
      const d = Math.abs((gu.x + gu.w / 2) - c.x);
      if (d < bestD) { best = gu; bestD = d; }
    }
    if (best) {
      best.state = 'investigate';
      best.lastSeenX = c.x;
      best.suspicion = Math.max(best.suspicion, 40);
    }
  }

  // --- thief ---
  const solids = g.level.solids;
  const oneWay = [g.level.ground, ...g.level.platforms];
  const thiefEvents = [];
  updateThief(t, dt, now, input, g.level, solids, oneWay, (e) => thiefEvents.push(e));
  handleEvents(thiefEvents);

  // --- exit opens when its condition is met ---
  // Per-level counters (v4 fix): lootGot is this level only, and the
  // diamond exit needs EVERY diamond of THIS level taken — the old code
  // read a carried-over hasDiamond, so level 10's exit opened at spawn.
  if (g.level.exit.needs === 'loot' && g.lootGot >= g.lootTotal) g.exitOpen = true;
  if (g.level.exit.needs === 'diamond' && g.level.diamonds.length > 0
    && g.level.diamonds.every((d) => d.taken)) g.exitOpen = true;

  // --- prompt ---
  g.prompt = interactPrompt(t, g.level);

  // --- guards ---
  // (Separate event array from the thief's: handleEvents must run once per
  // event, or loot would be counted twice.)
  // The alarm flag (from last frame) is passed in: when it is up, EVERY
  // guard is ordered to chase. That is the v2 alarm fix.
  let alertGuards = 0;
  let caught = false;
  const guardEvents = [];
  for (const gu of g.guards) {
    const res = updateGuard(gu, dt, t, solids, smoked, guardEvents, g.alarm.alarmed, now);
    if (gu.state === 'chase') alertGuards += 1;
    if (res === 'caught') caught = true;
  }
  handleEvents(guardEvents);
  if (alertGuards > 0 || g.alarm.everTripped) g.ghost = false;

  // --- cameras ---
  let cameraSeeing = false;
  for (const cam of g.cameras) {
    const res = updateCamera(cam, dt, now, t, solids, g.alarm.alarmed, g.camerasOffUntil);
    if (res.seen) cameraSeeing = true;
  }
  if (cameraSeeing) {
    // A camera that sees the thief feeds the position to every guard: the
    // whole security net hunts the same spot. Break camera line of sight
    // (cover, jammer, smoke) and the guards fall back to the last spot they
    // themselves saw. (v3: keeps cameras meaningful during a hunt.)
    for (const gu of g.guards) {
      gu.lastSeenX = t.x + t.w / 2;
    }
  }

  // --- lasers ---
  const laserEvents = [];
  updateLasers(g.lasers, dt, t, g.lasersOffUntil, now, laserEvents);
  const laserHits = laserEvents.map((e) => e.amount);
  handleEvents(laserEvents);

  // --- alarm ---
  const alarmEvent = updateAlarm(g.alarm, dt, alertGuards, cameraSeeing, laserHits);
  if (alarmEvent === 'tripped') {
    sfx.alarm();
    g.ghost = false;
  }
  if (alarmEvent === 'cleared') {
    // The hunt is over: every guard that was alarm-chasing stands down
    // to investigate the last seen spot RIGHT NOW. (v3 fix: leaving them
    // in chase let their alert state feed the meter straight back up, so
    // the alarm re-tripped within half a second of clearing.)
    for (const gu of g.guards) {
      if (gu.alarmChase) {
        gu.alarmChase = false;
        gu.state = 'investigate';
        gu.suspicion = 60;
        gu.loseTimer = 0;
      }
    }
    popup('Alarm reda…', t.x, t.y - 20);
  }

  // --- coins / smokes / popups decay ---
  for (const c of g.coins) c.life -= dt;
  g.coins = g.coins.filter((c) => c.life > 0);
  g.smokes = g.smokes.filter((s) => now < s.until);
  for (const p of g.popups) { p.life -= dt; p.y -= 24 * dt; }
  g.popups = g.popups.filter((p) => p.life > 0);

  // --- caught? ---
  if (caught) {
    g.mode = 'caught';
    sfx.caught();
    return;
  }

  // --- reached the exit? ---
  if (g.exitOpen && overlap(t, g.level.exit)) {
    // Bank this level's loot into the run total exactly once (the mode
    // changes below, so this branch cannot run twice for one level).
    g.runLootGot += g.lootGot;
    g.runLootTotal += g.lootTotal;
    const timeBonus = Math.max(0, Math.round(120 - g.levelTime)) * 5;
    g.score += SCORE.levelBonus + timeBonus;
    if (g.levelIndex >= LEVELS.length - 1) {
      if (g.ghost) g.score += SCORE.ghostBonus;
      g.mode = 'win';
      sfx.win();
    } else {
      g.mode = 'levelComplete';
      sfx.win();
    }
    return;
  }

  g.elapsed += dt;
  g.levelTime += dt;
}

function frame(ts) {
  const dt = Math.min(1 / 30, (ts - lastTs) / 1000 || 0.016);
  lastTs = ts;

  if (g.mode === 'shot') {
    // Frozen staged frame (screenshots).
    render(ctx, g, 1.0);
    input.endFrame();
    requestAnimationFrame(frame);
    return;
  }

  if (g.mode === 'title') {
    renderTitle(ctx, images);
    if (input.anyPressed()) {
      unlockAudio();
      startLevel(0, false);
    }
  } else if (g.mode === 'intro') {
    render(ctx, g, now);
    renderIntro(ctx, g.level, g.levelIndex);
    if (input.anyPressed()) {
      unlockAudio();
      g.mode = 'playing';
    }
  } else if (g.mode === 'playing') {
    update(dt);
    render(ctx, g, now);
  } else if (g.mode === 'caught') {
    render(ctx, g, now);
    renderCaught(ctx, `LEVEL ${g.levelIndex + 1} — ${g.level.name}`);
    // R = retry level, T = back to title (handled by the keydown listener).
  } else if (g.mode === 'levelComplete') {
    render(ctx, g, now);
    renderLevelComplete(ctx, g.score, g.lootGot, g.lootTotal);
    if (input.anyPressed()) {
      startLevel(g.levelIndex + 1, true);
    }
  } else if (g.mode === 'win') {
    render(ctx, g, now);
    renderWin(ctx, g.score, g.ghost, g.elapsed, g.runLootGot, g.runLootTotal);
  }

  // Caught-screen (R/T) and win-screen (R) keys are handled by the keydown
  // listener below; input.js edge presses are consumed in update().

  input.endFrame();
  requestAnimationFrame(frame);
}

// R / T on the caught screen (checked via a tiny key listener, since
// input.js only exposes edge presses through its own helpers).
window.addEventListener('keydown', (e) => {
  if (!g) return;
  if (g.mode === 'caught' && e.code === 'KeyR') {
    startLevel(g.levelIndex, true);
  }
  if (g.mode === 'caught' && e.code === 'KeyT') {
    fullReset();
  }
  if (g.mode === 'win' && e.code === 'KeyR') {
    fullReset();
  }
});

// Boot: load sprites, then stage a shot (if ?shot=) or show the title.
loadSprites()
  .then((loaded) => {
    images = loaded;
    const shot = shotFromUrl();
    if (shot) {
      g = stageShot(shot);
      g.images = images;
      window.__game = g;
      if (g.mode === 'title') {
        // renderTitle needs images; frame() handles it via g.mode
      }
      if (g.mode === 'win') {
        // renderWin needs g.score etc; frame() handles it
      }
    } else {
      fullReset();
    }
    requestAnimationFrame(frame);
  })
  .catch((err) => {
    ctx.fillStyle = '#141118';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#e5484d';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gagal memuat sprite: ' + err.message, CANVAS_W / 2, CANVAS_H / 2);
  });
