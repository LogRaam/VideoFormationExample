import {ease, map} from './anim';

export type Pt = {x: number; y: number};
export type Bez = [Pt, Pt, Pt, Pt];

/** Point on a cubic Bézier at u in [0,1]. */
export const bez = ([a, b, c, d]: Bez, u: number): Pt => {
  const v = 1 - u;
  return {
    x: v * v * v * a.x + 3 * v * v * u * b.x + 3 * v * u * u * c.x + u * u * u * d.x,
    y: v * v * v * a.y + 3 * v * v * u * b.y + 3 * v * u * u * c.y + u * u * u * d.y,
  };
};

export const bezPath = ([a, b, c, d]: Bez) => `M${a.x},${a.y} C${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`;

export const rev = ([a, b, c, d]: Bez): Bez => [d, c, b, a];

/** Camera key: world point (cx, cy) shown at the centre of the frame at scale s. */
export type Cam = {s: number; cx: number; cy: number};

/** Piecewise camera: holds each key, eases between consecutive keys over [t0, t1]. */
export const camAt = (t: number, keys: {t0: number; t1: number; cam: Cam}[], start: Cam): Cam => {
  let cur = start;
  for (const k of keys) {
    if (t <= k.t0) return cur;
    const u = map(t, [k.t0, k.t1], [0, 1], ease.inOut);
    const next = {s: cur.s + (k.cam.s - cur.s) * u, cx: cur.cx + (k.cam.cx - cur.cx) * u, cy: cur.cy + (k.cam.cy - cur.cy) * u};
    if (u < 1) return next;
    cur = k.cam;
  }
  return cur;
};
