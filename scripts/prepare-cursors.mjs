import {mkdir, writeFile} from 'node:fs/promises';

// Original two-pixel grid. The tip stays at (2, 2) in all interaction states.
const rows = [
  'K...........',
  'KK..........',
  'KWK.........',
  'KWWK........',
  'KWWWK.......',
  'KWWWWK......',
  'KWWWWWK.....',
  'KWWWWWWK....',
  'KWWWWWWWK...',
  'KWWWWWKKKK..',
  'KWWWKWK.....',
  'KWWK.KWK....',
  'KWK..KWK....',
  'KK....KWK...',
  'K.....KWK...',
  '.......KK...',
];
// One neutral fill throughout, with a dark outline for light backgrounds.
const colors = {K:'#101114',W:'#f1f0eb'};
const directory = new URL('../public/cursors/', import.meta.url);
await mkdir(directory, {recursive:true});
for (const name of ['default', 'link', 'pressed']) {
  const cells = rows.flatMap((row,y)=>[...row].flatMap((cell,x)=>cell==='.'?[]:[`<rect x="${x*2+2}" y="${y*2+2}" width="2" height="2" fill="${colors[cell]}"/>`])).join('');
  await writeFile(new URL(`pixel-${name}.svg`,directory), `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36" shape-rendering="crispEdges">${cells}</svg>\n`);
}
console.log('Generated three pixel cursor states.');
