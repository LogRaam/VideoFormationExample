import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {Animatic} from './Animatic';
import {FPS, H, W} from './theme';
import {TL} from './lib/time';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={Math.ceil(TL.duration * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Animatic" component={Animatic} durationInFrames={Math.ceil(TL.duration * FPS)} fps={FPS} width={W} height={H} />
  </>
);
