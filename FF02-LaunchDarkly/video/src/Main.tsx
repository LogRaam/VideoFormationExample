import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Background} from './components/Background';
import {Music} from './components/Music';
import {Sfx} from './components/Sfx';
import {Stage} from './scenes/Stage';
import {Opening} from './scenes/Opening';
import {Recap} from './scenes/Recap';
import {C} from './theme';

export const Main: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.bg0}}>
    <Background />
    <Stage />
    <Opening />
    <Recap />
    <Audio src={staticFile('audio/narration.fr.wav')} volume={1} />
    <Sfx />
    <Music />
  </AbsoluteFill>
);
