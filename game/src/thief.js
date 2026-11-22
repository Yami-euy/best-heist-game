// thief.js — the player. Run, sneak, jump, climb ladders, and GRAB.
// GRAB RULES (the v1 bug was a tiny radius + hold-to-grab):
//  - Small loot (money/gold/bags): WALK OVER it. Instant, no button, generous
//    overlap (LOOT_GRAB_PAD). Touch it and it is yours.
//  - Diamond / laptop: press E ONCE near it. Instant, no hold, big radius.
//    A clear prompt shows whenever you are in range.

import {
  THIEF_W, THIEF_H, THIEF_RUN_SPEED, THIEF_SNEAK_SPEED, THIEF_CLIMB_SPEED,
  GRAVITY, JUMP_VEL, COYOTE_TIME, JUMP_BUFFER,
  LOOT_GRAB_PAD, DIAMOND_GRAB_RADIUS, LAPTOP_GRAB_RADIUS, SCORE,
} from './config.js';
import { moveBody, overlap } from './physics.js';

export function createThief(spawn) {
  return {
    x: spawn.x, y: spawn.y, w: THIEF_W, h: THIEF_H,
    vx: 0, vy: 0,
    dir: 1, // facing: 1 right, -1 left
    onGround: false,
    onLadder: false,
    climbing: false,
    sneaking: false,
    coyote: 0,
    jumpBuffer: 0,
    smokeUntil: 0,
    runPhase: 0,
    moving: false,
    hacking: false, // playing the laptop pose
    hackTimer: 0,
  };
}

function center(t) {
  return { x: t.x + t.w / 2, y: t.y + t.h / 2 };
}

export function thiefInSmoke(t, now) {
  return now < t.smokeUntil;
}

// Is the thief overlapping a ladder? (for climb + for "press up to climb")
export function ladderAt(t, ladders) {
  const c = center(t);
  for (const l of ladders) {
    // 4px vertical slack so you can grab the ladder while standing on the
    // platform at its top (feet exactly at the ladder's top edge).
    if (c.x > l.x - 4 && c.x < l.x + l.w + 4 && t.y + t.h >= l.y - 4 && t.y <= l.y + l.h + 4) {
      return l;
    }
  }
  return null;
}

export function updateThief(t, dt, now, input, level, solids, oneWay, onEvent) {
  const ladder = ladderAt(t, level.ladders);
  t.onLadder = !!ladder;

  // --- horizontal movement ---
  let move = 0;
  if (input.left()) move -= 1;
  if (input.right()) move += 1;
  t.sneaking = input.sneak();
  const speed = t.sneaking ? THIEF_SNEAK_SPEED : THIEF_RUN_SPEED;
  t.vx = move * speed;
  if (move !== 0) {
    t.dir = move;
    t.moving = true;
    t.runPhase += dt * (t.sneaking ? 6 : 11);
  } else {
    t.moving = false;
  }

  // --- climbing ---
  t.climbing = false;
  if (ladder && (input.up() || input.down())) {
    t.climbing = true;
    t.vy = 0;
    if (input.up()) t.y -= THIEF_CLIMB_SPEED * dt;
    if (input.down()) t.y += THIEF_CLIMB_SPEED * dt;
    // Stay glued to the ladder shaft.
    t.x += ((ladder.x + ladder.w / 2 - t.w / 2) - t.x) * Math.min(1, dt * 12);
    // Clamp to the ladder's vertical span. Top clamp puts the feet exactly
    // on the platform the ladder leads to (so you land on it, not through it).
    if (t.y + t.h > ladder.y + ladder.h) t.y = ladder.y + ladder.h - t.h;
    if (t.y < ladder.y - t.h) t.y = ladder.y - t.h;
  }

  // --- jumping (coyote time + jump buffer, forgiving controls) ---
  if (t.onGround) t.coyote = COYOTE_TIME;
  else t.coyote = Math.max(0, t.coyote - dt);
  // Space / ArrowUp always jump. W jumps only when NOT on a ladder
  // (on a ladder, W climbs up — otherwise W would jump you off the ladder).
  if (input.jumpPressed() || (input.wPressed() && !ladder)) t.jumpBuffer = JUMP_BUFFER;
  else t.jumpBuffer = Math.max(0, t.jumpBuffer - dt);

  // Jumping off a ladder is allowed (leaves the climb).
  if (t.climbing && t.jumpBuffer > 0) {
    t.climbing = false;
    t.vy = JUMP_VEL;
    t.jumpBuffer = 0;
    onEvent({ type: 'jump' });
  }

  if (!t.climbing) {
    if (t.jumpBuffer > 0 && t.coyote > 0) {
      t.vy = JUMP_VEL;
      t.coyote = 0;
      t.jumpBuffer = 0;
      onEvent({ type: 'jump' });
    }
    t.vy += GRAVITY * dt;
    if (t.vy > 1200) t.vy = 1200;
  }

  // --- integrate + collide ---
  const res = moveBody(t, t.vx * dt, t.climbing ? 0 : t.vy * dt, solids, oneWay);
  if (res.landed) {
    t.onGround = true;
    t.vy = 0;
  } else if (!t.climbing) {
    t.onGround = false;
  }
  if (res.hitY && t.vy < 0) t.vy = 0;

  // Safety net: if the thief ever falls out of the world (should not happen
  // now that one-way landing is a "crossed the top" test), put them back
  // at the level spawn instead of falling forever.
  if (t.y > 760) {
    t.x = level.spawn.x;
    t.y = level.spawn.y;
    t.vx = 0; t.vy = 0;
  }

  // Keep inside the play area.
  if (t.x < 8) t.x = 8;
  if (t.x + t.w > 1272) t.x = 1272 - t.w;
  if (t.y < 56) { t.y = 56; t.vy = Math.max(0, t.vy); }

  // --- hacking pose timer ---
  if (t.hackTimer > 0) {
    t.hackTimer -= dt;
    t.hacking = t.hackTimer > 0;
  }

  // --- WALK-OVER GRAB: small loot is collected the instant you touch it ---
  for (const loot of level.loot) {
    if (loot.taken) continue;
    const pad = LOOT_GRAB_PAD;
    const box = { x: loot.x - pad, y: loot.y - pad, w: pad * 2 + 44, h: pad * 2 + 44 };
    if (overlap(t, box)) {
      loot.taken = true;
      onEvent({ type: 'loot', kind: loot.kind, value: loot.value, x: loot.x, y: loot.y });
    }
  }

  // --- WALK-OVER PICKUP: the jammer (signal jammer) is pocketed the same way ---
  if (level.jammer && !level.jammer.taken) {
    const pad = LOOT_GRAB_PAD;
    const j = level.jammer;
    const box = { x: j.x - pad, y: j.y - pad, w: pad * 2 + 44, h: pad * 2 + 44 };
    if (overlap(t, box)) {
      j.taken = true;
      onEvent({ type: 'jammer', x: j.x, y: j.y });
    }
  }
}

// --- E-press interactions (instant, no hold) ---
// Returns 'diamond' | 'laptop' | null. The caller applies the effect
// (nearest untaken diamond, via nearestDiamond()).
export function nearestDiamond(t, level) {
  const c = center(t);
  let best = null, bestD = DIAMOND_GRAB_RADIUS;
  for (const d of level.diamonds || []) {
    if (d.taken) continue;
    const dist = Math.hypot(d.x - c.x, d.y - c.y);
    if (dist < bestD) { best = d; bestD = dist; }
  }
  return best;
}

export function tryInteract(t, level) {
  if (nearestDiamond(t, level)) return 'diamond';
  if (level.laptop && !level.laptop.used) {
    const c = center(t);
    const dx = level.laptop.x - c.x, dy = level.laptop.y - c.y;
    if (Math.hypot(dx, dy) < LAPTOP_GRAB_RADIUS) return 'laptop';
  }
  return null;
}

// What prompt should the HUD show right now? ('' = none)
// The prompt only shows inside the REAL grab radius, so E always works
// when the prompt is visible (no "prompt shows but E fails" trap).
export function interactPrompt(t, level) {
  if (nearestDiamond(t, level)) return 'Tekan E untuk ambil berlian!';
  if (level.laptop && !level.laptop.used) {
    const c = center(t);
    const dx = level.laptop.x - c.x, dy = level.laptop.y - c.y;
    if (Math.hypot(dx, dy) < LAPTOP_GRAB_RADIUS) return 'Tekan E untuk hack laser (8 detik)!';
  }
  return '';
}

export { SCORE };
