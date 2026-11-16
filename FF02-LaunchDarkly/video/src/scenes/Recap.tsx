import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, fonts} from '../theme';
import {Q} from '../lib/cues';
import {ease, p} from '../lib/anim';
import {useT} from '../lib/time';
import {Icon} from '../components/ui';

/**
 * S5: the two-line mental model above the (shrunken, same) stage, then the
 * closing statement. Screen-space overlay.
 */
const Pill: React.FC<{c: string; c2?: string; at: number; t: number; children: React.ReactNode}> = ({c, c2, at, t, children}) => {
  const k = p(t, at, 0.6, ease.back);
  const lit = p(t, at, 0.3);
  return (
    <div style={{opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 24}px) scale(${0.85 + 0.15 * k})`, padding: '14px 26px', borderRadius: 40, fontFamily: fonts.head, fontSize: 34, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', background: c2 ? `linear-gradient(90deg, ${c}38, ${c2}38)` : `${c}30`, border: `3px solid ${c}`, borderRightColor: c2 ?? c, boxShadow: `0 0 ${30 * lit}px ${c}44`}}>
      {children}
    </div>
  );
};

const Arrow: React.FC<{at: number; t: number; c: string}> = ({at, t, c}) => {
  const k = p(t, at - 0.15, 0.4);
  return (
    <svg width={56} height={30} viewBox="0 0 56 30" style={{opacity: k, flexShrink: 0}}>
      <path d={`M4 15 H${4 + 40 * k}`} stroke={c} strokeWidth={4} strokeLinecap="round" />
      <path d="M38 6 L50 15 L38 24" stroke={c} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={k > 0.9 ? 1 : 0} />
    </svg>
  );
};

const RowLabel: React.FC<{c: string; icon: React.ReactNode; children: React.ReactNode; o: number}> = ({c, icon, children, o}) => (
  <div style={{width: 210, display: 'flex', alignItems: 'center', gap: 12, opacity: o, flexShrink: 0}}>
    {icon}
    <span style={{fontFamily: fonts.body, fontSize: 22, fontWeight: 700, letterSpacing: 2.5, color: c}}>{children}</span>
  </div>
);

export const Recap: React.FC = () => {
  const t = useT();
  if (t < Q.recap - 0.1) return null;
  const linesO = 1 - p(t, Q.final1 - 0.6, 0.8, ease.inOut);
  const titleO = p(t, Q.recap + 0.6, 0.7) * linesO;
  const f1 = p(t, Q.final1 - 0.1, 0.8);
  const f2 = p(t, Q.final2 - 0.3, 0.8);
  const endFade = 1 - p(t, Q.end - 1.2, 1.1, ease.inOut);
  return (
    <AbsoluteFill style={{opacity: endFade}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: fonts.body, fontSize: 24, fontWeight: 700, letterSpacing: 4, color: C.sub, opacity: titleO}}>DEUX ÉTAPES DISTINCTES</div>
      <div style={{position: 'absolute', left: '50%', top: 150, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: 44, opacity: linesO}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <RowLabel c={C.softGlow} icon={Icon.rocket(34, C.soft)} o={p(t, Q.develop - 0.4, 0.5)}>LIVRER</RowLabel>
          <Pill c={C.soft} at={Q.develop} t={t}>Développer</Pill>
          <Arrow c={C.soft} at={Q.mergeR} t={t} />
          <Pill c={C.soft} at={Q.mergeR} t={t}>Fusionner</Pill>
          <Arrow c={C.soft} at={Q.deployR} t={t} />
          <Pill c={C.soft} at={Q.deployR} t={t}>Déployer</Pill>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <RowLabel c={C.confGlow} icon={Icon.sliders(34, C.conf)} o={p(t, Q.configure - 0.4, 0.5)}>ACTIVER</RowLabel>
          <Pill c={C.conf} at={Q.configure} t={t}>Configurer dans LaunchDarkly</Pill>
          <Arrow c={C.conf} at={Q.evaluateR} t={t} />
          <Pill c={C.conf} c2={C.beh} at={Q.evaluateR} t={t}>Évaluer</Pill>
          <Arrow c={C.beh} at={Q.choose} t={t} />
          <Pill c={C.beh} at={Q.choose} t={t}>Choisir le comportement</Pill>
        </div>
      </div>

      {/* closing statement */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 30, opacity: f1, transform: `translateY(${(1 - f1) * 30}px)`}}>
          <div style={{width: 96, height: 96, borderRadius: 26, background: `${C.soft}22`, border: `3px solid ${C.soft}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{Icon.server(54, C.soft)}</div>
          <div style={{fontFamily: fonts.head, fontSize: 62, fontWeight: 700, color: C.text, lineHeight: 1.15}}>
            Le <span style={{color: C.softGlow}}>déploiement</span> met la fonctionnalité
            <br />
            dans l'application.
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 30, opacity: f2, transform: `translateY(${(1 - f2) * 30}px)`}}>
          <div style={{width: 96, height: 96, borderRadius: 26, background: `${C.conf}22`, border: `3px solid ${C.conf}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{Icon.flag(54, C.conf)}</div>
          <div style={{fontFamily: fonts.head, fontSize: 62, fontWeight: 700, color: C.text, lineHeight: 1.15}}>
            Le <span style={{color: C.confGlow}}>feature flag</span> permet de
            <br />
            <span style={{color: C.text, borderBottom: `5px solid ${C.conf}`, paddingBottom: 2}}>contrôler son activation</span>.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
