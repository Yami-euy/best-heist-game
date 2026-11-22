// audio.js — tiny WebAudio effects, no sound files.
// Everything is a short oscillator blip so the game needs no assets.
// Audio only starts after the first user gesture (browser policy).

let audioCtx = null;
let muted = false;

function ensureCtx() {
  if (audioCtx) return audioCtx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  } catch (e) {
    audioCtx = null;
  }
  return audioCtx;
}

export function unlockAudio() {
  const c = ensureCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

function tone(freq, dur, type, vol, when) {
  const c = ensureCtx();
  if (!c || muted) return;
  try {
    const t0 = c.currentTime + (when || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch (e) {
    // Sound is garnish: never let it break the game.
  }
}

export const sfx = {
  loot() { // two-note chime when a loot item is pocketed
    tone(660, 0.12, 'sine', 0.14, 0);
    tone(990, 0.18, 'sine', 0.14, 0.1);
  },
  diamond() { // bright arpeggio for the diamond
    tone(880, 0.12, 'sine', 0.15, 0);
    tone(1174, 0.12, 'sine', 0.15, 0.1);
    tone(1568, 0.25, 'sine', 0.15, 0.2);
  },
  suspicious() { // low buzz when a guard gets suspicious
    tone(220, 0.15, 'square', 0.07, 0);
  },
  alert() { // sharp double beep when a guard goes alert
    tone(440, 0.1, 'square', 0.1, 0);
    tone(440, 0.1, 'square', 0.1, 0.14);
  },
  alarm() { // rising siren sting when the alarm trips
    tone(520, 0.25, 'sawtooth', 0.09, 0);
    tone(780, 0.25, 'sawtooth', 0.09, 0.22);
  },
  laser() { // zap when a laser is tripped
    tone(180, 0.2, 'sawtooth', 0.12, 0);
    tone(90, 0.3, 'sawtooth', 0.1, 0.1);
  },
  coin() { // soft clink for a thrown coin
    tone(1200, 0.06, 'triangle', 0.1, 0);
    tone(900, 0.08, 'triangle', 0.08, 0.07);
  },
  smoke() { // hush of a smoke bomb
    tone(180, 0.3, 'sine', 0.08, 0);
  },
  jammer() { // short zap for the signal jammer
    tone(1400, 0.08, 'sawtooth', 0.07, 0);
    tone(300, 0.2, 'sawtooth', 0.07, 0.06);
  },
  stun() { // dull bonk + wobble for stunning a guard
    tone(180, 0.12, 'square', 0.12, 0);
    tone(90, 0.25, 'square', 0.1, 0.1);
    tone(140, 0.15, 'sine', 0.08, 0.22);
  },
  jump() {
    tone(300, 0.08, 'sine', 0.05, 0);
  },
  hack() { // laptop hack success
    tone(520, 0.1, 'square', 0.08, 0);
    tone(780, 0.1, 'square', 0.08, 0.1);
    tone(1040, 0.16, 'square', 0.08, 0.2);
  },
  win() { // victory arpeggio
    tone(523, 0.14, 'sine', 0.13, 0);
    tone(659, 0.14, 'sine', 0.13, 0.13);
    tone(784, 0.22, 'sine', 0.13, 0.26);
    tone(1047, 0.3, 'sine', 0.13, 0.42);
  },
  caught() { // dull thud for getting caught
    tone(160, 0.35, 'sawtooth', 0.12, 0);
    tone(90, 0.4, 'sawtooth', 0.12, 0.18);
  },
};

export function setMuted(m) {
  muted = m;
}
