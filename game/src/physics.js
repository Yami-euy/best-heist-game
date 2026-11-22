// physics.js — AABB collision, line-of-sight, and vision-cone tests (side-view).

// Overlap test for two AABBs.
export function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Does segment (x1,y1)-(x2,y2) intersect rect r? (for line-of-sight)
export function segmentHitsRect(x1, y1, x2, y2, r) {
  // Quick reject: both endpoints on the same outside side.
  if ((x1 < r.x && x2 < r.x) || (x1 > r.x + r.w && x2 > r.x + r.w) ||
      (y1 < r.y && y2 < r.y) || (y1 > r.y + r.h && y2 > r.y + r.h)) return false;
  // Either endpoint inside the rect.
  if (x1 >= r.x && x1 <= r.x + r.w && y1 >= r.y && y1 <= r.y + r.h) return true;
  if (x2 >= r.x && x2 <= r.x + r.w && y2 >= r.y && y2 <= r.y + r.h) return true;
  // Check intersection with each edge.
  const dx = x2 - x1, dy = y2 - y1;
  const edges = [
    [r.x, r.y, r.x + r.w, r.y], [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h], [r.x, r.y + r.h, r.x, r.y],
  ];
  for (const [ex1, ey1, ex2, ey2] of edges) {
    const den = dx * (ey2 - ey1) - dy * (ex2 - ex1);
    if (Math.abs(den) < 1e-9) continue;
    const t = ((ex1 - x1) * (ey2 - ey1) - (ey1 - y1) * (ex2 - ex1)) / den;
    const u = ((ex1 - x1) * dy - (ey1 - y1) * dx) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
  }
  return false;
}

// Line-of-sight between two points, blocked by solid rects (crates, drums).
// The ground/platforms do not block sight (they are below the sight line in practice).
export function hasLineOfSight(x1, y1, x2, y2, solids) {
  for (const s of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, s)) return false;
  }
  return true;
}

// Is target (tx,ty) inside a vision cone from origin (ox,oy) facing `facing`
// (radians, 0 = right, PI/2 = down), with range and half-angle?
// Also returns a distance factor (1 = point blank, 0 = at max range).
export function inCone(ox, oy, facing, range, halfAngle, tx, ty, solids) {
  const dx = tx - ox, dy = ty - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return { seen: false, factor: 0 };
  if (dist < 12) return { seen: true, factor: 1 };
  const ang = Math.atan2(dy, dx);
  let diff = ang - facing;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > halfAngle) return { seen: false, factor: 0 };
  if (!hasLineOfSight(ox, oy, tx, ty, solids)) return { seen: false, factor: 0 };
  return { seen: true, factor: 1 - dist / range };
}

// Resolve an axis-aligned move against solid rects.
// Moves `body` by (dx, dy) one axis at a time; returns {hitX, hitY, landed}.
// `oneWay` platforms: only collide when falling and the body's feet were above
// the platform top at the start of the move.
export function moveBody(body, dx, dy, solids, oneWay) {
  let hitX = false, hitY = false, landed = false;
  // X axis
  body.x += dx;
  for (const s of solids) {
    if (overlap(body, s)) {
      if (dx > 0) body.x = s.x - body.w;
      else if (dx < 0) body.x = s.x + s.w;
      hitX = true;
    }
  }
  // Y axis
  const prevBottom = body.y + body.h;
  body.y += dy;
  if (dy > 0) {
    for (const s of solids) {
      if (overlap(body, s)) {
        body.y = s.y - body.h;
        hitY = true; landed = true;
      }
    }
    // one-way platforms: land only if the feet were above the top before
    // the move and are at/below it after (a "crossed the top" test, so a
    // fast fall at a low frame rate can never tunnel through the floor).
    for (const p of oneWay) {
      if (prevBottom <= p.y + 1 && body.x + body.w > p.x + 2 && body.x < p.x + p.w - 2 &&
          body.y + body.h >= p.y) {
        body.y = p.y - body.h;
        hitY = true; landed = true;
      }
    }
  } else if (dy < 0) {
    for (const s of solids) {
      if (overlap(body, s)) {
        body.y = s.y + s.h;
        hitY = true;
      }
    }
  }
  return { hitX, hitY, landed };
}
