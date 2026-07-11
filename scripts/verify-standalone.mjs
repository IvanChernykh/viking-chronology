import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const file = resolve(import.meta.dirname, '..', 'viking-chronology-standalone.html');
const [html, metadata] = await Promise.all([readFile(file, 'utf8'), stat(file)]);
const failures = [];

if (html.includes('type="module"')) failures.push('standalone contains a module script');
if (html.includes('import.meta')) failures.push('standalone contains import.meta');
if (/\bimport\s*\(/.test(html)) failures.push('standalone contains a dynamic import');
if (!html.includes('viewport-fit=cover')) failures.push('mobile viewport metadata is missing');
if (!html.includes('webglcontextlost')) failures.push('WebGL context-loss recovery is missing');
if (metadata.size > 1_700_000) failures.push(`standalone is too large: ${metadata.size} bytes`);

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Standalone compatibility verified (${metadata.size} bytes).`);
