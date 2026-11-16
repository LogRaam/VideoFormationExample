import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Q} from '../lib/cues';
import {EVALS, FLIPS, TRIPS} from '../lib/story';

/**
 * Sound design: one subtle effect per state change, never on top of a key word.
 * State changes of the flag story are generated from the same lists as the picture.
 */
type Cue = [number, string, number];

export const SFX = (): Cue[] => {
  const cues: Cue[] = [
    [Q.bankApp + 0.9, 'whoosh_low', 0.14],
    [Q.team, 'pop_lo', 0.25],
    [Q.build, 'shimmer', 0.35],
    [Q.merge + 0.1, 'whoosh_fast', 0.2],
    [Q.merge + 1.5, 'pop', 0.25],
    [Q.inSoftware - 0.1, 'chime', 0.18],
    [Q.flagWired + 0.05, 'pop_hi', 0.45],
    [Q.flagName, 'tick', 0.5],
    [Q.deploy - 0.4, 'whoosh', 0.16],
    [Q.deploy + 1.15, 'thud', 0.16],
    [Q.flagOff - 0.05, 'tick', 0.45],
    [Q.asleep - 0.3, 'shimmer', 0.18],
    [Q.reveal + 0.1, 'whoosh_low', 0.16],
    [Q.unchanged - 0.15, 'chime', 0.12],
    [Q.bug, 'bug', 0.45],
    [Q.sameVersion - 0.1, 'chime', 0.12],
    [Q.recap, 'whoosh_low', 0.18],
    [Q.develop, 'pop_lo', 0.22],
    [Q.mergeR, 'pop_lo', 0.22],
    [Q.deployR, 'pop_lo', 0.22],
    [Q.configure, 'pop', 0.22],
    [Q.evaluateR, 'pop', 0.22],
    [Q.choose, 'pop', 0.22],
    [Q.final1 - 0.1, 'shimmer', 0.3],
  ];
  FLIPS.forEach(([t], i) => cues.push([t, 'switch', i < 2 ? 0.45 : 0.3]));
  TRIPS.forEach((tr, i) => {
    cues.push([tr.t0, 'data', i < 2 ? 0.35 : 0.22]);
    cues.push([tr.t1, 'arrive', i < 2 ? 0.2 : 0.12]);
  });
  EVALS.forEach((e, i) => {
    cues.push([e.tap, 'tick', i < 2 ? 0.5 : 0.3]);
    cues.push([e.show - 0.05, 'whoosh_fast', i < 2 ? 0.3 : 0.18]);
  });
  return cues.sort((a, b) => a[0] - b[0]);
};

export const Sfx: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <>
      {SFX().map(([t, name, gain], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(t * fps))} durationInFrames={Math.round(2.5 * fps)} layout="none">
          <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={gain} />
        </Sequence>
      ))}
    </>
  );
};
