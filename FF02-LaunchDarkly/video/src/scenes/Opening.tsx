import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, fonts} from '../theme';
import {Q} from '../lib/cues';
import {ease, p} from '../lib/anim';
import {useT} from '../lib/time';

/** Series title over the opening close-up of the phone (screen space). */
export const Opening: React.FC = () => {
  const t = useT();
  const o = p(t, 0.25, 0.9) * (1 - p(t, Q.bankApp + 0.9, 0.7, ease.inOut));
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 140, top: 380, transform: `translateY(${(1 - p(t, 0.25, 1.2)) * 20}px)`}}>
        <div style={{fontFamily: fonts.body, fontSize: 24, fontWeight: 700, letterSpacing: 4, color: C.sub}}>PARCOURS FEATURE FLAGS</div>
        <div style={{fontFamily: fonts.head, fontSize: 76, fontWeight: 700, color: C.text, lineHeight: 1.05, marginTop: 18}}>
          Déployer,
          <br />
          puis <span style={{color: C.confGlow}}>activer</span>
        </div>
        <div style={{fontFamily: fonts.body, fontSize: 26, fontWeight: 500, color: C.sub, marginTop: 22}}>Les feature flags avec LaunchDarkly</div>
      </div>
    </AbsoluteFill>
  );
};
