import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const index = await readFile(path.join(root, 'index.html'), 'utf8');
if (!index.includes('Viking Chronology') && !index.includes('Пути северных мореходов')) {
  throw new Error('Production HTML does not contain the application signature.');
}
if (/\b(?:src|href)="\/(?!\/)/.test(index)) {
  throw new Error('Production HTML contains root-absolute asset paths incompatible with project Pages.');
}
const assets = await readdir(path.join(root, 'assets'));
if (!assets.some((name) => name.endsWith('.js'))) throw new Error('No JavaScript bundle found.');
if (!assets.some((name) => name.endsWith('.css'))) throw new Error('No CSS bundle found.');
let total = 0;
for (const name of assets) total += (await stat(path.join(root, 'assets', name))).size;
if (total > 2_400_000) throw new Error(`Production assets exceed 2.4 MB: ${total}`);
console.log(`Verified production bundle: ${assets.length} assets, ${total} bytes.`);
