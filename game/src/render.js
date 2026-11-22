// render.js — draws the whole game: backdrop, platforms, ladders, sprites,
// vision cones, HUD, prompts, and the title / intro / caught / win overlays.

import { CANVAS_W, CANVAS_H, HUD_H, COLORS } from './config.js';
import { SPRITES, drawSprite } from './sprites.js';
import { alarmColor } from './alarm.js';

// Draw a vision cone wedge from (ox,oy) along `angle`, range, half-angle.
function drawCone(ctx, ox, oy, angle, range, halfAngle, fill, edge) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.arc(ox, oy, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// A steel platform beam.
function drawPlatform(ctx, p) {
  ctx.fillStyle = COLORS.platform;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = COLORS.platformTop;
  ctx.fillRect(p.x, p.y, p.w, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(p.x, p.y + p.h - 3, p.w, 3);
  // Rivets.
  ctx.fillStyle = '#565b63';
  for (let x = p.x + 10; x < p.x + p.w - 6; x += 28) {
    ctx.fillRect(x, p.y + 7, 4, 4);
  }
}

// A wall ladder: two rails + rungs.
function drawLadder(ctx, l) {
  ctx.fillStyle = COLORS.ladder;
  ctx.fillRect(l.x, l.y, 4, l.h);
  ctx.fillRect(l.x + l.w - 4, l.y, 4, l.h);
  for (let y = l.y + 8; y < l.y + l.h - 4; y += 16) {
    ctx.fillRect(l.x, y, l.w, 4);
  }
}

// A solid prop (crate / drum / tires): draw the sprite inside its rect.
function drawSolid(ctx, images, s) {
  const img = images[s.sprite];
  const def = SPRITES[s.sprite];
  if (!img || !def) return;
  const h = s.h + 8;
  const w = (h * def.w) / def.h;
  const cx = s.x + s.w / 2;
  ctx.drawImage(img, cx - w / 2, s.y + s.h - h, w, h);
}

export function render(ctx, g, now) {
  const { level, thief, guards, cameras, lasers, alarm, score, lootGot, lootTotal,
    diamondsGot, smokeLeft, stunLeft, jammerLeft, coinCooldown, lasersOffUntil, camerasOffUntil,
    prompt, popups, coins, smokes, images } = g;

  // ---- backdrop ----
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const bgImg = images[level.bg];
  const bgDef = SPRITES[level.bg];
  if (bgImg && bgDef) {
    const bw = CANVAS_W;
    const bh = (bw * bgDef.h) / bgDef.w;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(bgImg, 0, CANVAS_H - bh, bw, bh);
    ctx.restore();
  }
  // Darken so gameplay pops.
  ctx.fillStyle = 'rgba(8, 8, 14, 0.45)';
  ctx.fillRect(0, HUD_H, CANVAS_W, CANVAS_H - HUD_H);

  // ---- decor (behind gameplay) ----
  for (const d of level.decor) {
    const img = images[d.sprite];
    const def = SPRITES[d.sprite];
    if (!img || !def) continue;
    const w = (d.h * def.w) / def.h;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.drawImage(img, d.x - w / 2, d.y - d.h, w, d.h);
    ctx.restore();
  }

  // ---- vault (level 2): big door against the back wall ----
  if (level.vault) {
    const v = level.vault;
    const img = images.vault;
    const def = SPRITES.vault;
    if (img && def) {
      const w = (v.h * def.w) / def.h;
      ctx.drawImage(img, v.x + v.w / 2 - w / 2, v.y, w, v.h);
    }
    // Diamond glow in front of the vault door (one glow per untaken diamond).
    for (const d of level.diamonds || []) {
      if (d.taken) continue;
      const pulse = 0.6 + 0.4 * Math.sin(now * 4);
      const dg = ctx.createRadialGradient(d.x, d.y, 4, d.x, d.y, 60);
      dg.addColorStop(0, `rgba(120, 220, 255, ${0.55 * pulse})`);
      dg.addColorStop(1, 'rgba(120, 220, 255, 0)');
      ctx.fillStyle = dg;
      ctx.fillRect(d.x - 60, d.y - 60, 120, 120);
    }
  }

  // ---- exit door ----
  const ex = level.exit;
  const exitOpen = g.exitOpen;
  const doorImg = images.door;
  const doorDef = SPRITES.door;
  if (doorImg && doorDef) {
    const w = (ex.h * doorDef.w) / doorDef.h;
    ctx.drawImage(doorImg, ex.x + ex.w / 2 - w / 2, ex.y, w, ex.h);
  }
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = exitOpen ? '#46a758' : '#8d8578';
  ctx.fillText(exitOpen ? '▼ EXIT — TERBUKA ▼' : 'EXIT — TERKUNCI', Math.min(ex.x + ex.w, CANVAS_W - 8), ex.y - 8);
  ctx.textAlign = 'center';

  // ---- platforms, ladders, ground ----
  for (const p of level.platforms) drawPlatform(ctx, p);
  for (const l of level.ladders) drawLadder(ctx, l);
  ctx.fillStyle = '#232026';
  ctx.fillRect(level.ground.x, level.ground.y, level.ground.w, level.ground.h);
  ctx.fillStyle = '#4a4550';
  ctx.fillRect(level.ground.x, level.ground.y, level.ground.w, 4);

  // ---- solids (cover) ----
  for (const s of level.solids) drawSolid(ctx, images, s);

  // ---- laptop hack station ----
  if (level.laptop && !level.laptop.used) {
    const img = images.laptop;
    const def = SPRITES.laptop;
    if (img && def) {
      const h = 52;
      const w = (h * def.w) / def.h;
      ctx.drawImage(img, level.laptop.x - w / 2, level.laptop.y - h, w, h);
    }
    // Blinking "HACK" marker.
    if (Math.sin(now * 5) > 0) {
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.fillText('HACK', level.laptop.x, level.laptop.y - 58);
    }
  }

  // ---- lasers ----
  const lasersOff = now < lasersOffUntil;
  for (const l of lasers) {
    const img = images.laser;
    if (lasersOff) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      if (img) ctx.drawImage(img, l.x1, l.y - 13, l.x2 - l.x1, 27);
      ctx.restore();
      continue;
    }
    // Glowing beam.
    ctx.save();
    ctx.strokeStyle = 'rgba(229, 72, 77, 0.9)';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff2d2d';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(l.x1, l.y);
    ctx.lineTo(l.x2, l.y);
    ctx.stroke();
    ctx.restore();
    if (img) {
      ctx.drawImage(img, l.x1 - 8, l.y - 13, 24, 27);
      ctx.drawImage(img, l.x2 - 16, l.y - 13, 24, 27);
    }
  }

  // ---- loot (walk-over) ----
  for (const loot of level.loot) {
    if (loot.taken) continue;
    const img = images[loot.kind];
    const def = SPRITES[loot.kind];
    if (!img || !def) continue;
    const bob = Math.sin(now * 3 + loot.x) * 4;
    const h = 44;
    const w = (h * def.w) / def.h;
    // Soft glow so loot is obvious at a glance.
    const gl = ctx.createRadialGradient(loot.x, loot.y + bob, 4, loot.x, loot.y + bob, 46);
    gl.addColorStop(0, 'rgba(245, 197, 66, 0.35)');
    gl.addColorStop(1, 'rgba(245, 197, 66, 0)');
    ctx.fillStyle = gl;
    ctx.fillRect(loot.x - 46, loot.y + bob - 46, 92, 92);
    ctx.drawImage(img, loot.x - w / 2, loot.y + bob - h / 2, w, h);
  }

  // ---- diamonds (press E near one to grab it) ----
  for (const d of level.diamonds || []) {
    if (d.taken) continue;
    const img = images.diamond;
    const def = SPRITES.diamond;
    if (img && def) {
      const bob = Math.sin(now * 3 + d.x) * 5;
      const h = 54;
      const w = (h * def.w) / def.h;
      ctx.drawImage(img, d.x - w / 2, d.y + bob - h / 2, w, h);
    }
  }

  // ---- jammer pickup (walk over it to pocket it, F spends it) ----
  if (level.jammer && !level.jammer.taken) {
    const img = images.drill;
    const def = SPRITES.drill;
    if (img && def) {
      const j = level.jammer;
      const bob = Math.sin(now * 3 + j.x) * 4;
      const h = 44;
      const w = (h * def.w) / def.h;
      // Cyan glow so the jammer reads as a tool pickup, not decor.
      const gl = ctx.createRadialGradient(j.x, j.y + bob, 4, j.x, j.y + bob, 46);
      gl.addColorStop(0, 'rgba(80, 200, 255, 0.4)');
      gl.addColorStop(1, 'rgba(80, 200, 255, 0)');
      ctx.fillStyle = gl;
      ctx.fillRect(j.x - 46, j.y + bob - 46, 92, 92);
      ctx.drawImage(img, j.x - w / 2, j.y + bob - h / 2, w, h);
      if (Math.sin(now * 5) > 0) {
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#50c8ff';
        ctx.fillText('JAMMER', j.x, j.y + bob - 30);
      }
    }
  }

  // ---- crew (waiting by the exit) ----
  for (const c of level.crew) {
    const img = images[c.sprite];
    const def = SPRITES[c.sprite];
    if (!img || !def) continue;
    drawSprite(ctx, img, def, c.x, c.y, 78, false);
  }

  // ---- cameras + cones ----
  for (const cam of cameras) {
    const img = images.camera;
    const def = SPRITES.camera;
    if (img && def) {
      const h = 44;
      const w = (h * def.w) / def.h;
      ctx.drawImage(img, cam.x - w / 2, cam.y - h / 2, w, h);
    }
    const disabled = now < camerasOffUntil;
    if (!disabled) {
      drawCone(ctx, cam.x, cam.y, cam.angle, 320, 0.42,
        COLORS.coneCamera, COLORS.coneCameraEdge);
    }
  }

  // ---- guards + cones ----
  for (const gu of guards) {
    const stunned = now < gu.stunUntil;
    const e = { x: gu.x + gu.w / 2 + gu.dir * 10, y: gu.y + 18 };
    const facing = gu.dir > 0 ? 0 : Math.PI;
    // A stunned guard is blind: no cone, no "!" — just dizzy stars.
    if (!stunned) {
      drawCone(ctx, e.x, e.y, facing, 280, 0.5, COLORS.coneGuard, COLORS.coneGuardEdge);
    }
    const img = images[gu.state === 'chase' ? 'guard-aim' : (gu.state === 'investigate' ? 'guard-flash' : 'guard-baton')];
    const def = SPRITES[gu.state === 'chase' ? 'guard-aim' : (gu.state === 'investigate' ? 'guard-flash' : 'guard-baton')];
    if (img && def) {
      // Walk bob.
      const bob = gu.state === 'patrol' ? Math.abs(Math.sin(gu.walkPhase)) * 3 : 0;
      ctx.save();
      if (stunned) ctx.globalAlpha = 0.75;
      drawSprite(ctx, img, def, gu.x + gu.w / 2, gu.y + gu.h - bob, 80, gu.dir < 0);
      ctx.restore();
    }
    // "?" / "!" above the head — or dizzy stars while stunned.
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    if (stunned) {
      ctx.fillStyle = '#ffd60a';
      ctx.fillText('💫', gu.x + gu.w / 2, gu.y - 10);
    } else if (gu.suspicion >= 35) {
      ctx.fillStyle = gu.suspicion >= 85 ? '#ff2d2d' : '#ffd60a';
      ctx.fillText(gu.suspicion >= 85 ? '!' : '?', gu.x + gu.w / 2, gu.y - 10);
    }
  }

  // ---- smoke clouds ----
  for (const s of smokes) {
    ctx.save();
    ctx.fillStyle = 'rgba(180, 180, 190, 0.45)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 46, 0, Math.PI * 2);
    ctx.arc(s.x + 30, s.y + 8, 36, 0, Math.PI * 2);
    ctx.arc(s.x - 30, s.y + 6, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- thrown coins ----
  for (const c of coins) {
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6d1a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ---- thief ----
  const smoked = now < thief.smokeUntil;
  ctx.save();
  if (smoked) ctx.globalAlpha = 0.45;
  let spriteName = 'thief-stand';
  if (thief.hacking) spriteName = 'thief-laptop';
  else if (thief.climbing) spriteName = 'thief-laptop-walk';
  else if (thief.moving) spriteName = (Math.floor(thief.runPhase) % 2 === 0) ? 'thief-run' : 'thief-run-cup';
  const tImg = images[spriteName];
  const tDef = SPRITES[spriteName];
  if (tImg && tDef) {
    const targetH = thief.sneaking ? 70 : 78;
    drawSprite(ctx, tImg, tDef, thief.x + thief.w / 2, thief.y + thief.h, targetH, thief.dir < 0);
  }
  ctx.restore();

  // ---- score popups ----
  ctx.textAlign = 'center';
  for (const p of popups) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / 1.2);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#ffd60a';
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }

  // ---- HUD ----
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);
  ctx.fillStyle = COLORS.hudLine;
  ctx.fillRect(0, HUD_H - 2, CANVAS_W, 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('THE STAR OF MERDEKA', 16, 24);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(`LEVEL ${g.levelIndex + 1}/10 — ${level.name}`, 16, 44);

  // Alarm meter.
  const ax = 420, ay = 16, aw = 220, ah = 20;
  ctx.fillStyle = '#2a2530';
  ctx.fillRect(ax, ay, aw, ah);
  ctx.fillStyle = alarmColor(alarm.value);
  ctx.fillRect(ax, ay, aw * (alarm.value / 100), ah);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.strokeRect(ax, ay, aw, ah);
  ctx.fillStyle = alarm.alarmed ? '#ff2d2d' : COLORS.text;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(alarm.alarmed ? '⚠ ALARM!' : 'ALARM', ax, ay + ah + 15);

  // Loot / score / tools.
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`💰 ${lootGot}/${lootTotal}${diamondsGot > 0 ? `  ◆ x${diamondsGot}` : ''}`, 680, 24);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(`Skor ${score}`, 680, 44);
  ctx.fillStyle = COLORS.text;
  ctx.font = '14px sans-serif';
  ctx.fillText(`💨 Smoke ${smokeLeft}   💫 Stun ${stunLeft}   📻 Jammer ${jammerLeft}   🪙 Klik: koin`, 900, 24);
  ctx.fillStyle = COLORS.muted;
  ctx.font = '11px sans-serif';
  ctx.fillText('A/D gerak · W lompat · E ambil · Q smoke · X stun · F jammer', 900, 44);

  // Interaction prompt (big, bottom center).
  if (prompt) {
    ctx.save();
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    const w = ctx.measureText(prompt).width + 36;
    ctx.fillStyle = 'rgba(20, 16, 10, 0.85)';
    ctx.fillRect(CANVAS_W / 2 - w / 2, CANVAS_H - 92, w, 44);
    ctx.strokeStyle = COLORS.prompt;
    ctx.lineWidth = 2;
    ctx.strokeRect(CANVAS_W / 2 - w / 2, CANVAS_H - 92, w, 44);
    ctx.fillStyle = COLORS.prompt;
    ctx.fillText(prompt, CANVAS_W / 2, CANVAS_H - 62);
    ctx.restore();
  }

  // Alarm flash + banner when alarmed: impossible to miss that every
  // guard is now hunting you (the v2 bug was a silent full alarm).
  if (alarm.alarmed) {
    const blink = Math.sin(now * 8) > 0;
    ctx.save();
    ctx.strokeStyle = 'rgba(229, 72, 77, 0.8)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, HUD_H + 3, CANVAS_W - 6, CANVAS_H - HUD_H - 6);
    if (blink) {
      ctx.fillStyle = 'rgba(229, 72, 77, 0.92)';
      ctx.fillRect(CANVAS_W / 2 - 260, HUD_H + 14, 520, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚨 ALARM! SEMUA POLISI MENGEJAR! 🚨', CANVAS_W / 2, HUD_H + 42);
    }
    ctx.restore();
  }
}

export function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function overlay(ctx, title, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 8, 12, 0.78)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent || COLORS.gold;
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText(title, CANVAS_W / 2, 250);
  ctx.fillStyle = COLORS.text;
  ctx.font = '20px sans-serif';
  lines.forEach((ln, i) => ctx.fillText(ln, CANVAS_W / 2, 310 + i * 32));
  ctx.restore();
}

export function renderTitle(ctx, images) {
  // Backdrop: the museum at night + the crew.
  const bgImg = images['bg-dark'];
  const bgDef = SPRITES['bg-dark'];
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  if (bgImg && bgDef) {
    const bw = CANVAS_W;
    const bh = (bw * bgDef.h) / bgDef.w;
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.drawImage(bgImg, 0, CANVAS_H - bh, bw, bh);
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(8, 8, 12, 0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Crew lined up.
  const crew = ['clown-stand', 'thief-stand', 'gas-run', 'thief-run'];
  crew.forEach((name, i) => {
    const img = images[name];
    const def = SPRITES[name];
    if (img && def) drawSprite(ctx, img, def, 380 + i * 170, 560, 150, false);
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('THE STAR OF MERDEKA', CANVAS_W / 2, 150);
  ctx.fillStyle = COLORS.text;
  ctx.font = '22px sans-serif';
  ctx.fillText('Museum tengah malam. Satu pencuri. Satu berlian.', CANVAS_W / 2, 200);
  ctx.fillStyle = COLORS.muted;
  ctx.font = '17px sans-serif';
  ctx.fillText('Lewati penjaga, hindari kamera dan laser, curi Star of Merdeka, lalu kabur.', CANVAS_W / 2, 240);
  ctx.fillStyle = COLORS.text;
  ctx.font = '16px sans-serif';
  ctx.fillText('A/D gerak · W / Spasi lompat · W/S panjat tangga · Shift sneak', CANVAS_W / 2, 610);
  ctx.fillText('E ambil berlian / hack · Q smoke bomb · X stun polisi · F jammer (matikan kamera) · Klik mouse: lempar koin', CANVAS_W / 2, 636);
  ctx.fillText('Loot kecil diambil OTOMATIS saat kamu menyentuhnya.', CANVAS_W / 2, 662);
  ctx.fillStyle = COLORS.prompt;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Tekan tombol apa saja untuk mulai', CANVAS_W / 2, 700);
}

export function renderIntro(ctx, level, index) {
  overlay(ctx, `LEVEL ${index + 1}/10 — ${level.name}`, [level.sub, '', 'Tekan tombol apa saja untuk mulai'], COLORS.gold);
}

export function renderCaught(ctx, levelName) {
  overlay(ctx, 'TERTANGKAP!', [`Penjaga menangkapmu di ${levelName}.`, '', 'Tekan R untuk coba lagi · Tekan T untuk kembali ke judul'], '#e5484d');
}

export function renderLevelComplete(ctx, score, lootGot, lootTotal) {
  overlay(ctx, 'LEVEL SELESAI!', [`Loot: ${lootGot}/${lootTotal} · Skor: ${score}`, '', 'Tekan tombol apa saja untuk lanjut'], '#46a758');
}

export function renderWin(ctx, score, ghost, elapsed, runLootGot, runLootTotal) {
  overlay(ctx, 'KABUR DENGAN STAR!', [
    `Skor akhir: ${score}${ghost ? '  (termasuk bonus ghost +500)' : ''}`,
    `Loot: ${runLootGot}/${runLootTotal} · Waktu: ${fmtTime(elapsed)}`,
    '',
    'Kru menunggumu di luar. The Star of Merdeka milikmu.',
    '',
    'Tekan R untuk main lagi',
  ], COLORS.gold);
}
