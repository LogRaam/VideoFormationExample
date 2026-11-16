import {Easing, interpolate} from 'remotion';

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
};

/** 0..1 progress of an animation that starts at `start` (s) and lasts `dur` (s). */
export const p = (t: number, start: number, dur = 0.6, fn: (x: number) => number = ease.out) =>
  fn(clamp01((t - start) / dur));

/** In-then-out envelope: rises at `a`, falls at `b`. */
export const env = (t: number, a: number, b: number, rise = 0.5, fall = 0.5) =>
  Math.min(p(t, a, rise), 1 - p(t, b, fall, ease.inOut));

export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

export const map = (t: number, inR: number[], outR: number[], fn = ease.inOut) =>
  interpolate(t, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: fn});

/** Damped spring 0 -> 1 (with overshoot) evaluated analytically from time since start. */
export const spring = (t: number, start: number, {stiffness = 170, damping = 18, mass = 1} = {}) => {
  const x = t - start;
  if (x <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * x) * (Math.cos(wd * x) + ((zeta * w0) / wd) * Math.sin(wd * x));
  }
  return 1 - Math.exp(-w0 * x) * (1 + w0 * x);
};

/** Deterministic pseudo random in [0,1) from an integer seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
