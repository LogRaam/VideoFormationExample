import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, fonts} from '../theme';
import {Q} from '../lib/cues';
import {ease, env, lerp, map, p} from '../lib/anim';
import {useT} from '../lib/time';
import {bez, Bez, bezPath, camAt, rev} from '../lib/geom';
import {EVALS, memValue, screenAt, switchK, TRIPS} from '../lib/story';
import {AppBox, BOX_H, BOX_W, JUNCTION, ROW_A_Y, ROW_B_Y, ROW_X} from '../components/AppBox';
import {Phone, PHONE_H, PHONE_W} from '../components/Phone';
import {LD_SWITCH, LDPanel} from '../components/LDPanel';
import {Thumb} from '../components/Dashboards';
import {Avatar, Icon, Label, mix} from '../components/ui';
import layout from '../data/layout.json';

/*
 * One continuous world (1920 x 1080 units) filmed by a camera. Nothing is cut:
 * the branch merges into the software package, the package is deployed into the
 * production slot, then the camera makes room for LaunchDarkly on the left.
 * From the first flag change to the end of the roll-back the camera is locked,
 * so the deployed software is pixel-identical across activation and roll-back.
 */

// ---- world layout -----------------------------------------------------------
export const BOX = {x: layout.box.x, y: layout.box.y}; // production slot (top-left of the software)
const PKG = {x: 393, y: 439, s: 0.55}; // software package at the end of the main branch
const LD = {x: 70, y: 270};
const PHONE = {x: 1440, y: 220};
const TAG = {dx: 40, dy: -84, w: 380, h: 66}; // memory tag, relative to the box
const MAIN_Y = 620;

const LANE_A: Bez = [{x: 1190, y: BOX.y + ROW_A_Y}, {x: 1300, y: BOX.y + ROW_A_Y}, {x: 1330, y: 540}, {x: PHONE.x, y: 540}];
const LANE_B: Bez = [{x: 1190, y: BOX.y + ROW_B_Y}, {x: 1310, y: BOX.y + ROW_B_Y}, {x: 1320, y: 540}, {x: PHONE.x, y: 540}];
const LINK: Bez = [{x: LD.x + 470, y: 372}, {x: 650, y: 372}, {x: 670, y: BOX.y + TAG.dy + 31}, {x: BOX.x + TAG.dx, y: BOX.y + TAG.dy + 31}];
const BRANCH_OUT: Bez = [{x: 40, y: MAIN_Y}, {x: 100, y: MAIN_Y}, {x: 70, y: 440}, {x: 130, y: 440}];
const BRANCH_IN: Bez = [{x: 290, y: 440}, {x: 350, y: 440}, {x: 320, y: MAIN_Y}, {x: 392, y: MAIN_Y}];
const CARD_PATH: Bez = [{x: 210, y: 388}, {x: 360, y: 388}, {x: 330, y: PKG.y + ROW_B_Y * PKG.s}, {x: PKG.x + (ROW_X + (BOX_W - ROW_X - 26) / 2) * PKG.s, y: PKG.y + ROW_B_Y * PKG.s}];

const FROM_JUNCTION = (rowY: number) => `M${JUNCTION.x + 22},${JUNCTION.y} C${JUNCTION.x + 40},${JUNCTION.y} ${JUNCTION.x + 22},${rowY} ${ROW_X},${rowY}`;

// ---- camera -----------------------------------------------------------------
const CAM0 = {s: 1.55, cx: PHONE.x + PHONE_W / 2, cy: 540};
const camKeys = () => [
  {t0: Q.bankApp + 1.0, t1: Q.team - 0.3, cam: {s: 1, cx: 960, cy: 540}},
  {t0: Q.team - 0.3, t1: Q.team + 1.3, cam: {s: 1.3, cx: 470, cy: 500}},
  {t0: Q.devs - 0.5, t1: Q.devs + 1.2, cam: {s: 1.7, cx: 560, cy: 470}},
  {t0: Q.deploy - 0.7, t1: Q.deploy + 1.4, cam: {s: 1, cx: 960, cy: 540}},
  {t0: Q.flagOff - 0.6, t1: Q.flagOff + 1.8, cam: {s: 1.07, cx: 1180, cy: 560}},
  {t0: Q.reveal, t1: Q.reveal + 1.8, cam: {s: 1, cx: 960, cy: 540}},
  {t0: Q.recap, t1: Q.recap + 1.6, cam: {s: 0.6, cx: 960, cy: 173}},
];

const fadeIO = (t: number, a: number, b: number, rise = 0.5, fall = 0.5) => Math.max(0, env(t, a, b, rise, fall));

// ---- small pieces -------------------------------------------------------------
const Dot: React.FC<{x: number; y: number; c: string; r?: number; o?: number}> = ({x, y, c, r = 9, o = 1}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: c, boxShadow: `0 0 ${r * 2}px ${c}, 0 0 ${r * 4}px ${c}88`, opacity: o}} />
);

const Lane: React.FC<{b: Bez; lit: number; t: number; dir?: 1 | -1}> = ({b, lit, t}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={bezPath(b)} stroke={C.line} strokeWidth={6} fill="none" strokeLinecap="round" />
    {lit > 0 && (
      <>
        <path d={bezPath(b)} stroke={C.beh} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.18 * lit} />
        <path d={bezPath(b)} stroke={C.beh} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="14 16" strokeDashoffset={-t * 60} opacity={lit} />
      </>
    )}
  </svg>
);

const Cursor: React.FC<{x: number; y: number; press: number; o: number}> = ({x, y, press, o}) => (
  <div style={{position: 'absolute', left: x - 6, top: y - 4, opacity: o, transform: `scale(${1 - 0.15 * press})`, transformOrigin: '6px 4px'}}>
    <svg width={44} height={52} viewBox="0 0 22 26">
      <path d="M3 2l15 12-6.5 1 4 7.5-3 1.6-4-7.6L3 21z" fill="#fff" stroke="#120E2E" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
    {press > 0 && <div style={{position: 'absolute', left: -24, top: -26, width: 60, height: 60, borderRadius: '50%', border: `3px solid ${C.confGlow}`, opacity: 1 - press, transform: `scale(${0.4 + press})`}} />}
  </div>
);

/** Corner brackets drawn just outside a rectangle. */
const Brackets: React.FC<{x: number; y: number; w: number; h: number; c: string; o: number; gap?: number}> = ({x, y, w, h, c, o, gap = 18}) => {
  const L = 46;
  const s = {position: 'absolute' as const, borderColor: c, borderStyle: 'solid', width: L, height: L, opacity: o};
  return (
    <>
      <div style={{...s, left: x - gap, top: y - gap, borderWidth: '5px 0 0 5px', borderTopLeftRadius: 14}} />
      <div style={{...s, left: x + w + gap - L, top: y - gap, borderWidth: '5px 5px 0 0', borderTopRightRadius: 14}} />
      <div style={{...s, left: x - gap, top: y + h + gap - L, borderWidth: '0 0 5px 5px', borderBottomLeftRadius: 14}} />
      <div style={{...s, left: x + w + gap - L, top: y + h + gap - L, borderWidth: '0 5px 5px 0', borderBottomRightRadius: 14}} />
    </>
  );
};

const Chip: React.FC<{x: number; y: number; c: string; o: number; icon?: React.ReactNode; children: React.ReactNode; size?: number}> = ({x, y, c, o, icon, children, size = 24}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, 0) translateY(${(1 - o) * 12}px)`, opacity: o, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 40, background: `${c}1F`, border: `2px solid ${c}`, fontFamily: fonts.body, fontWeight: 700, fontSize: size, color: C.text, whiteSpace: 'nowrap'}}>
    {icon}
    {children}
  </div>
);

// ---- the stage ------------------------------------------------------------------
export const Stage: React.FC = () => {
  const t = useT();
  const cam = camAt(t, camKeys(), CAM0);
  const worldOpacity = Math.min(
    1 - 0.62 * p(t, Q.recap, 1.2, ease.inOut) + 0.62 * p(t, Q.demo - 0.4, 0.6, ease.inOut),
    1 - p(t, Q.final1 - 0.6, 0.9, ease.inOut),
  );

  // S1 / S2 : git graph and package
  const gitO = p(t, Q.team - 0.2, 0.8) * (1 - p(t, Q.deploy - 0.7, 0.9, ease.inOut));
  const outDraw = p(t, Q.team, 0.9, ease.inOut);
  const branchRun = p(t, Q.build - 0.2, 1.0, ease.inOut);
  const inDraw = p(t, Q.merge - 0.3, 0.7, ease.inOut);
  const cardBuild = p(t, Q.build, 1.6, ease.out);
  const cardTravel = p(t, Q.merge + 0.1, 1.5, ease.inOut);
  const merged = cardTravel >= 1;
  const pkgFly = p(t, Q.deploy - 0.4, 1.6, ease.inOut);
  const landed = p(t, Q.deploy + 1.2, 0.01) >= 1;
  const pkg = {x: lerp(PKG.x, BOX.x, pkgFly), y: lerp(PKG.y, BOX.y, pkgFly) - Math.sin(pkgFly * Math.PI) * 70, s: lerp(PKG.s, 1, pkgFly)};
  const pkgO = p(t, Q.team + 0.3, 0.8);
  const junction = p(t, Q.flagWired, 0.7, ease.back);
  const tagO = p(t, Q.flagName, 0.6);
  const v1Exit = p(t, Q.deploy - 0.6, 1.0, ease.inOut);
  const devO = p(t, Q.team, 0.6) * (1 - p(t, Q.deploy - 0.6, 0.7));
  const devFocus = env(t, Q.devs - 0.2, Q.flagName + 1.4, 0.4, 0.6);

  // flag + evaluation state
  const sw = switchK(t);
  const mem = memValue(t);
  const scr = screenAt(t);
  const lit = (() => {
    // which lane carries what the user sees
    const toNew = scr.under === 'new' ? 1 - scr.k : scr.k;
    const serving = 1 - env(t, Q.deploy - 0.5, Q.deploy + 1.3, 0.4, 0.5);
    return {a: (1 - toNew) * serving, b: toNew * serving};
  })();

  // LaunchDarkly reveal
  const ldIn = p(t, Q.reveal, 1.5, ease.out);
  const linkDraw = p(t, Q.outside - 0.2, 0.9, ease.inOut);
  const headO = p(t, Q.reveal + 0.8, 0.8) * (1 - p(t, Q.recap, 0.6));
  const ownerO = p(t, Q.owner - 0.3, 0.6);

  // cursor (owner) : approach then click for both flips (main story only)
  const clicks = [Q.toggleOn, Q.toggleOff];
  const approach = [Q.owner + 0.1, Q.problem];
  let cursor: {x: number; y: number; press: number; o: number} | null = null;
  clicks.forEach((ct, i) => {
    const a = approach[i];
    if (t >= a - 0.3 && t <= ct + 1.0) {
      const u = map(t, [a, ct - 0.1], [0, 1], ease.inOut);
      const sx = LD.x + 140;
      const sy = LD.y + 470;
      const tx = LD.x + LD_SWITCH.x + 20;
      const ty = LD.y + LD_SWITCH.y + 6;
      cursor = {x: lerp(sx, tx, u) + Math.sin(u * Math.PI) * -30, y: lerp(sy, ty, u), press: t >= ct ? Math.min(1, (t - ct) / 0.4) : 0, o: fadeIO(t, a - 0.3, ct + 0.5, 0.3, 0.4)};
    }
  });

  // configuration packet in flight
  const trip = TRIPS.find((tr) => t >= tr.t0 - 0.05 && t <= tr.t1 + 0.4);
  const arrival = TRIPS.map((tr) => (t >= tr.t1 && t <= tr.t1 + 0.9 ? (t - tr.t1) / 0.9 : -1)).find((x) => x >= 0) ?? -1;

  // evaluation in progress
  const ev = EVALS.find((e) => t >= e.tap - 0.05 && t <= e.show + 2.4);
  const evalO = ev ? fadeIO(t, ev.ev - 0.05, ev.show + (ev.fast ? 0.3 : 1.2), 0.15, 0.5) : 0;

  // S2 / S3 / S4 overlays
  const bothO = fadeIO(t, Q.bothDash - 0.1, Q.bothDash + 1.8, 0.3, 0.5);
  const sleepO = fadeIO(t, Q.asleep - 0.4, Q.reveal + 1.4, 0.5, 0.6);
  const offPulse = env(t, Q.flagOff - 0.1, Q.flagOff + 1.2, 0.2, 0.6);
  const unchangedO = fadeIO(t, Q.unchanged - 0.1, Q.bug - 0.2, 0.4, 0.5);
  const configGlow = env(t, Q.onlyConfig - 0.2, Q.bug - 0.3, 0.3, 0.5);
  const bugO = p(t, Q.bug, 0.5, ease.back) * (1 - p(t, Q.backOld, 0.4));
  const sameO = fadeIO(t, Q.sameVersion - 0.1, Q.recap + 0.2, 0.4, 0.6);
  const prodO = p(t, Q.bankApp + 1.2, 0.8) * (1 - p(t, Q.recap, 0.8)) * (1 - Math.max(fadeIO(t, Q.unchanged - 0.1, Q.bug - 0.2, 0.4, 0.5), fadeIO(t, Q.sameVersion - 0.1, Q.recap + 0.2, 0.4, 0.6)));
  const stageIn = p(t, Q.bankApp + 0.6, 1.0); // the opening is a close-up of the phone only
  const landPulse = env(t, Q.deploy + 1.15, Q.deploy + 1.5, 0.08, 0.9);

  const boxRect = {x: BOX.x, y: BOX.y, w: BOX_W, h: BOX_H};
  const tagX = pkg.x + TAG.dx * pkg.s;
  const tagY = pkg.y + TAG.dy * pkg.s;

  return (
    <AbsoluteFill style={{opacity: worldOpacity}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${960 - cam.cx * cam.s}px, ${540 - cam.cy * cam.s}px) scale(${cam.s})`}}>
        {/* column headers */}
        <div style={{opacity: headO}}>
          {[
            {x: LD.x + 235, label: 'CONFIGURATION', c: C.conf},
            {x: BOX.x + BOX_W / 2, label: 'LOGICIEL DÉPLOYÉ', c: C.soft},
            {x: PHONE.x + PHONE_W / 2, label: 'CE QUE VOIT LE CLIENT', c: C.beh},
          ].map((h) => (
            <div key={h.label} style={{position: 'absolute', left: h.x, top: 150, transform: 'translateX(-50%)', fontFamily: fonts.body, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: h.c, whiteSpace: 'nowrap'}}>{h.label}</div>
          ))}
        </div>

        {/* production platform */}
        <div style={{opacity: prodO}}>
          <div style={{position: 'absolute', left: BOX.x - 50, top: BOX.y + BOX_H + 6, width: BOX_W + 100, height: 40, borderRadius: '50%', background: `radial-gradient(closest-side, ${C.soft}${landPulse > 0 ? '66' : '33'}, ${C.soft}00)`, transform: `scale(${1 + 0.15 * landPulse})`}} />
          <div style={{position: 'absolute', left: BOX.x + BOX_W / 2, top: BOX.y + BOX_H + 44, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: fonts.body, fontSize: 22, fontWeight: 700, letterSpacing: 2, color: C.softGlow}}>
            {Icon.server(26, C.softGlow)} PRODUCTION
          </div>
        </div>

        {/* lanes software -> user */}
        <div style={{opacity: stageIn}}>
          <Lane b={LANE_A} lit={lit.a} t={t} />
          <Lane b={LANE_B} lit={lit.b * (merged && landed ? 1 : 0)} t={t} />
        </div>

        {/* git graph */}
        <div style={{opacity: gitO}}>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <line x1={-20} y1={MAIN_Y} x2={392} y2={MAIN_Y} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
            <path d={bezPath(BRANCH_OUT)} stroke={C.beh} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${outDraw} 1`} />
            <line x1={130} y1={440} x2={130 + 160 * branchRun} y2={440} stroke={C.beh} strokeWidth={7} strokeLinecap="round" opacity={branchRun > 0 ? 1 : 0} />
            <path d={bezPath(BRANCH_IN)} stroke={C.beh} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${inDraw} 1`} opacity={inDraw > 0 ? 1 : 0} />
            {[175, 255].map((x) => (
              <circle key={x} cx={x} cy={MAIN_Y} r={11} fill={C.bg0} stroke={C.soft} strokeWidth={5} />
            ))}
            {inDraw >= 1 && <circle cx={372} cy={MAIN_Y} r={13 + 6 * env(t, Q.merge + 0.4, Q.merge + 1.2, 0.1, 0.6)} fill={C.soft} />}
          </svg>
          <Label size={20} color={C.sub} weight={600} style={{position: 'absolute', left: 20, top: MAIN_Y + 22}}>Branche principale</Label>
          <Label size={18} color={C.beh} weight={600} style={{position: 'absolute', left: 140, top: 452, opacity: outDraw}}>Nouvelle branche</Label>
        </div>

        {/* development team */}
        <div style={{opacity: devO}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: 110 + i * 78, top: 252 - devFocus * 14, transform: `scale(${p(t, Q.team + i * 0.12, 0.5, ease.back)})`}}>
              <Avatar size={68} color={C.soft} tone={['#F2C6A0', '#8D5B3E', '#E8B48C'][i]} />
            </div>
          ))}
          <Label size={20} color={C.softGlow} weight={600} style={{position: 'absolute', left: 112, top: 214 - devFocus * 14}}>Développeurs</Label>
        </div>

        {/* new dashboard module being built on the branch, then merged */}
        {cardBuild > 0 && !merged && (() => {
          const pos = bez(CARD_PATH, cardTravel);
          const s = lerp(0.75, PKG.s, cardTravel);
          return (
            <div style={{position: 'absolute', left: pos.x, top: pos.y, transform: `translate(-50%, -50%) scale(${s * (0.6 + 0.4 * cardBuild)})`, opacity: Math.min(1, cardBuild * 1.5) * gitO}}>
              <div style={{width: BOX_W - ROW_X - 26, height: 84, borderRadius: 14, background: C.panelHi, border: `2px solid ${C.beh}`, boxShadow: `0 0 30px ${C.beh}55`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 14px', boxSizing: 'border-box'}}>
                <div style={{clipPath: `inset(0 ${100 - cardBuild * 100}% 0 0)`}}>
                  <Thumb kind="new" w={96} />
                </div>
                <div style={{fontFamily: fonts.body, fontSize: 21, fontWeight: 600, color: C.text, lineHeight: 1.2, opacity: p(t, Q.build + 0.6, 0.6)}}>Nouveau tableau de bord</div>
              </div>
            </div>
          );
        })()}

        {/* version 1.0 currently in production (replaced at deployment) */}
        {v1Exit < 1 && (
          <div style={{position: 'absolute', left: BOX.x, top: BOX.y + 90 * v1Exit, opacity: (1 - v1Exit) * stageIn, transform: `scale(${1 - 0.1 * v1Exit})`}}>
            <AppBox version="1.0" newIn={0} junction={0} />
          </div>
        )}

        {/* the software package (version 2.0 after the merge), deployed into production */}
        <div style={{position: 'absolute', left: pkg.x, top: pkg.y, transformOrigin: '0 0', transform: `scale(${pkg.s})`, opacity: pkgO}}>
          <AppBox version={merged ? '2.0' : '1.0'} newIn={merged ? 1 : 0} junction={junction} />
          {/* in-box highlights (S1 / S2 only; nothing is drawn over the box once the flag starts changing) */}
          <div style={{position: 'absolute', left: 0, top: 0, width: BOX_W, height: BOX_H, borderRadius: 26, boxShadow: `inset 0 0 0 6px ${C.softGlow}`, opacity: env(t, Q.inSoftware - 0.2, Q.inSoftware + 1.4, 0.2, 0.8)}} />
          {[ROW_A_Y, ROW_B_Y].map((y) => (
            <div key={y} style={{position: 'absolute', left: ROW_X - 6, top: y - 48, width: BOX_W - ROW_X - 14, height: 96, borderRadius: 18, border: `4px solid ${C.softGlow}`, opacity: bothO}} />
          ))}
          <div style={{position: 'absolute', left: JUNCTION.x - 36, top: JUNCTION.y - 36, width: 72, height: 72, borderRadius: '50%', border: `4px solid ${C.softGlow}`, opacity: env(t, Q.flagWired + 0.2, Q.flagWired + 1.6, 0.2, 0.6), transform: `scale(${1 + 0.4 * p(t, Q.flagWired + 0.2, 1.2)})`}} />
          {sleepO > 0 && (
            <div style={{position: 'absolute', left: ROW_X - 2, top: ROW_B_Y - 44, width: BOX_W - ROW_X - 22, height: 88, borderRadius: 15, background: `rgba(6,11,24,${0.62 * sleepO})`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 18, boxSizing: 'border-box', gap: 6}}>
              <div style={{opacity: sleepO, display: 'flex', alignItems: 'center', gap: 4}}>
                {Icon.moon(30, C.sub)}
                <span style={{fontFamily: fonts.head, fontSize: 24, fontWeight: 700, color: C.sub, transform: `translateY(${-6 * Math.sin(t * 2)}px)`}}>z</span>
                <span style={{fontFamily: fonts.head, fontSize: 18, fontWeight: 700, color: C.sub, transform: `translateY(${-8 * Math.sin(t * 2 + 1)}px)`}}>z</span>
              </div>
            </div>
          )}
        </div>

        {/* memory tag: the flag value the application currently holds (outside the software box) */}
        <div style={{position: 'absolute', left: tagX, top: tagY, transformOrigin: '0 0', transform: `scale(${pkg.s})`, opacity: tagO}}>
          <div style={{position: 'absolute', left: TAG.w / 2 - 2, top: TAG.h, width: 4, height: -TAG.dy - TAG.h, background: C.conf, opacity: 0.7}} />
          <div style={{width: TAG.w, height: TAG.h, borderRadius: 16, background: '#16123A', border: `3px solid ${C.conf}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', boxSizing: 'border-box', boxShadow: `0 0 ${4 + 10 * Math.max(configGlow, arrival >= 0 ? 1 - arrival : 0)}px ${C.conf}${arrival >= 0 || configGlow > 0 ? 'CC' : '44'}`, outline: `${Math.round(3 * Math.max(configGlow, arrival >= 0 ? 1 - arrival : 0))}px solid ${C.confGlow}`}}>
            {Icon.memory(28, C.conf)}
            <span style={{fontFamily: fonts.body, fontSize: 22, fontWeight: 600, color: C.sub, whiteSpace: 'nowrap'}}>En mémoire</span>
            <span style={{marginLeft: 'auto', fontFamily: fonts.body, fontSize: 22, fontWeight: 800, whiteSpace: 'nowrap', color: mem ? '#1A0F45' : C.text, background: mem ? C.confGlow : mix(C.off, C.bug, offPulse * 0), borderRadius: 20, padding: '4px 14px', transform: `scale(${1 + 0.12 * offPulse + (arrival >= 0 ? 0.15 * Math.sin(Math.min(1, arrival * 1.4) * Math.PI) : 0)})`}}>
              Flag : {mem ? 'activé' : 'désactivé'}
            </span>
          </div>
        </div>

        {/* evaluation inside the application (transient overlay, faded out before any comparison point) */}
        {ev && evalO > 0 && (() => {
          const u = map(t, [ev.ev, ev.ev + (ev.fast ? 0.2 : 0.5)], [0, 1], ease.inOut);
          const from = {x: BOX.x + TAG.dx + TAG.w / 2, y: BOX.y + TAG.dy + TAG.h};
          const to = {x: BOX.x + JUNCTION.x, y: BOX.y + JUNCTION.y};
          const route = map(t, [ev.ev + (ev.fast ? 0.15 : 0.45), ev.ev + (ev.fast ? 0.35 : 0.9)], [0, 1], ease.inOut);
          const rowY = ev.v ? ROW_B_Y : ROW_A_Y;
          const ring = p(t, ev.ev + (ev.fast ? 0.1 : 0.35), 0.8);
          return (
            <div style={{opacity: evalO}}>
              <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
                <path d={`M${from.x},${from.y} C${from.x},${from.y + 120} ${to.x + 80},${to.y - 100} ${to.x},${to.y}`} stroke={C.conf} strokeWidth={4} strokeDasharray="6 8" fill="none" opacity={0.8} />
                <g transform={`translate(${BOX.x},${BOX.y})`}>
                  <path d={FROM_JUNCTION(rowY)} stroke={C.beh} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${route} 1`} />
                </g>
              </svg>
              {u < 1 && (() => {
                const q = bez([from, {x: from.x, y: from.y + 120}, {x: to.x + 80, y: to.y - 100}, to], u);
                return <Dot x={q.x} y={q.y} c={C.conf} r={10} />;
              })()}
              <div style={{position: 'absolute', left: to.x - 34, top: to.y - 34, width: 68, height: 68, borderRadius: '50%', border: `5px solid ${C.confGlow}`, opacity: ring > 0 ? 1 - ring : 0, transform: `scale(${0.7 + ring * 1.2})`}} />
              <div style={{position: 'absolute', left: BOX.x + ROW_X - 6, top: BOX.y + rowY - 48, width: BOX_W - ROW_X - 14, height: 96, borderRadius: 18, border: `5px solid ${C.beh}`, boxShadow: `0 0 30px ${C.beh}88`, opacity: route}} />
            </div>
          );
        })()}

        {/* request from the phone and response to it */}
        {ev && (() => {
          const reqU = map(t, [ev.tap + 0.1, ev.tap + (ev.fast ? 0.3 : 0.7)], [0, 1], ease.inOut);
          const resU = map(t, [ev.show - (ev.fast ? 0.3 : 0.55), ev.show], [0, 1], ease.inOut);
          const req = bez(rev(LANE_A), reqU);
          const res = bez(ev.v ? LANE_B : LANE_A, resU);
          return (
            <>
              {reqU > 0 && reqU < 1 && <Dot x={req.x} y={req.y} c={C.softGlow} r={8} />}
              {resU > 0 && resU < 1 && <Dot x={res.x} y={res.y} c={C.beh} r={11} />}
            </>
          );
        })()}

        {/* LaunchDarkly, outside the application */}
        <div style={{position: 'absolute', left: lerp(-560, LD.x, ldIn), top: LD.y, opacity: ldIn}}>
          <LDPanel k={sw} owner={ownerO} />
          <div style={{position: 'absolute', left: LD_SWITCH.x - 64, top: LD_SWITCH.y - 44, width: 128, height: 88, borderRadius: 44, boxShadow: `0 0 50px ${C.conf}`, opacity: configGlow * 0.9}} />
        </div>

        {/* the configuration link LaunchDarkly -> application, and the packet travelling on it */}
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: linkDraw * ldIn * (1 - 0.0 * configGlow)}}>
          <path d={bezPath(LINK)} stroke={C.conf} strokeWidth={configGlow > 0 ? 7 : 5} fill="none" strokeLinecap="round" strokeDasharray="2 12" opacity={0.55 + 0.45 * configGlow} />
        </svg>
        {trip && (() => {
          const u = map(t, [trip.t0, trip.t1], [0, 1], ease.inOut);
          const q = bez(LINK, u);
          const o = fadeIO(t, trip.t0 - 0.05, trip.t1, 0.12, 0.25);
          const tail = [0.06, 0.12, 0.18].map((d) => bez(LINK, Math.max(0, u - d)));
          return (
            <>
              {tail.map((tq, i) => <Dot key={i} x={tq.x} y={tq.y} c={C.conf} r={7 - i * 2} o={o * (0.5 - i * 0.14)} />)}
              <div style={{position: 'absolute', left: q.x - 30, top: q.y - 22, width: 60, height: 44, borderRadius: 14, background: C.conf, boxShadow: `0 0 30px ${C.conf}, 0 0 60px ${C.conf}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o}}>
                {Icon.sliders(28, '#1A0F45')}
              </div>
            </>
          );
        })()}

        {/* the user's screen */}
        <div style={{position: 'absolute', left: PHONE.x, top: PHONE.y}}>
          <div style={{position: 'absolute', inset: -14, borderRadius: 60, boxShadow: `0 0 70px ${C.bug}`, opacity: bugO * 0.8}} />
          <Phone
            under={scr.under}
            k={scr.k}
            refresh={ev ? Math.max(0, env(t, ev.tap + 0.15, ev.show - 0.1, 0.25, 0.2)) : 0}
            tap={ev ? (t - ev.tap) / 0.6 : -1}
            bug={bugO}
            angle={t * 400}
          />
          <div style={{position: 'absolute', left: PHONE_W / 2, top: PHONE_H + 26, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 14, opacity: p(t, Q.bankApp + 1.4, 0.8) * (1 - p(t, Q.recap, 0.6))}}>
            <Avatar size={64} color={C.beh} tone="#E0AC86" />
            <Label size={24} color={C.text}>Client</Label>
          </div>
        </div>

        {/* S3 : the deployed software did not change */}
        <Brackets {...boxRect} c={C.softGlow} o={unchangedO} gap={22} />
        <Chip x={BOX.x + BOX_W / 2} y={BOX.y + BOX_H + 40} c={C.soft} o={unchangedO} icon={Icon.check(28, C.softGlow)}>
          Version 2.0 · inchangée
        </Chip>
        <Chip x={BOX.x + BOX_W / 2} y={BOX.y + BOX_H + 40} c={C.soft} o={sameO} icon={Icon.check(28, C.softGlow)}>
          Même version · aucun redéploiement
        </Chip>

        {/* cursor of the product owner */}
        {cursor && <Cursor {...(cursor as {x: number; y: number; press: number; o: number})} />}
      </div>

      {/* central message caption (screen space) */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 44, display: 'flex', justifyContent: 'center', opacity: fadeIO(t, Q.unchanged + 0.4, Q.bug - 0.1, 0.5, 0.5)}}>
        <div style={{fontFamily: fonts.head, fontSize: 40, fontWeight: 700, color: C.text, padding: '14px 34px', borderRadius: 18, background: '#0B1430E6', border: `2px solid ${C.line}`}}>
          On change la <span style={{color: C.confGlow}}>configuration</span>, pas le <span style={{color: C.softGlow}}>logiciel</span>.
        </div>
      </div>
    </AbsoluteFill>
  );
};
