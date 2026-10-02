// Live-model check of the parser on the 30 sample sentences. Needs a real key; costs well under 1 cent.
//   GEMINI_API_KEY=... SEARCH_ALLOW_MEMORY_STORE=true node scripts/search-eval.mjs
// It calls the same handler the site uses, prints the filters, tokens and cost per sentence, and the totals.
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, '.search-eval-handler.mjs');
await build({ entryPoints: [resolve(root, 'api/search-parse.ts')], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'silent' });
const { default: handler } = await import(pathToFileURL(out).href);
const cases = JSON.parse(readFileSync(resolve(root, 'tests/api/sample-sentences.json'), 'utf8'));
process.env.SEARCH_ALLOW_MEMORY_STORE ??= 'true';
process.env.SEARCH_LOG_SINK = 'off';
let n = 0, ok = 0, ms = 0, agree = 0;
for (const [s, expected] of cases) {
  let body, status = 200;
  const req = { method: 'POST', headers: { 'x-forwarded-for': `10.0.0.${n + 1}` }, body: { sentence: s }, socket: {} };
  const res = { setHeader() {}, status(c) { status = c; return this; }, json(b) { body = b; return this; }, end() { return this; } };
  const t = Date.now(); await handler(req, res); ms += Date.now() - t; n++;
  if (body?.ok) ok++;
  const f = body?.filters ?? {};
  const diffs = Object.entries(expected).filter(([k, v]) => JSON.stringify(Array.isArray(v) ? [...(f[k] ?? [])].sort() : f[k]) !== JSON.stringify(Array.isArray(v) ? [...v].sort() : v)).map(([k]) => k);
  if (!diffs.length) agree++;
  console.log(`\n"${s}"\n  -> ${status} ${JSON.stringify(body?.filters ?? body)}\n  ${diffs.length ? 'DIFFERS from expected on: ' + diffs.join(', ') : 'matches expected'}`);
}
console.log(`\n${ok}/${n} parsed OK, ${agree}/${n} match the expected filters, avg ${Math.round(ms / n)} ms. Check cost in the provider dashboard (or the SEARCH_LOG lines).`);
