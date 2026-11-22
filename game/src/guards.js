// guards.js — police patrol, vision cone, suspicion, investigate, chase.
// Side-view: the guard faces left (-1) or right (1); the cone is a wedge in
// the facing direction from the guard's head height.

import {
  GUARD_W, GUARD_H, GUARD_PATROL_SPEED, GUARD_INVESTIGATE_SPEED,
  GUARD_CHASE_SPEED, GUARD_CONE_RANGE, GUARD_CONE_HALF,
  GUARD_SUSPECT_RATE, GUARD_SUSPECT_DECAY,
  GUARD_SUSPECT_THRESHOLD, GUARD_ALERT_THRESHOLD, GUARD_LOSE_TIME,
  STUN_DURATION,
} from './config.js';
import { inCone, overlap } from './physics.js';

export function createGuard(def) {
  return {
    x: def.x, y: def.floorY - GUARD_H, w: GUARD_W, h: GUARD_H,
    minX: def.minX, maxX: def.maxX, floorY: def.floorY,
    dir: def.dir || 1,
    // Per-level difficulty overrides (fall back to the global defaults).
    patrolSpeed: def.speed ?? GUARD_PATROL_SPEED,
    chaseSpeed: def.chase ?? GUARD_CHASE_SPEED,
    coneRange: def.cone ?? GUARD_CONE_RANGE,
    state: 'patrol', // patrol | investigate | chase
    suspicion: 0,
    lastSeenX: null,
    loseTimer: 0,
    walkPhase: Math.random() * 10,
    everAlerted: false,
    alarmChase: false, // true while this chase was ordered by the full alarm
    stunUntil: 0, // game time until which this guard is stunned (frozen, blind)
    wasStunned: false, // set while stunned; on recovery the guard investigates the spot
  };
}

// Is this guard stunned right now? (frozen, blind, cannot catch)
export function guardStunned(g, now) {
  return now < g.stunUntil;
}

// Stun the guard for STUN_DURATION seconds. Returns true if it landed
// (a guard that is already stunned cannot be stunned again — one stun,
// one guard, no chain-freezing the whole floor).
export function stunGuard(g, now) {
  if (guardStunned(g, now)) return false;
  g.stunUntil = now + STUN_DURATION;
  g.wasStunned = true;
  g.suspicion = 0;
  return true;
}

// Guard eye position (head height, front of body).
function eye(g) {
  return { x: g.x + g.w / 2 + g.dir * 10, y: g.y + 18 };
}

// Can this guard see the thief right now? (cone + line-of-sight + not smoked)
export function guardSees(g, thief, solids, smoked) {
  if (smoked) return { seen: false, factor: 0 };
  const e = eye(g);
  const facing = g.dir > 0 ? 0 : Math.PI;
  const tx = thief.x + thief.w / 2, ty = thief.y + thief.h / 2;
  const res = inCone(e.x, e.y, facing, g.coneRange, GUARD_CONE_HALF, tx, ty, solids);
  if (!res.seen) return res;
  // Sneaking halves the detection build-up (handled by caller via factor).
  return res;
}

export function updateGuard(g, dt, thief, solids, smoked, events, alarmOn, now) {
  // ---- STUNNED: frozen in place, blind, cannot catch. ----
  // The alarm cannot re-order a stunned guard into a chase either: one
  // stun buys four seconds against exactly one guard, even mid-alarm.
  if (guardStunned(g, now)) {
    g.walkPhase += dt * 2; // dazed wobble
    return null;
  }
  if (g.wasStunned) {
    // Just recovered: the guard shakes it off and investigates the spot
    // where it was stunned (it does NOT instantly resume a chase — the
    // thief earned those four seconds).
    g.wasStunned = false;
    g.state = 'investigate';
    g.suspicion = 50;
    g.lastSeenX = g.x + g.w / 2;
    g.loseTimer = 0;
  }

  g.walkPhase += dt * (g.state === 'chase' ? 14 : 8);

  // ---- FULL ALARM: every guard is ordered to hunt, right now. ----
  // This is the v2 bug fix: the alarm flag used to never reach the guards,
  // so a full meter changed nothing. Now a tripped alarm forces ALL guards
  // into chase at once, and they do not give up while it stays up.
  if (alarmOn && g.state !== 'chase') {
    g.state = 'chase';
    g.alarmChase = true;
    g.suspicion = 100;
    g.lastSeenX = thief.x + thief.w / 2;
    g.loseTimer = 0;
    g.everAlerted = true;
    events.push({ type: 'alert' });
  }
  if (alarmOn) g.loseTimer = 0; // never give up the hunt while alarmed

  const seen = guardSees(g, thief, solids, smoked);
  const sneaking = thief.sneaking;
  if (seen.seen) {
    const rate = GUARD_SUSPECT_RATE * (0.35 + 0.65 * seen.factor) * (sneaking ? 0.45 : 1);
    const before = g.suspicion;
    g.suspicion = Math.min(100, g.suspicion + rate * dt);
    g.lastSeenX = thief.x + thief.w / 2;
    g.loseTimer = 0;
    if (before < GUARD_SUSPECT_THRESHOLD && g.suspicion >= GUARD_SUSPECT_THRESHOLD) {
      events.push({ type: 'suspicious' });
    }
    if (before < GUARD_ALERT_THRESHOLD && g.suspicion >= GUARD_ALERT_THRESHOLD) {
      g.state = 'chase';
      g.everAlerted = true;
      events.push({ type: 'alert' });
    }
  } else {
    // While the alarm is up the hunt never cools down: the "!" stays.
    if (!alarmOn) g.suspicion = Math.max(0, g.suspicion - GUARD_SUSPECT_DECAY * dt);
    if (g.state === 'chase' && !alarmOn) {
      g.loseTimer += dt;
      if (g.loseTimer > GUARD_LOSE_TIME) {
        g.state = 'investigate';
        g.alarmChase = false;
        g.loseTimer = 0;
      }
    }
  }

  // Movement by state
  if (g.state === 'patrol') {
    g.x += g.dir * g.patrolSpeed * dt;
    if (g.x <= g.minX) { g.x = g.minX; g.dir = 1; }
    if (g.x + g.w >= g.maxX) { g.x = g.maxX - g.w; g.dir = -1; }
    if (g.suspicion >= GUARD_SUSPECT_THRESHOLD && g.lastSeenX !== null) {
      g.state = 'investigate';
    }
  } else if (g.state === 'investigate') {
    const target = g.lastSeenX !== null ? g.lastSeenX - g.w / 2 : g.x;
    const dx = target - g.x;
    if (Math.abs(dx) > 6) {
      g.dir = dx > 0 ? 1 : -1;
      g.x += g.dir * GUARD_INVESTIGATE_SPEED * dt;
    } else {
      // Arrived: look around, then give up and go back to patrol.
      g.suspicion = Math.max(0, g.suspicion - GUARD_SUSPECT_DECAY * 2 * dt);
      if (g.suspicion <= 0) {
        g.state = 'patrol';
        g.lastSeenX = null;
      }
    }
    g.x = Math.max(g.minX, Math.min(g.maxX - g.w, g.x));
  } else if (g.state === 'chase') {
    // Hunt the LAST SEEN spot, not a live GPS fix. The guard updates
    // lastSeenX whenever it sees the thief itself (or the alarm trip /
    // a camera feeds it a fresh position), so a thief in the open is
    // followed relentlessly — but duck behind cover, break line of sight,
    // and the guards converge on where you WERE, giving you a real chance
    // to hide until the alarm drains. (v3 fix: chasing the live position
    // made the hunt inescapable — the guards always knew exactly where
    // you were, even through walls.) Smoke still falls back to lastSeen.
    const tx = g.lastSeenX !== null ? g.lastSeenX : thief.x + thief.w / 2;
    const dx = tx - (g.x + g.w / 2);
    g.dir = dx > 0 ? 1 : -1;
    g.x += g.dir * g.chaseSpeed * dt;
    g.x = Math.max(g.minX - 60, Math.min(g.maxX + 60 - g.w, g.x));
  }

  // Caught? (touching the thief while not smoked)
  if (!smoked && overlap(g, thief)) {
    return 'caught';
  }
  return null;
}
