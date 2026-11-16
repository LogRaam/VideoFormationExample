import React from 'react';
import {fonts} from '../theme';

/**
 * The two behaviours of the bank application, drawn at a native 300 x 600
 * phone-screen size. They are deliberately different at a glance:
 * the current one is a pale, text-only list; the new one is dark, with a
 * balance card, a chart and colourful shortcuts.
 */
export const SCREEN_W = 300;
export const SCREEN_H = 600;

const rows = [
  ['Compte chèques', '2 345,67 $'],
  ['Épargne', '12 890,00 $'],
  ['Carte de crédit', '− 430,12 $'],
  ['Placements', '8 120,55 $'],
  ['Prêt auto', '− 9 870,00 $'],
];

export const OldDashboard: React.FC = () => (
  <div style={{width: SCREEN_W, height: SCREEN_H, background: '#E9EDF3', fontFamily: fonts.body, color: '#27324A', overflow: 'hidden'}}>
    <div style={{height: 92, background: '#2C3E63', color: '#fff', padding: '44px 18px 0', fontSize: 19, fontWeight: 700, boxSizing: 'border-box'}}>Ma banque</div>
    <div style={{padding: '18px 18px 6px', fontSize: 15, fontWeight: 700, color: '#5B6782', letterSpacing: 1}}>MES COMPTES</div>
    {rows.map(([a, b], i) => (
      <div key={i} style={{margin: '0 14px', padding: '15px 6px', borderBottom: '1px solid #C9D0DC', display: 'flex', justifyContent: 'space-between', fontSize: 15}}>
        <span>{a}</span>
        <span style={{fontWeight: 600}}>{b}</span>
      </div>
    ))}
    <div style={{margin: '22px 14px 0', display: 'flex', gap: 8}}>
      {['Virer', 'Payer'].map((x) => (
        <div key={x} style={{flex: 1, border: '1px solid #9AA6BC', borderRadius: 4, padding: '10px 0', textAlign: 'center', fontSize: 14, color: '#2C3E63', background: '#F6F8FB'}}>{x}</div>
      ))}
    </div>
  </div>
);

export const NewDashboard: React.FC = () => {
  const pts = [38, 44, 40, 52, 49, 60, 58, 70, 66, 78];
  const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${10 + i * 25},${96 - v}`).join(' ');
  return (
    <div style={{width: SCREEN_W, height: SCREEN_H, background: 'linear-gradient(165deg, #10224A 0%, #0A1530 55%, #071022 100%)', fontFamily: fonts.body, color: '#fff', overflow: 'hidden', position: 'relative'}}>
      <div style={{position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, #2EE6C555 0%, #2EE6C500 70%)'}} />
      <div style={{padding: '46px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontSize: 20, fontWeight: 700}}>Bonjour !</div>
        <div style={{fontSize: 11, fontWeight: 700, color: '#062A24', background: '#2EE6C5', borderRadius: 20, padding: '4px 10px'}}>NOUVEAU</div>
      </div>
      <div style={{margin: '16px 16px 0', borderRadius: 18, padding: '16px 16px 8px', background: 'linear-gradient(135deg, #2EE6C5 0%, #4FB3FF 100%)', color: '#05213A', boxShadow: '0 10px 30px #2EE6C540'}}>
        <div style={{fontSize: 12, fontWeight: 600, opacity: 0.8}}>Avoir total</div>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: -0.5}}>23 926 $</div>
        <svg width={250} height={100} viewBox="0 0 250 100" style={{display: 'block'}}>
          <path d={`${path} L235,100 L10,100 Z`} fill="#05213A22" />
          <path d={path} fill="none" stroke="#05213A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{display: 'flex', gap: 10, margin: '16px 16px 0'}}>
        {[
          ['#A78BFA', 'Virer'],
          ['#FFB84D', 'Payer'],
          ['#5BE38B', 'Épargner'],
        ].map(([c, l]) => (
          <div key={l} style={{flex: 1, borderRadius: 14, background: '#ffffff10', padding: '12px 0 10px', textAlign: 'center'}}>
            <div style={{width: 30, height: 30, borderRadius: 10, background: c, margin: '0 auto 6px'}} />
            <div style={{fontSize: 12, fontWeight: 600}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{margin: '16px 16px 0', borderRadius: 16, background: '#ffffff0D', padding: 14, display: 'flex', alignItems: 'center', gap: 14}}>
        <svg width={70} height={70} viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#ffffff22" strokeWidth="6" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#2EE6C5" strokeWidth="6" strokeDasharray="55 45" strokeDashoffset="25" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#A78BFA" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="70" />
        </svg>
        <div>
          <div style={{fontSize: 13, fontWeight: 700}}>Dépenses du mois</div>
          <div style={{fontSize: 12, opacity: 0.7, marginTop: 4}}>Épicerie · Transport</div>
        </div>
      </div>
    </div>
  );
};

/** Miniature of a dashboard, used inside the software package. */
export const Thumb: React.FC<{kind: 'old' | 'new'; w: number}> = ({kind, w}) => {
  const s = w / SCREEN_W;
  return (
    <div style={{width: w, height: w * 0.62, overflow: 'hidden', borderRadius: 6, flexShrink: 0, position: 'relative'}}>
      <div style={{transform: `scale(${s})`, transformOrigin: 'top left', position: 'absolute', top: -20 * s}}>
        {kind === 'old' ? <OldDashboard /> : <NewDashboard />}
      </div>
    </div>
  );
};
