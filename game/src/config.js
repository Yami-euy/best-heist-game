// config.js — constants for The Star of Merdeka (platformer, side-view).
// Canvas 1280x720. HUD 56px at top. Ground top at y=660.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const HUD_H = 56;
export const GROUND_Y = 660;

// Thief physics
export const THIEF_W = 34;
export const THIEF_H = 62;
export const THIEF_RUN_SPEED = 270; // px/s
export const THIEF_SNEAK_SPEED = 130; // Shift = sneak
export const THIEF_CLIMB_SPEED = 150;
export const GRAVITY = 2200; // px/s^2
export const JUMP_VEL = -800; // jump height ~145px
export const COYOTE_TIME = 0.1;
export const JUMP_BUFFER = 0.12;

// Guard
export const GUARD_W = 36;
export const GUARD_H = 64;
export const GUARD_PATROL_SPEED = 55; // default; levels override per guard (def.speed)
export const GUARD_INVESTIGATE_SPEED = 95;
export const GUARD_CHASE_SPEED = 200; // default; levels override per guard (def.chase)
export const GUARD_CONE_RANGE = 280; // default; levels override per guard (def.cone)
export const GUARD_CONE_HALF = 0.5; // ~29 degrees
export const GUARD_SUSPECT_RATE = 85; // suspicion per second at close range
export const GUARD_SUSPECT_DECAY = 40;
export const GUARD_SUSPECT_THRESHOLD = 35; // "?" investigate
export const GUARD_ALERT_THRESHOLD = 85; // "!" chase
export const GUARD_LOSE_TIME = 2.5; // seconds without sight before giving up chase

// Camera
export const CAMERA_RANGE = 320;
export const CAMERA_CONE_HALF = 0.42;
export const CAMERA_SPOT_RATE = 45; // alarm per second while seen by camera

// Alarm
export const ALARM_MAX = 100;
export const ALARM_GUARD_RATE = 25; // per second per alert guard
export const ALARM_DECAY = 8; // alarm lingers a bit longer once tripped
export const ALARM_LASER_HIT = 60;
export const ALARM_TRIGGER = 100;
export const ALARM_CLEAR_BELOW = 50; // chase holds until the meter drops below this

// Tools
export const SMOKE_COUNT = 2; // per level
export const SMOKE_DURATION = 3; // seconds invisible
export const STUN_COUNT = 2; // stun charges per level (X near a guard)
export const STUN_DURATION = 4; // seconds a stunned guard stays frozen
export const STUN_RADIUS = 90; // px (center to center) to land a stun
export const JAMMER_DURATION = 6; // seconds all cameras stay off after F
export const COIN_COOLDOWN = 2; // seconds between coin tosses
export const LASER_HACK_DURATION = 8; // seconds lasers off after laptop hack

// Grab radii (generous — v1's bug was a tiny radius + hold-to-grab)
export const LOOT_GRAB_PAD = 26; // walk-over loot: overlap + this padding
export const DIAMOND_GRAB_RADIUS = 110; // press E within this distance (center to center)
export const DIAMOND_PROMPT_RADIUS = 150;
export const LAPTOP_GRAB_RADIUS = 100;
export const LAPTOP_PROMPT_RADIUS = 140;

// Scores
export const SCORE = {
  money: 200,
  bag: 400,
  gold: 300,
  diamond: 1000,
  levelBonus: 250,
  ghostBonus: 500,
};

export const COLORS = {
  bg: '#141118',
  hudBg: '#1c1820',
  hudLine: '#3a3340',
  text: '#f2ead8',
  muted: '#9a917f',
  gold: '#f5c542',
  red: '#e5484d',
  alarmHigh: '#e5484d',
  alarmMid: '#f5a524',
  alarmLow: '#46a758',
  coneGuard: 'rgba(245, 197, 66, 0.20)',
  coneGuardEdge: 'rgba(245, 197, 66, 0.45)',
  coneCamera: 'rgba(229, 72, 77, 0.20)',
  coneCameraEdge: 'rgba(229, 72, 77, 0.5)',
  platform: '#3a3f46',
  platformTop: '#6a7078',
  ladder: '#8a8f96',
  prompt: '#ffd60a',
};
