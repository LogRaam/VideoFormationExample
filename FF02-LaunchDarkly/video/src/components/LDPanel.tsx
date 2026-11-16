import React from 'react';
import {C, fonts} from '../theme';
import {Avatar, Icon, Switch} from './ui';

export const LD_W = 470;
export const LD_H = 560;
/** Where the flag switch sits inside the panel (for the cursor and the link). */
export const LD_SWITCH = {x: 352, y: 236};

/**
 * LaunchDarkly as an external control panel: it holds the flag's configuration,
 * never the application's code. Neutral drawing, no product logo.
 */
export const LDPanel: React.FC<{k: number; owner: number}> = ({k, owner}) => (
  <div style={{width: LD_W, height: LD_H, borderRadius: 26, background: `linear-gradient(180deg, #171338 0%, #100D28 100%)`, border: `3px solid ${C.conf}`, boxShadow: `0 30px 80px #000A, 0 0 60px ${C.conf}22`, position: 'relative', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 28, top: 26, display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{width: 52, height: 52, borderRadius: 14, background: `${C.conf}26`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{Icon.sliders(32, C.conf)}</div>
      <div>
        <div style={{fontFamily: fonts.head, fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1.1}}>LaunchDarkly</div>
        <div style={{fontFamily: fonts.body, fontSize: 18, color: C.sub, marginTop: 6}}>Configuration des flags</div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 26, right: 26, top: 128, height: 2, background: '#2E2860'}} />
    <div style={{position: 'absolute', left: 24, right: 24, top: 170, height: 132, borderRadius: 18, background: '#1F1A48', border: `2px solid ${k > 0.5 ? C.conf : '#3A3370'}`, padding: '0 22px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16}}>
      {Icon.flag(34, k > 0.5 ? C.confGlow : C.dim)}
      <div style={{flex: 1}}>
        <div style={{fontFamily: fonts.body, fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.2}}>Nouveau tableau<br />de bord</div>
        <div style={{fontFamily: fonts.body, fontSize: 18, fontWeight: 600, color: k > 0.5 ? C.confGlow : C.dim, marginTop: 6}}>{k > 0.5 ? 'Activé' : 'Désactivé'}</div>
      </div>
      <Switch k={k} w={100} />
    </div>
    <div style={{position: 'absolute', left: 24, right: 24, bottom: 26, height: 150, borderRadius: 18, background: '#ffffff06', display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', opacity: owner, transform: `translateY(${(1 - owner) * 20}px)`}}>
      <Avatar size={92} color={C.conf} tone="#C99272" />
      <div style={{fontFamily: fonts.body, fontSize: 22, fontWeight: 600, color: C.text, lineHeight: 1.25}}>
        Responsable
        <br />
        <span style={{color: C.sub, fontWeight: 500}}>du produit</span>
      </div>
    </div>
  </div>
);
