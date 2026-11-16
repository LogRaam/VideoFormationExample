import React from 'react';
import {C, fonts} from '../theme';

/** Simple vector icons, drawn for this film (no third-party logos). */
export const Icon = {
  flag: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5 21V4" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M5 4h11l-2.5 4L16 12H5" fill={c} fillOpacity={0.9} stroke={c} strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  ),
  sliders: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round">
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2.4" fill={c} />
      <circle cx="10" cy="17" r="2.4" fill={c} />
    </svg>
  ),
  server: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <circle cx="7" cy="7.5" r="1" fill={c} />
      <circle cx="7" cy="16.5" r="1" fill={c} />
    </svg>
  ),
  check: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  moon: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill={c} />
    </svg>
  ),
  bug: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round">
      <rect x="7" y="7" width="10" height="13" rx="5" fill={c} fillOpacity={0.25} />
      <path d="M12 7v13M9 4l1.5 2.5M15 4l-1.5 2.5M3 10h4M17 10h4M3 15h4M17 15h4M4 20l3-2M20 20l-3-2" />
    </svg>
  ),
  memory: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill={c} fillOpacity={0.5} />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" strokeLinecap="round" />
    </svg>
  ),
  branch: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round">
      <circle cx="6" cy="5" r="2.2" />
      <circle cx="6" cy="19" r="2.2" />
      <circle cx="18" cy="8" r="2.2" />
      <path d="M6 7.2v9.6M18 10.2c0 4-6 3-11 7" />
    </svg>
  ),
  rocket: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinejoin="round">
      <path d="M12 2c3 2.5 4.5 6 4 10l-2 3h-4l-2-3c-.5-4 1-7.5 4-10z" fill={c} fillOpacity={0.25} />
      <circle cx="12" cy="9" r="1.6" fill={c} />
      <path d="M8 12l-3 3 3 1M16 12l3 3-3 1M10 18l2 4 2-4" />
    </svg>
  ),
  eye: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" fill={c} />
    </svg>
  ),
};

/** Flat person bust inside a ring; `color` codes the role. */
export const Avatar: React.FC<{size: number; color: string; tone?: string}> = ({size, color, tone = '#F2C6A0'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <clipPath id={`av-${color.slice(1)}`}>
        <circle cx="50" cy="50" r="46" />
      </clipPath>
    </defs>
    <circle cx="50" cy="50" r="48" fill={C.panelHi} stroke={color} strokeWidth="4" />
    <g clipPath={`url(#av-${color.slice(1)})`}>
      <circle cx="50" cy="40" r="17" fill={tone} />
      <path d="M50 20c-12 0-19 8-18 19 4-6 12-9 18-9s14 3 18 9c1-11-6-19-18-19z" fill="#3A2A22" />
      <path d="M14 100c2-22 17-32 36-32s34 10 36 32z" fill={color} />
    </g>
  </svg>
);

/** iOS-like switch. `k` = 0 (off) .. 1 (on). */
export const Switch: React.FC<{k: number; w?: number; on?: string}> = ({k, w = 96, on = C.conf}) => {
  const h = w * 0.56;
  const pad = h * 0.1;
  const d = h - pad * 2;
  const col = mix(C.off, on, k);
  return (
    <div style={{width: w, height: h, borderRadius: h, background: col, position: 'relative', boxShadow: k > 0.5 ? `0 0 ${24 * k}px ${on}88` : 'none', flexShrink: 0}}>
      <div style={{position: 'absolute', top: pad, left: pad + (w - h) * k, width: d, height: d, borderRadius: '50%', background: '#fff', boxShadow: '0 3px 8px #0006'}} />
    </div>
  );
};

export const Label: React.FC<{children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties}> = ({children, size = 26, color = C.text, weight = 600, style}) => (
  <div style={{fontFamily: fonts.body, fontSize: size, color, fontWeight: weight, whiteSpace: 'nowrap', ...style}}>{children}</div>
);

/** Hex colour interpolation. */
export const mix = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [r1, g1, b1] = ch(pa);
  const [r2, g2, b2] = ch(pb);
  const kk = Math.max(0, Math.min(1, k));
  const h = (x: number) => Math.round(x).toString(16).padStart(2, '0');
  return `#${h(r1 + (r2 - r1) * kk)}${h(g1 + (g2 - g1) * kk)}${h(b1 + (b2 - b1) * kk)}`;
};
