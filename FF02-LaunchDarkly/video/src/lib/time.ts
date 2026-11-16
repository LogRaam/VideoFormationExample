import React, {createContext, useContext} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from '../data/timeline.fr.json';

export type Lang = 'fr';
export type Word = {w: string; start: number; end: number};
export type Segment = {id: string; text: string; start: number; end: number; words: Word[]};
export type Scene = {id: string; start: number; end: number; segments: Segment[]};
type Timeline = {duration: number; scenes: Scene[]};

export const LANG: Lang = 'fr';
export const TL: Timeline = timeline as Timeline;

const SEGS = new Map<string, Segment>();
const SCENES = new Map<string, Scene>();
for (const sc of TL.scenes) {
  SCENES.set(sc.id, sc);
  for (const s of sc.segments) SEGS.set(s.id, s);
}

export const scene = (id: string): Scene => {
  const s = SCENES.get(id);
  if (!s) throw new Error(`unknown scene ${id}`);
  return s;
};

export const seg = (id: string): Segment => {
  const s = SEGS.get(id);
  if (!s) throw new Error(`unknown segment ${id}`);
  return s;
};

const clean = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^\p{L}\p{N}']/gu, '');

/**
 * Time (global seconds) of a word or phrase inside a segment. Words are matched
 * on whitespace tokens of the script, so "l'équipe" is one token.
 */
export const w = (segId: string, word: string, nth = 0, edge: 'start' | 'end' = 'start'): number => {
  const s = seg(segId);
  const parts = word.split(/\s+/).map(clean);
  let hits = 0;
  for (let i = 0; i < s.words.length; i++) {
    let ok = true;
    for (let k = 0; k < parts.length; k++) {
      if (!s.words[i + k] || clean(s.words[i + k].w) !== parts[k]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      if (hits === nth) return edge === 'start' ? s.words[i].start : s.words[i + parts.length - 1].end;
      hits++;
    }
  }
  throw new Error(`word "${word}" (#${nth}) not found in ${segId}: ${s.text}`);
};

/** Current global time in seconds. */
export const useT = (): number => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const offset = useContext(OffsetCtx);
  return (frame + offset) / fps;
};

/** Sequences reset the frame counter; this context restores global time. */
export const OffsetCtx = createContext(0);
export const WithOffset: React.FC<{frames: number; children: React.ReactNode}> = ({frames, children}) => {
  const parent = useContext(OffsetCtx);
  return React.createElement(OffsetCtx.Provider, {value: parent + frames}, children);
};
