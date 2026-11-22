// lasers.js — horizontal red laser beams. Touching one pumps the alarm hard.
// A laptop hack (E) turns them off for a while. A beam may also SLIDE
// sideways (def.slide = amplitude px, def.slideSpeed, def.slidePhase).

import { ALARM_LASER_HIT } from './config.js';

export function createLaser(def) {
  return {
    x1: def.x1, x2: def.x2, y: def.y, cooldown: 0,
    baseX1: def.x1, baseX2: def.x2,
    slide: def.slide || 0, slideSpeed: def.slideSpeed || 0.7, slidePhase: def.slidePhase || 0,
  };
}

// Does the thief's body touch this beam? (beam is a line with a small thickness)
export function laserTouches(laser, thief, offUntil, now) {
  if (now < offUntil) return false;
  if (laser.cooldown > 0) return false;
  const cx = thief.x + thief.w / 2;
  const top = thief.y, bottom = thief.y + thief.h;
  // Beam crosses the thief's horizontal span and the thief's body spans the beam height.
  const withinX = cx > laser.x1 - 6 && cx < laser.x2 + 6;
  const withinY = top <= laser.y + 5 && bottom >= laser.y - 5;
  return withinX && withinY;
}

export function updateLasers(lasers, dt, thief, offUntil, now, events) {
  let hit = false;
  for (const l of lasers) {
    l.cooldown = Math.max(0, l.cooldown - dt);
    // Sliding beams drift sideways on a sine wave (render + hit test use
    // the live x1/x2, so the beam visibly moves).
    if (l.slide > 0) {
      const off = l.slide * Math.sin(now * l.slideSpeed + l.slidePhase);
      l.x1 = l.baseX1 + off;
      l.x2 = l.baseX2 + off;
    }
    if (laserTouches(l, thief, offUntil, now)) {
      l.cooldown = 1; // one hit per second per beam
      events.push({ type: 'laser', amount: ALARM_LASER_HIT });
      hit = true;
    }
  }
  return hit;
}
