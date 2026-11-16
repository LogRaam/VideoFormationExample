import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadGrotesk} from '@remotion/google-fonts/SpaceGrotesk';

export const fonts = {
  body: loadInter('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext']}).fontFamily,
  head: loadGrotesk('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']}).fontFamily,
};

/**
 * Design tokens. One colour per idea, constant for the whole film:
 *   software (code, versions, deployment) = blue,
 *   configuration (LaunchDarkly, flag value) = violet,
 *   behaviour (what the user sees, the chosen path) = teal,
 *   problem = coral.
 */
export const C = {
  bg0: '#060B18',
  bg1: '#0B1430',
  panel: '#0F1A36',
  panelHi: '#16244A',
  line: '#24345C',
  lineHi: '#36507F',
  text: '#EEF3FC',
  sub: '#A3B4D6',
  dim: '#62759C',
  soft: '#4FB3FF',
  softDeep: '#1E6FD6',
  softGlow: '#9BD3FF',
  conf: '#A78BFA',
  confDeep: '#6D4FE0',
  confGlow: '#D3C4FF',
  beh: '#2EE6C5',
  behDeep: '#0E9E8A',
  bug: '#FF5C7A',
  off: '#56637E',
  white: '#FFFFFF',
};

export const W = 1920;
export const H = 1080;
export const FPS = 30;
