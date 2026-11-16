import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C} from '../theme';
import {rand} from '../lib/anim';
import {useT} from '../lib/time';

/** Global backdrop: deep gradient, slow light orbs (one per idea colour), dot grid, grain, vignette. */
export const Background: React.FC = () => {
  const t = useT();
  const orbs = [
    {c: C.softDeep, r: 1000, x: 0.5, y: 0.45, sx: 0.021, sy: 0.017, a: 0.22},
    {c: C.confDeep, r: 820, x: 0.12, y: 0.4, sx: 0.018, sy: 0.026, a: 0.16},
    {c: C.behDeep, r: 820, x: 0.88, y: 0.55, sx: 0.024, sy: 0.019, a: 0.14},
  ];
  const f = Math.floor(t * 24);
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 90% at 50% 40%, ${C.bg1} 0%, ${C.bg0} 70%)`, overflow: 'hidden'}}>
      {orbs.map((o, i) => {
        const x = (o.x + 0.05 * Math.sin(t * o.sx * 6.28 + i)) * 1920;
        const y = (o.y + 0.05 * Math.cos(t * o.sy * 6.28 + i * 2)) * 1080;
        return <div key={i} style={{position: 'absolute', left: x - o.r / 2, top: y - o.r / 2, width: o.r, height: o.r, borderRadius: '50%', background: `radial-gradient(circle, ${o.c} 0%, ${o.c}00 65%)`, opacity: o.a}} />;
      })}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, #A3B4D61C 1.4px, transparent 1.6px)`,
          backgroundSize: '44px 44px',
          backgroundPosition: `${(t * 3) % 44}px 0px`,
          maskImage: 'radial-gradient(85% 75% at 50% 50%, #000 25%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(85% 75% at 50% 50%, #000 25%, transparent 90%)',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(115% 90% at 50% 45%, #0000 55%, #0009 100%)'}} />
      <AbsoluteFill style={{overflow: 'hidden', mixBlendMode: 'overlay', opacity: 0.45}}>
        <div style={{position: 'absolute', left: -Math.floor(rand(f) * 512), top: -Math.floor(rand(f + 99) * 512), width: 1920 + 1024, height: 1080 + 1024, backgroundImage: `url(${staticFile('img/grain.png')})`, backgroundRepeat: 'repeat'}} />
        <Img src={staticFile('img/grain.png')} style={{display: 'none'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
