import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', dist), 'utf8');

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(html.includes('manifest.webmanifest'), 'manifest is not linked from dist/index.html');
assert(!/src="\/(?!\/)/.test(html), 'absolute script path detected; GitHub project Pages requires relative assets');
assert(!/href="\/(?!\/)/.test(html), 'absolute stylesheet path detected; GitHub project Pages requires relative assets');
assert(html.includes('./assets/') || html.includes('assets/'), 'compiled asset references are missing');

const assetsDir = new URL('assets/', dist);
const assets = await readdir(assetsDir);
assert(assets.some((name) => name.endsWith('.js')), 'no JavaScript bundle was emitted');
assert(assets.some((name) => name.endsWith('.css')), 'no CSS bundle was emitted');

let totalJs = 0;
for (const name of assets.filter((item) => item.endsWith('.js'))) {
  totalJs += (await stat(join(assetsDir.pathname, name))).size;
}
assert(totalJs < 1_800_000, `JavaScript budget exceeded: ${totalJs} bytes`);

const sourceCss = await readFile(new URL('../src/styles/07-game.css', import.meta.url), 'utf8');
assert(sourceCss.includes('touch-action: pan-y'), 'mobile panel vertical scrolling contract is missing');
const scene = await readFile(new URL('../src/components/VikingScene.tsx', import.meta.url), 'utf8');
assert(scene.includes('TOUCH_TRUCK'), 'one-finger mobile camera trucking is missing');
assert(scene.includes('TOUCH_DOLLY_TRUCK'), 'two-finger mobile dolly/truck is missing');
assert(scene.includes('minPolarAngle') && scene.includes('maxPolarAngle'), 'cinematic camera angle lock is missing');

if (failures.length) {
  console.error('Production verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Production verification passed (${assets.length} assets, ${totalJs} JS bytes).`);
