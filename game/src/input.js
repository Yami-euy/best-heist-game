// input.js — keyboard + mouse. Tracks held keys and edge-triggered presses.

export function createInput(canvas) {
  const keys = {};
  const pressed = {}; // edge-triggered: true only on the frame the key went down
  const mouse = { x: 0, y: 0, clicked: null }; // clicked: {x, y} in canvas coords, consumed by game

  function codeOf(e) {
    return e.code;
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!keys[e.code]) pressed[e.code] = true;
    keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
  window.addEventListener('blur', () => {
    for (const k of Object.keys(keys)) keys[k] = false;
  });
  canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
    mouse.y = ((e.clientY - r.top) / r.height) * canvas.height;
    mouse.clicked = { x: mouse.x, y: mouse.y };
  });
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
    mouse.y = ((e.clientY - r.top) / r.height) * canvas.height;
  });

  return {
    // Held-state helpers
    left() { return keys.ArrowLeft || keys.KeyA; },
    right() { return keys.ArrowRight || keys.KeyD; },
    up() { return keys.ArrowUp || keys.KeyW; },
    down() { return keys.ArrowDown || keys.KeyS; },
    sneak() { return keys.ShiftLeft || keys.ShiftRight; },
    // Edge-triggered: true once per physical press
    // Space / ArrowUp always jump. W jumps only when NOT on a ladder
    // (on a ladder, W climbs) — see thief.js, which checks wPressed()
    // against the ladder state.
    jumpPressed() { return pressed.Space || pressed.ArrowUp; },
    wPressed() { return pressed.KeyW; },
    actionPressed() { return pressed.KeyE; },
    smokePressed() { return pressed.KeyQ; },
    stunPressed() { return pressed.KeyX; },
    jammerPressed() { return pressed.KeyF; },
    anyPressed() { return Object.keys(pressed).length > 0; },
    mouse,
    // Call at the end of each frame to clear edge triggers + consumed clicks
    endFrame() {
      for (const k of Object.keys(pressed)) delete pressed[k];
      mouse.clicked = null;
    },
  };
}
