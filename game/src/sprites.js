// sprites.js — manifest + loader for Yami's sprite sheet PNGs (transparent).
// All files live under game/assets/. Sizes are the extracted PNG sizes.

export const SPRITES = {
  'thief-stand': { file: 'assets/thief-stand.png', w: 142, h: 344 },
  'thief-laptop': { file: 'assets/thief-laptop.png', w: 202, h: 306 },
  'thief-laptop-walk': { file: 'assets/thief-laptop-walk.png', w: 196, h: 306 },
  'thief-run-cup': { file: 'assets/thief-run-cup.png', w: 144, h: 324 },
  'thief-run': { file: 'assets/thief-run.png', w: 223, h: 265 },
  'clown-stand': { file: 'assets/clown-stand.png', w: 170, h: 340 },
  'clown-walk': { file: 'assets/clown-walk.png', w: 162, h: 336 },
  'clown-walk2': { file: 'assets/clown-walk2.png', w: 138, h: 329 },
  'clown-gas-rifle': { file: 'assets/clown-gas-rifle.png', w: 216, h: 316 },
  'clown-aim': { file: 'assets/clown-aim.png', w: 260, h: 317 },
  'gas-stand': { file: 'assets/gas-stand.png', w: 187, h: 306 },
  'gas-briefcase': { file: 'assets/gas-briefcase.png', w: 165, h: 306 },
  'gas-run': { file: 'assets/gas-run.png', w: 235, h: 294 },
  'guard-flash': { file: 'assets/guard-flash.png', w: 197, h: 272 },
  'guard-baton': { file: 'assets/guard-baton.png', w: 159, h: 268 },
  'guard-aim': { file: 'assets/guard-aim.png', w: 297, h: 266 },
  'money': { file: 'assets/money.png', w: 162, h: 124 },
  'gold': { file: 'assets/gold.png', w: 156, h: 110 },
  'bag-brown': { file: 'assets/bag-brown.png', w: 161, h: 129 },
  'bag-blue': { file: 'assets/bag-blue.png', w: 173, h: 127 },
  'safe': { file: 'assets/safe.png', w: 160, h: 163 },
  'safe-open': { file: 'assets/safe-open.png', w: 178, h: 161 },
  'diamond': { file: 'assets/diamond.png', w: 120, h: 95 },
  'laptop': { file: 'assets/laptop.png', w: 174, h: 141 },
  'mask-clown': { file: 'assets/mask-clown.png', w: 95, h: 105 },
  'mask-skull': { file: 'assets/mask-skull.png', w: 71, h: 105 },
  'mask-balaclava': { file: 'assets/mask-balaclava.png', w: 67, h: 111 },
  'mask-skull-bala': { file: 'assets/mask-skull-bala.png', w: 69, h: 116 },
  'drill': { file: 'assets/drill.png', w: 120, h: 89 },
  'camera': { file: 'assets/camera.png', w: 106, h: 91 },
  'crowbar': { file: 'assets/crowbar.png', w: 60, h: 161 },
  'wrench': { file: 'assets/wrench.png', w: 75, h: 148 },
  'screwdriver': { file: 'assets/screwdriver.png', w: 63, h: 131 },
  'power-drill': { file: 'assets/power-drill.png', w: 134, h: 120 },
  'extinguisher': { file: 'assets/extinguisher.png', w: 71, h: 128 },
  'step-ladder': { file: 'assets/step-ladder.png', w: 156, h: 218 },
  'crate': { file: 'assets/crate.png', w: 141, h: 141 },
  'drum': { file: 'assets/drum.png', w: 81, h: 141 },
  'tires': { file: 'assets/tires.png', w: 160, h: 140 },
  'cables': { file: 'assets/cables.png', w: 267, h: 148 },
  'cables2': { file: 'assets/cables2.png', w: 137, h: 157 },
  'computer': { file: 'assets/computer.png', w: 177, h: 127 },
  'chair': { file: 'assets/chair.png', w: 94, h: 160 },
  'blueprint': { file: 'assets/blueprint.png', w: 131, h: 101 },
  'door': { file: 'assets/door.png', w: 130, h: 222 },
  'vault': { file: 'assets/vault.png', w: 193, h: 225 },
  'laser': { file: 'assets/laser.png', w: 285, h: 27 },
  'bg-top': { file: 'assets/bg-top.png', w: 740, h: 297 },
  'bg-mid': { file: 'assets/bg-mid.png', w: 747, h: 341 },
  'bg-wall-shutter': { file: 'assets/bg-wall-shutter.png', w: 452, h: 295 },
  'bg-wall-window': { file: 'assets/bg-wall-window.png', w: 262, h: 286 },
  'bg-dark': { file: 'assets/bg-dark.png', w: 744, h: 290 },
};

// Load every sprite. Resolves to a map name -> HTMLImageElement.
// A single missing file fails loudly (better than a silently invisible thief).
export function loadSprites() {
  const entries = Object.entries(SPRITES);
  return Promise.all(entries.map(([name, def]) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve([name, img]);
    img.onerror = () => reject(new Error('failed to load sprite ' + def.file));
    img.src = def.file;
  }))).then((pairs) => {
    const out = {};
    for (const [name, img] of pairs) out[name] = img;
    return out;
  });
}

// Draw a sprite centered at (cx, bottomY) with a target height, flipped if needed.
// Returns nothing; silently skips if the image is missing.
export function drawSprite(ctx, img, def, cx, bottomY, targetH, flip) {
  if (!img) return;
  const w = (targetH * def.w) / def.h;
  const x = cx - w / 2;
  const y = bottomY - targetH;
  ctx.save();
  if (flip) {
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, y, w, targetH);
  } else {
    ctx.drawImage(img, x, y, w, targetH);
  }
  ctx.restore();
}
