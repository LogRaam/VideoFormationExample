import {Q} from './cues';
import {ease, p} from './anim';

// The flag's story as data: when the switch moves in LaunchDarkly, when the new
// configuration reaches the application, and when the application evaluates the
// flag for a user. Picture, sound and QA all read these lists.

/** Start of the quick final demonstration (same software, two behaviours). */
export const DEMO = Q.demo + 0.1;

/** Switch flips in LaunchDarkly: [time, new value]. */
export const FLIPS: [number, 0 | 1][] = [
  [Q.toggleOn, 1],
  [Q.toggleOff, 0],
  [DEMO + 0.2, 1],
  [DEMO + 2.5, 0],
];

/** Configuration updates travelling LaunchDarkly -> application (only when it changes). */
export const TRIPS: {t0: number; t1: number; v: 0 | 1}[] = [
  {t0: Q.transmit, t1: Q.configArrive + 0.15, v: 1},
  {t0: Q.toggleOff + 0.35, t1: Q.toggleOff + 1.45, v: 0},
  {t0: DEMO + 0.4, t1: DEMO + 0.95, v: 1},
  {t0: DEMO + 2.7, t1: DEMO + 3.25, v: 0},
];

/** Evaluations: the user opens the dashboard (tap), the app evaluates, the screen shows the result. */
export const EVALS: {tap: number; ev: number; show: number; v: 0 | 1; fast?: boolean}[] = [
  {tap: Q.opens, ev: Q.evaluate, show: Q.showsNew, v: 1},
  {tap: Q.nextEval, ev: Q.evaluate2, show: Q.backOld, v: 0},
  {tap: DEMO + 1.1, ev: DEMO + 1.35, show: DEMO + 1.7, v: 1, fast: true},
  {tap: DEMO + 3.4, ev: DEMO + 3.65, show: DEMO + 4.0, v: 0, fast: true},
];

export const switchK = (t: number) => {
  let k = 0;
  for (const [ft, v] of FLIPS) {
    const u = p(t, ft, 0.35, ease.inOut);
    if (u <= 0) break;
    k = v ? k + (1 - k) * u : k * (1 - u);
  }
  return k;
};

/** Flag value currently held in the application's memory. */
export const memValue = (t: number): 0 | 1 => {
  let v: 0 | 1 = 0;
  for (const tr of TRIPS) if (t >= tr.t1) v = tr.v;
  return v;
};

/** What the user's screen shows: `under` + slide progress `k` toward the other one. */
export const screenAt = (t: number): {under: 'old' | 'new'; k: number} => {
  let cur: 'old' | 'new' = 'old';
  for (const e of EVALS) {
    const target = e.v ? 'new' : 'old';
    if (t < e.show) break;
    const k = p(t, e.show, e.fast ? 0.4 : 0.65, ease.inOut);
    if (k < 1 && target !== cur) return {under: cur, k};
    cur = target;
  }
  return {under: cur, k: 0};
};
