import React from 'react';
import {C, fonts} from '../theme';
import {NewDashboard, OldDashboard, SCREEN_H, SCREEN_W} from './Dashboards';
import {Icon} from './ui';

export const PHONE_W = SCREEN_W + 30;
export const PHONE_H = SCREEN_H + 40;

/**
 * The user's screen. `k` cross-slides from the current dashboard (0) to the new
 * one (1); `from` says which one is underneath. `refresh` (0..1..0) dims the
 * screen and shows a spinner while the page is being opened again. `tap` draws a
 * touch ripple; `bug` raises a problem banner over the new dashboard.
 */
export const Phone: React.FC<{under: 'old' | 'new'; k: number; refresh?: number; tap?: number; bug?: number; angle?: number}> = ({under, k, refresh = 0, tap = -1, bug = 0, angle = 0}) => {
  const Under = under === 'old' ? OldDashboard : NewDashboard;
  const Over = under === 'old' ? NewDashboard : OldDashboard;
  return (
    <div style={{width: PHONE_W, height: PHONE_H, borderRadius: 48, background: '#05080F', border: `3px solid #2A3550`, boxShadow: `0 40px 90px #000C, 0 0 0 8px #0B1120`, position: 'relative'}}>
      <div style={{position: 'absolute', left: 15, top: 20, width: SCREEN_W, height: SCREEN_H, borderRadius: 34, overflow: 'hidden', background: '#000'}}>
        <Under />
        {k > 0 && (
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - k) * 100}%)`, boxShadow: '0 -20px 40px #0008'}}>
            <Over />
          </div>
        )}
        {refresh > 0 && (
          <div style={{position: 'absolute', inset: 0, background: `rgba(6,11,24,${0.55 * refresh})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={64} height={64} viewBox="0 0 50 50" style={{opacity: refresh, transform: `rotate(${angle}deg)`}}>
              <circle cx="25" cy="25" r="18" stroke="#ffffff33" strokeWidth="5" fill="none" />
              <circle cx="25" cy="25" r="18" stroke={C.beh} strokeWidth="5" fill="none" strokeDasharray="30 100" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {bug > 0 && (
          <div style={{position: 'absolute', left: 14, right: 14, top: 300, borderRadius: 14, background: C.bug, color: '#fff', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: fonts.body, fontSize: 16, fontWeight: 700, opacity: bug, transform: `translateY(${(1 - bug) * 20}px) scale(${0.9 + 0.1 * bug})`, boxShadow: `0 10px 30px ${C.bug}88`}}>
            {Icon.bug(26, '#fff')}
            Solde erroné !
          </div>
        )}
        {tap >= 0 && tap <= 1 && (
          <div style={{position: 'absolute', left: SCREEN_W / 2 - 60, top: 250 - 60, width: 120, height: 120, borderRadius: '50%', border: `4px solid ${C.beh}`, transform: `scale(${0.3 + tap})`, opacity: 1 - tap}} />
        )}
      </div>
      <div style={{position: 'absolute', left: PHONE_W / 2 - 50, top: 28, width: 100, height: 26, borderRadius: 20, background: '#05080F'}} />
    </div>
  );
};
