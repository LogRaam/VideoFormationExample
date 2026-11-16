// Render still frames for visual QA: node stills.mjs <outDir> <time-in-seconds>...
// FORMAT=png SCALE=1 for lossless full-size frames (pixel comparisons).
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...times] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: process.env.COMP ?? 'Main'});
for (const ts of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(ts) * composition.fps));
  const fmt = process.env.FORMAT ?? 'jpeg';
  const output = path.join(outDir, `t${String(ts).padStart(6, '0')}.${fmt === 'png' ? 'png' : 'jpg'}`);
  await renderStill({composition, serveUrl, output, frame, imageFormat: fmt, ...(fmt === 'png' ? {} : {jpegQuality: 85}), scale: parseFloat(process.env.SCALE ?? '0.5')});
  console.log(output);
}
