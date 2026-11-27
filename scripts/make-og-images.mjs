// Makes the 1200×630 link-preview cards in public/og/ (listed in src/data/shareImages.ts) from an HTML template,
// screenshotted in headless Chrome so the real Newsreader / Libre Franklin web fonts are used.
//   npm i --no-save sharp && node scripts/make-og-images.mjs
// Needs Chrome (CHROME=/path/to/chrome to override) and a network connection for Google Fonts.
// Re-run after changing a card in shareImages.ts, a guide title, or the programs on the map.
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const sharp = (await import('sharp')).default;
const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'public/og');
const work = resolve(tmpdir(), 'rc-og');
mkdirSync(outDir, { recursive: true });
mkdirSync(work, { recursive: true });

const entry = resolve(work, 'og-data.mjs');
await build({ entryPoints: [resolve(root, 'scripts/og-entry.ts')], outfile: entry, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent', alias: { '@': resolve(root, 'src') } });
const { colleges, TIER_COLORS, TIER_LABELS, TIER_ORDER, articles, US_NATION_PATH, US_BORDERS_PATH, PAGE_CARDS, guideCard, OG_WIDTH, OG_HEIGHT } = await import(pathToFileURL(entry).href);

const CHROME = process.env.CHROME || ['/usr/bin/google-chrome-stable', '/usr/local/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!CHROME) throw new Error('Chrome not found. Set CHROME=/path/to/chrome');

// Tailwind tokens (tailwind.config.js)
const T = { navy: '#00458c', ink: '#101E30', line: '#e5e9ef', muted: '#5b6b7d', faint: '#677489', paper: '#f6f7f9' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fileUrl = (p) => pathToFileURL(resolve(root, p)).href;

function mapArt() {
  const pins = [...colleges].sort((a, b) => TIER_ORDER.indexOf(b.tier) - TIER_ORDER.indexOf(a.tier)).map((c) => {
    const r = c.tier === 'championship' ? 13 : 11;
    return `<circle cx="${c.mapX}" cy="${c.mapY}" r="${r}" fill="${TIER_COLORS[c.tier]}" stroke="#fff" stroke-width="2.5"/><circle cx="${c.mapX}" cy="${c.mapY}" r="${(r * 0.34).toFixed(1)}" fill="#fff"/>`;
  }).join('');
  const legend = TIER_ORDER.map((t) => `<span class="lg"><i style="background:${TIER_COLORS[t]}"></i>${esc(TIER_LABELS[t])}</span>`).join('');
  return `<div class="art map"><svg viewBox="0 0 960 600" xmlns="http://www.w3.org/2000/svg">
    <path d="${US_NATION_PATH}" fill="${T.paper}"/><path d="${US_BORDERS_PATH}" fill="none" stroke="#dde2e9" stroke-width="1"/>
    <path d="${US_NATION_PATH}" fill="none" stroke="#c9d0d9" stroke-width="1.2"/>${pins}</svg>
    <div class="legend">${legend}</div></div>`;
}
const hughArt = () => `<div class="art hugh"><img src="${fileUrl('public/images/hugh/hugh-johnston-headshot-lg.webp')}" alt=""/></div>`;

function html({ kicker, headline, art }) {
  const size = headline.length <= 34 ? 66 : headline.length <= 52 ? 58 : 50;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Libre+Franklin:wght@400;500;600;700&display=block" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${OG_WIDTH}px;height:${OG_HEIGHT}px;overflow:hidden;background:#fff}
body{position:relative;font-family:'Libre Franklin',sans-serif;color:${T.ink}}
.col{position:absolute;left:72px;top:60px;bottom:128px;width:${art === 'hugh' ? 620 : 540}px;display:flex;flex-direction:column}
.logo{height:46px;width:auto;align-self:flex-start}
.kicker{margin-top:auto;font-size:15px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${T.muted}}
h1{margin-top:18px;font-family:'Newsreader',Georgia,serif;font-weight:600;font-size:${size}px;line-height:1.05;letter-spacing:-.02em;color:${T.ink}}
.foot{position:absolute;left:72px;right:${art === 'hugh' ? 512 : 72}px;bottom:52px;padding-top:20px;border-top:1px solid ${T.line};display:flex;justify-content:space-between;align-items:baseline;font-size:16px;color:${T.muted}}
.foot b{font-weight:600;color:${T.navy}}
.art.map{position:absolute;right:56px;top:84px;width:540px}
.art.map svg{width:540px;height:auto;display:block}
.legend{display:flex;gap:18px;justify-content:center;margin-top:10px;font-size:14px;color:${T.faint}}
.lg{display:inline-flex;align-items:center;gap:7px}.lg i{width:11px;height:11px;border-radius:50%;display:inline-block}
.art.hugh{position:absolute;right:0;top:0;bottom:0;width:440px;overflow:hidden;background:${T.line}}
.art.hugh img{width:100%;height:100%;object-fit:cover;object-position:50% 22%}
</style></head><body>
<div class="col"><img class="logo" src="${fileUrl('public/logo.png')}" alt="">
<p class="kicker">${esc(kicker)}</p><h1>${esc(headline)}</h1></div>
<div class="foot"><span>Hugh Johnston · Head coach, 2023 NCR D1 National Champions</span><b>rugbycampus.org</b></div>
${art === 'hugh' ? hughArt() : mapArt()}
</body></html>`;
}

const jobs = [
  ...PAGE_CARDS,
  ...articles.filter((a) => !a.content.startsWith('Coming soon')).map((a) => ({ ...guideCard(a), kicker: `Guide · ${a.category}`, headline: a.title, art: 'map' })),
];
for (const j of jobs) {
  const name = j.file.replace(/^\/og\//, '').replace(/\.jpg$/, '');
  const page = resolve(work, `${name}.html`);
  const shot = resolve(work, `${name}.png`);
  writeFileSync(page, html(j));
  execFileSync(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${OG_WIDTH},${OG_HEIGHT}`, '--virtual-time-budget=15000', '--allow-file-access-from-files', `--screenshot=${shot}`, pathToFileURL(page).href], { stdio: 'ignore' });
  const out = resolve(root, 'public', j.file.slice(1));
  await sharp(shot).resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'left top' }).jpeg({ quality: 84, mozjpeg: true }).toFile(out);
  console.log(`${j.file}  ${(statSync(out).size / 1024).toFixed(0)} KB`);
}
rmSync(work, { recursive: true, force: true });
