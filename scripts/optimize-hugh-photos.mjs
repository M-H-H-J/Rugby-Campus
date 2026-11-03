// Turns Hugh's original photos into web-sized files in public/images/hugh/.
//   1. Put the four originals in one folder (default ~/Downloads/hugh-photos) with these names (any of .jpg/.jpeg/.png/.webp):
//        headshot, west-point, ndc-cap, coach-shirt
//   2. npm i --no-save sharp
//   3. node scripts/optimize-hugh-photos.mjs [folder]
// Output per photo: <base>-sm.webp (400px wide) and <base>-lg.webp (max 1600px wide, under 250 KB),
// plus a JPG of the headshot for link previews. Never enlarges. Rewrites the size numbers in src/lib/hughPhotos.ts.
import { readdirSync, writeFileSync, readFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve, extname, basename } from 'node:path';
import { homedir } from 'node:os';

const sharp = (await import('sharp')).default;
const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'public/images/hugh');
const inDir = resolve(process.argv[2] ?? resolve(homedir(), 'Downloads/hugh-photos'));
mkdirSync(outDir, { recursive: true });

const MAX_BYTES = 250 * 1024;
const JOBS = [
  { input: 'headshot', key: 'headshot', base: 'hugh-johnston-headshot' },
  { input: 'west-point', key: 'westPoint', base: 'hugh-johnston-west-point-huddle' },
  { input: 'ndc-cap', key: 'coachCap', base: 'hugh-johnston-ndc-cap' },
  { input: 'coach-shirt', key: 'coachShirt', base: 'hugh-johnston-coach-shirt' },
];
const files = readdirSync(inDir);
const find = (name) => {
  const f = files.find((x) => basename(x, extname(x)).toLowerCase() === name && /\.(jpe?g|png|webp)$/i.test(x));
  if (!f) throw new Error(`Missing "${name}.(jpg|png|webp)" in ${inDir}`);
  return resolve(inDir, f);
};

async function encode(src, width, maxBytes) {
  // Try lower quality first, then a slightly smaller image, until it fits.
  for (let w = width; w >= 300; w = Math.round(w * 0.85)) {
    for (let q = 82; q >= 46; q -= 6) {
      const { data, info } = await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: q, effort: 5 }).toBuffer({ resolveWithObject: true });
      if (data.length <= maxBytes) return { data, info, q };
    }
  }
  throw new Error(`Could not get ${src} under ${maxBytes} bytes`);
}

const sizes = {};
for (const j of JOBS) {
  const src = find(j.input);
  const lg = await encode(src, 1600, MAX_BYTES);
  const sm = await encode(src, 400, 60 * 1024);
  writeFileSync(resolve(outDir, `${j.base}-lg.webp`), lg.data);
  writeFileSync(resolve(outDir, `${j.base}-sm.webp`), sm.data);
  sizes[j.key] = { width: lg.info.width, height: lg.info.height, smWidth: sm.info.width };
  console.log(`${j.base}: lg ${lg.info.width}x${lg.info.height} ${(lg.data.length / 1024).toFixed(0)} KB (q${lg.q}), sm ${sm.info.width}px ${(sm.data.length / 1024).toFixed(0)} KB`);
  if (j.key === 'headshot') {
    const og = await sharp(src).rotate().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    writeFileSync(resolve(outDir, 'hugh-johnston-headshot-og.jpg'), og);
    console.log(`headshot og jpg ${(og.length / 1024).toFixed(0)} KB`);
  }
}

// Keep the numbers in src/lib/hughPhotos.ts in step with the real files.
const tsPath = resolve(root, 'src/lib/hughPhotos.ts');
let ts = readFileSync(tsPath, 'utf8');
for (const j of JOBS) {
  const s = sizes[j.key];
  ts = ts.replace(new RegExp(`(base: '${j.base}', )width: \\d+, height: \\d+, smWidth: \\d+`), `$1width: ${s.width}, height: ${s.height}, smWidth: ${s.smWidth}`);
}
writeFileSync(tsPath, ts);
for (const f of readdirSync(outDir)) if (statSync(resolve(outDir, f)).size > MAX_BYTES) console.warn(`WARNING: ${f} is over 250 KB`);
console.log('Done. Now run: npm test && npm run build');
