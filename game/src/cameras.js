// cameras.js — wall-mounted CCTV. Sweeps a red cone; being seen pumps the alarm.
// A jammer (F, picked up in the level) disables all cameras for a while.

import { CAMERA_RANGE, CAMERA_CONE_HALF, CAMERA_SPOT_RATE } from './config.js';
import { inCone } from './physics.js';

export function createCamera(def) {
  return {
    x: def.x, y: def.y,
    baseAngle: def.baseAngle, sweep: def.sweep, phase: def.phase || 0,
    angle: def.baseAngle,
    speed: def.speed || 1, // per-level sweep-speed multiplier (harder levels sweep faster)
    disabledUntil: 0,
  };
}

// Current cone angle (radians). Sweeps sinusoidally; faster when the alarm is up.
export function cameraAngle(cam, now, alarmOn) {
  const speed = (alarmOn ? 1.6 : 0.9) * cam.speed;
  return cam.baseAngle + Math.sin(now * speed + cam.phase) * cam.sweep;
}

export function updateCamera(cam, dt, now, thief, solids, alarmOn, disabledUntil) {
  cam.angle = cameraAngle(cam, now, alarmOn);
  if (now < disabledUntil) return { seen: false };
  const tx = thief.x + thief.w / 2, ty = thief.y + thief.h / 2;
  const res = inCone(cam.x, cam.y, cam.angle, CAMERA_RANGE, CAMERA_CONE_HALF, tx, ty, solids);
  return res;
}

export function disableAllCameras(cameras, now, duration) {
  for (const c of cameras) c.disabledUntil = now + duration;
}

export function camerasDisabled(cameras, now) {
  return cameras.length > 0 && cameras.every((c) => now < c.disabledUntil);
}

export { CAMERA_SPOT_RATE };
