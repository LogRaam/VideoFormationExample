import React from 'react';
import {C, fonts} from '../theme';
import {Thumb} from './Dashboards';
import {Icon} from './ui';
import layout from '../data/layout.json';

/** Native size of the software box and the anchor points other layers attach to. */
export const BOX_W = layout.box.w;
export const BOX_H = layout.box.h;
export const ROW_A_Y = 202;
export const ROW_B_Y = 334;
export const JUNCTION = {x: 62, y: 268};
export const ROW_X = 116;

type Props = {version: string; newIn: number; junction: number; newVisible?: number};

const Row: React.FC<{y: number; kind: 'old' | 'new'; label: string; opacity?: number; dx?: number}> = ({y, kind, label, opacity = 1, dx = 0}) => (
  <div style={{position: 'absolute', left: ROW_X + dx, top: y - 42, width: BOX_W - ROW_X - 26, height: 84, borderRadius: 14, background: C.panelHi, border: `2px solid ${C.lineHi}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 14px', boxSizing: 'border-box', opacity}}>
    <Thumb kind={kind} w={96} />
    <div style={{fontFamily: fonts.body, fontSize: 21, fontWeight: 600, color: C.text, lineHeight: 1.2, whiteSpace: 'normal'}}>{label}</div>
  </div>
);

/**
 * The software: one opaque package holding the possible behaviours.
 *
 * Its props describe only what is IN the software (version, which modules,
 * whether the developers wired the flag junction). Nothing about the flag value
 * or the user is passed in, so once deployed the box cannot change when the
 * configuration changes: the film's central claim is held by construction.
 */
export const AppBox: React.FC<Props> = ({version, newIn, junction, newVisible = 1}) => (
  <div style={{width: BOX_W, height: BOX_H, borderRadius: 26, background: `linear-gradient(180deg, ${C.panel} 0%, #0C1530 100%)`, border: `3px solid ${C.soft}`, boxShadow: `0 30px 80px #000A, 0 0 60px ${C.soft}22`, position: 'relative', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 28, top: 26, display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{width: 52, height: 52, borderRadius: 14, background: `${C.soft}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{Icon.server(32, C.soft)}</div>
      <div>
        <div style={{fontFamily: fonts.head, fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1.1}}>Application bancaire</div>
        <div style={{display: 'flex', gap: 10, alignItems: 'center', marginTop: 6}}>
          <span style={{fontFamily: fonts.body, fontSize: 18, color: C.sub}}>Logiciel</span>
          <span style={{fontFamily: fonts.body, fontSize: 17, fontWeight: 700, color: '#04203D', background: C.soft, borderRadius: 20, padding: '2px 12px'}}>Version {version}</span>
        </div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 26, right: 26, top: 128, height: 2, background: C.line}} />
    {junction > 0 && (
      <svg width={BOX_W} height={BOX_H} style={{position: 'absolute', left: 0, top: 0, opacity: junction}}>
        <path d={`M${JUNCTION.x + 22},${JUNCTION.y} C${JUNCTION.x + 40},${JUNCTION.y} ${JUNCTION.x + 22},${ROW_A_Y} ${ROW_X},${ROW_A_Y}`} stroke={C.lineHi} strokeWidth={4} fill="none" />
        <path d={`M${JUNCTION.x + 22},${JUNCTION.y} C${JUNCTION.x + 40},${JUNCTION.y} ${JUNCTION.x + 22},${ROW_B_Y} ${ROW_X},${ROW_B_Y}`} stroke={C.lineHi} strokeWidth={4} fill="none" />
      </svg>
    )}
    {junction > 0 && (
      <div style={{position: 'absolute', left: JUNCTION.x - 24, top: JUNCTION.y - 24, width: 48, height: 48, borderRadius: '50%', background: C.panelHi, border: `3px solid ${C.soft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${junction})`}}>
        {Icon.flag(24, C.softGlow)}
      </div>
    )}
    <Row y={ROW_A_Y} kind="old" label="Tableau de bord actuel" />
    {newIn > 0 && <Row y={ROW_B_Y} kind="new" label="Nouveau tableau de bord" opacity={newVisible} dx={(1 - newIn) * -40} />}
  </div>
);
