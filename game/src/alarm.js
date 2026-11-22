// alarm.js — the alarm meter (0-100). Rises when seen or when a laser is
// tripped, decays when hidden. At 100 the ALARM trips: every guard chases
// and cameras sweep faster until the meter falls back below the clear line.

import {
  ALARM_MAX, ALARM_GUARD_RATE, ALARM_DECAY, ALARM_TRIGGER, ALARM_CLEAR_BELOW,
} from './config.js';

export function createAlarm(startValue) {
  return {
    value: startValue || 0,
    alarmed: (startValue || 0) >= ALARM_TRIGGER,
    everTripped: (startValue || 0) >= ALARM_TRIGGER,
  };
}

export function updateAlarm(alarm, dt, alertGuards, cameraSeeing, laserHits) {
  // Rise: while the alarm is NOT tripped, alert guards and a camera that
  // sees you build the meter toward the trip. Once it IS tripped, chasing
  // guards no longer feed the meter — they are the CONSEQUENCE of the
  // alarm, not its cause, and counting them made the hunt self-sustaining
  // (v3 bug: rise stayed > 0 forever, so the meter could never drain and
  // the alarm could never clear). While tripped, only a camera that
  // currently sees you keeps the meter up; hiding drains it at
  // ALARM_DECAY until it drops below the clear line.
  let rise = 0;
  if (!alarm.alarmed) {
    rise = alertGuards * ALARM_GUARD_RATE + (cameraSeeing ? 45 : 0);
  } else if (cameraSeeing) {
    rise = 45;
  }
  if (rise > 0) {
    alarm.value = Math.min(ALARM_MAX, alarm.value + rise * dt);
  } else {
    alarm.value = Math.max(0, alarm.value - ALARM_DECAY * dt);
  }
  // Instant laser hits add directly.
  for (const amount of laserHits) {
    alarm.value = Math.min(ALARM_MAX, alarm.value + amount);
  }
  if (!alarm.alarmed && alarm.value >= ALARM_TRIGGER) {
    alarm.alarmed = true;
    alarm.everTripped = true;
    return 'tripped';
  }
  if (alarm.alarmed && alarm.value < ALARM_CLEAR_BELOW) {
    alarm.alarmed = false;
    return 'cleared';
  }
  return null;
}

export function alarmColor(value) {
  if (value >= 75) return '#e5484d';
  if (value >= 40) return '#f5a524';
  return '#46a758';
}
