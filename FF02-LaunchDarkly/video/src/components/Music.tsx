import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {TL} from '../lib/time';
import cuesData from '../data/music.json';

/** gain: [time(s), gain] keyframes, linearly interpolated (times are absolute). */
type Cue = {src: string; start: number; end: number; offset: number; fadeIn: number; fadeOut: number; gain: number[][]};

const gainAt = (keys: number[][], t: number) => {
  if (keys.length === 1 || t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, g0] = keys[i - 1];
      const [t1, g1] = keys[i];
      return g0 + ((g1 - g0) * (t - t0)) / Math.max(1e-6, t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};

/**
 * Music bed: one cue per act, crossfaded, and ducked under the narration
 * (sidechain-style envelope computed from the narration segment timings).
 */
const DUCK = 0.28; // music level while the narrator speaks (relative)
const ATTACK = 0.25;
const RELEASE = 0.7;

let speechCache: [number, number][] | null = null;
const speech = (): [number, number][] => {
  if (!speechCache) {
    speechCache = [];
    for (const sc of TL.scenes) for (const s of sc.segments) speechCache.push([s.start, s.end]);
  }
  return speechCache;
};

export const duckAt = (t: number) => {
  // distance-based smooth envelope around speech regions
  let g = 1;
  for (const [a, b] of speech()) {
    if (t < a - ATTACK - 0.01 || t > b + RELEASE + 0.01) continue;
    let k: number;
    if (t < a) k = 1 - (a - t) / ATTACK;
    else if (t > b) k = 1 - (t - b) / RELEASE;
    else k = 1;
    k = Math.max(0, Math.min(1, k));
    k = k * k * (3 - 2 * k);
    g = Math.min(g, 1 - (1 - DUCK) * k);
  }
  return g;
};

export const Music: React.FC = () => {
  const {fps} = useVideoConfig();
  const cues = cuesData as Cue[];
  return (
    <>
      {cues.map((c, i) => {
        const from = Math.round(c.start * fps);
        const frames = Math.round((c.end - c.start) * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={frames} layout="none">
            <Audio
              src={staticFile(`audio/music/${c.src}`)}
              startFrom={Math.round(c.offset * fps)}
              volume={(f) => {
                const t = c.start + f / fps;
                const a = c.fadeIn > 0 ? Math.min(1, (t - c.start) / c.fadeIn) : 1;
                const b = c.fadeOut > 0 ? Math.min(1, (c.end - t) / c.fadeOut) : 1;
                const fade = Math.max(0, Math.min(a, b));
                return gainAt(c.gain, t) * Math.sin((fade * Math.PI) / 2) * duckAt(t);
              }}
            />
          </Sequence>
        );
      })}
    </>
  );
};
