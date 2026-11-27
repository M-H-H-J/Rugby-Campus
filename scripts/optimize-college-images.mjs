// Makes WebP copies of every campus photo in public/college-images/ and writes src/data/collegeImageVariants.json.
//   npm i --no-save sharp && node scripts/optimize-college-images.mjs
// The original <slug>.jpg stays untouched: Supabase colleges.image_url stores that path, link previews use it,
// and browsers without WebP fall back to it. Output per photo: <slug>-480.webp, <slug>-960.webp, <slug>-1600.webp
// (never enlarged; a narrower original gets fewer widths). Re-run after adding or replacing a photo.
import { readdirSync, writeFileSync, statSync, unlinkSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const sharp = (await import('sharp')).default;
const root = resolve(import.meta.dirname, '..');
const dir = resolve(root, 'public/college-images');
const manifestPath = resolve(root, 'src/data/collegeImageVariants.json');

/** Width -> largest file allowed. 1600 is the profile hero; 480/960 are directory cards on phones and desktops. */
const TARGETS = [
  { width: 480, maxBytes: 40 * 1024 },
  { width: 960, maxBytes: 100 * 1024 },
  { width: 1600, maxBytes: 180 * 1024 },
];

/** Lower quality first (not below 40), then a slightly narrower image, until it fits. */
async function encode(src, width, maxBytes) {
  const webp = (w, q) => sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: q, effort: 4 }).toBuffer({ resolveWithObject: true });
  for (let w = width; w >= width * 0.7; w = Math.round(w * 0.9)) {
    for (let q = 78; q >= 40; q -= 4) {
      const { data, info } = await webp(w, q);
      if (data.length <= maxBytes) return { data, info, q };
    }
  }
  // Dense foliage can't reach the budget without visible damage: keep it sharp and say so.
  const { data, info } = await webp(Math.round(width * 0.75), 50);
  console.warn(`WARNING: ${basename(src)} at ${info.width}px is ${(data.length / 1024).toFixed(0)} KB, over the ${(maxBytes / 1024).toFixed(0)} KB budget`);
  return { data, info, q: 50 };
}

for (const f of readdirSync(dir)) if (f.endsWith('.webp')) unlinkSync(resolve(dir, f));

const manifest = {};
let jpgBytes = 0, heroBytes = 0, cardBytes = 0;
const jpgs = readdirSync(dir).filter((f) => /^[a-z0-9-]+\.jpg$/.test(f)).sort();
for (const f of jpgs) {
  const stem = f.replace(/\.jpg$/, '');
  const src = resolve(dir, f);
  const { width: srcW, height: srcH } = await sharp(src).rotate().metadata();
  const widths = [];
  for (const t of TARGETS) {
    const want = Math.min(t.width, srcW);
    if (widths.some((w) => w >= want)) continue;
    const out = await encode(src, want, t.maxBytes);
    const w = out.info.width;
    writeFileSync(resolve(dir, `${stem}-${w}.webp`), out.data);
    widths.push(w);
  }
  manifest[stem] = { widths, ratio: Number((srcH / srcW).toFixed(4)) };
  const size = (w) => statSync(resolve(dir, `${stem}-${w}.webp`)).size;
  jpgBytes += statSync(src).size;
  heroBytes += size(widths.at(-1));
  cardBytes += size(widths.find((w) => w >= 960) ?? widths.at(-1));
  console.log(`${stem}: jpg ${(statSync(src).size / 1024).toFixed(0)} KB -> ${widths.map((w) => `${w}w ${(size(w) / 1024).toFixed(0)} KB`).join(', ')}`);
}
writeFileSync(manifestPath, `{\n${Object.entries(manifest).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n}\n`);
const kb = (n) => `${(n / 1024 / jpgs.length).toFixed(0)} KB`;
console.log(`\n${jpgs.length} photos. Average: original jpg ${kb(jpgBytes)}, profile hero webp ${kb(heroBytes)}, directory card webp ${kb(cardBytes)}.`);
