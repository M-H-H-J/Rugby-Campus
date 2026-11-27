// Rewrites the data tables in src/data/articles.ts from colleges.ts + collegeSearchFacts.json (see scripts/guide-tables.ts).
//   node scripts/gen-guide-tables.mjs
// Run it after changing a tier, a Varsity/Club label, a badge or a cost, then bump the guide's updatedDate.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, '.guide-tables.mjs');
await build({ entryPoints: [resolve(root, 'scripts/guide-tables.ts')], outfile: out, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent', alias: { '@': resolve(root, 'src') } });
const { GUIDE_BLOCKS } = await import(pathToFileURL(out).href);
rmSync(out);

const path = resolve(root, 'src/data/articles.ts');
const lines = readFileSync(path, 'utf8').split('\n');
// A block is a run of table rows ("|") or of bold-labelled list items ("- **").
const sameKind = (first) => (l) => (first.startsWith('|') ? l.startsWith('|') : l.startsWith('- **'));
let changed = 0;
for (const blocks of Object.values(GUIDE_BLOCKS)) {
  for (const block of blocks) {
    const first = block.split('\n')[0];
    const key = first.startsWith('|') ? first : first.slice(0, first.indexOf(':**') + 3);
    const at = lines.findIndex((l) => l.startsWith(key));
    if (at === -1) throw new Error(`No block starting with "${key}" in articles.ts. Paste it in once by hand:\n${block}`);
    let end = at;
    while (end < lines.length && sameKind(first)(lines[end])) end++;
    const old = lines.slice(at, end).join('\n');
    if (old !== block) { lines.splice(at, end - at, ...block.split('\n')); changed++; }
  }
}
writeFileSync(path, lines.join('\n'));
console.log(changed ? `Updated ${changed} block(s) in src/data/articles.ts. Bump the guide's updatedDate.` : 'Guide tables already match the data.');
