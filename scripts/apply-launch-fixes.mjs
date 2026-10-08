// scripts/apply-launch-fixes.mjs  (one-off, safe to re-run)
// Launch fixes, 9 Oct 2026. Runs AFTER the walk-through, follow-up and correction pastes.
// Every edit is an exact find-and-replace with a check:
//   - old text found        -> replaced
//   - new text already there -> skipped (so a second run changes nothing)
//   - neither               -> STOP (nothing is written for that file)
// Does NOT write to Supabase. It only edits files in this repo.
import fs from 'node:fs';

const fail = (m) => { console.error('STOP:', m); process.exit(1); };
const files = new Map();
const read = (p) => { if (!files.has(p)) files.set(p, fs.readFileSync(p, 'utf8')); return files.get(p); };
let changed = 0, skipped = 0;
/** Exact replace. n = how many times old must appear (default 1). */
function rep(p, oldS, newS, n = 1) {
  let s = read(p);
  const count = s.split(oldS).length - 1;
  if (newS !== '' && s.includes(newS) && (count === 0 || newS.includes(oldS))) { skipped++; return; }
  if (count === 0 && newS === '') { skipped++; return; }
  if (count === n) { s = s.split(oldS).join(newS); files.set(p, s); changed++; return; }
  fail(`${p}: expected ${n}x ${JSON.stringify(oldS.slice(0, 90))} but found ${count}`);
}
/** Replace every occurrence (0 is fine). */
function repAll(p, oldS, newS) { const s = read(p); if (s.includes(oldS)) { files.set(p, s.split(oldS).join(newS)); changed++; } }

const must = (p, needle, why) => { if (!read(p).includes(needle)) fail(`${why} (${p})`); };
must('supabase-setup.sql', 'Walkthrough fixes 2026-10-06', 'walk-through SQL block missing. Run the walk-through paste first.');
must('supabase-setup.sql', 'Follow-up fixes 2026-10-06', 'follow-up SQL block missing. Run the follow-up paste first.');
must('supabase-setup.sql', 'Correction UCLA/Iona 2026-10-07', 'correction SQL block missing. Run the correction paste first.');

// ───────────────────────── 1. supabase-setup.sql ─────────────────────────
const SQL = 'supabase-setup.sql';
// 1a. St. Thomas (Florida) keeps id 26. The id column is GENERATED ALWAYS, so the insert needs OVERRIDING SYSTEM VALUE
//     or Postgres rejects it and the whole follow-up block rolls back.
rep(SQL, "assistant_coaches)\nvalues (26, 'st-thomas-university-florida'", "assistant_coaches)\noverriding system value\nvalues (26, 'st-thomas-university-florida'");
// 1b. Hugh wants Ohio State, Utah and Western Washington coaches blank (unconfirmed). Remove the three lines that set them.
rep(SQL, "update colleges set coach_name='Cam DiLoreto', coach_email='' where slug='university-of-utah';\n", '');
rep(SQL, "update colleges set coach_name='Pete Malcolm', coach_email='' where slug='the-ohio-state-university';\n", '');
rep(SQL, "update colleges set coach_name='Adam Roberts', coach_email='' where slug='western-washington-university';\n", '');
// 1c. Same reason: the walk-through block's Western Washington description must not name a coach.
rep(SQL, 'moved up to D1A for 2026–27. Adam Roberts is head coach. The university is in Bellingham', 'moved up to D1A for 2026–27. The university is in Bellingham');
for (const name of ['Pete Malcolm', 'Cam DiLoreto', 'Adam Roberts']) if (read(SQL).includes(name)) fail(`${SQL}: ${name} still present`);

// ───────────────────────── 2. src/data/colleges.ts ─────────────────────────
const CT = 'src/data/colleges.ts';
rep(CT, "playoff: 'Playoff calibre',", "playoff: 'Playoff caliber',");

/** NOAA 1991–2020 monthly normals, the SAME station the search facts use for each school
 *  (prov.climate_tag in collegeSearchFacts.json). Per month: high °F, low °F, high °C, low °C.
 *  Replaces the old tables, several of which came from a different station (e.g. UCLA had downtown LA). */
const NOAA = {
  "university-of-california-berkeley": ["USC00040693", "59,43,15,6 62,45,16,7 65,46,18,8 67,47,20,8 70,49,21,10 74,52,23,11 74,53,23,12 75,54,24,12 76,54,25,12 73,52,23,11 65,47,18,8 59,43,15,6"],
  "united-states-naval-academy": ["USW00013752", "43,30,6,-1 45,32,7,0 53,38,12,3 64,47,18,8 73,57,23,14 82,68,28,20 86,72,30,22 84,71,29,21 77,65,25,18 67,52,19,11 56,42,13,6 47,34,8,1"],
  "life-university": ["USC00095404", "53,32,12,0 57,35,14,1 65,40,19,5 72,48,22,9 77,57,25,14 82,65,28,18 84,68,29,20 84,68,29,20 80,62,26,17 71,51,22,11 63,40,17,4 55,35,13,2"],
  "lindenwood-university": ["USC00237397", "40,22,4,-6 45,25,7,-4 55,34,13,1 67,44,19,7 76,55,24,13 84,64,29,18 88,68,31,20 87,66,30,19 80,57,27,14 69,46,20,8 55,35,13,2 44,26,7,-3"],
  "saint-mary-s-college-of-california": ["USC00040693", "59,43,15,6 62,45,16,7 65,46,18,8 67,47,20,8 70,49,21,10 74,52,23,11 74,53,23,12 75,54,24,12 76,54,25,12 73,52,23,11 65,47,18,8 59,43,15,6"],
  "united-states-military-academy-army": ["USC00309292", "36,21,2,-6 39,22,4,-5 47,30,9,-1 60,41,16,5 72,51,22,10 80,60,27,15 85,65,30,19 83,64,29,18 76,57,24,14 63,46,17,8 51,36,11,2 41,27,5,-3"],
  "university-of-california-los-angeles-ucla": ["USC00049152", "68,52,20,11 67,51,19,11 68,52,20,11 70,54,21,12 70,56,21,13 73,59,23,15 77,62,25,17 79,63,26,17 79,63,26,17 76,60,25,15 72,55,22,13 67,51,19,11"],
  "brown-university": ["USW00014765", "38,22,3,-5 41,24,5,-5 48,30,9,-1 59,40,15,4 69,49,21,10 78,59,25,15 84,65,29,18 82,64,28,18 75,57,24,14 64,45,18,7 53,36,12,2 43,28,6,-2"],
  "mount-st-mary-s-university": ["USC00182906", "40,22,4,-5 43,23,6,-5 52,30,11,-1 64,40,18,4 72,51,22,10 81,60,27,15 85,64,30,18 84,62,29,17 77,55,25,13 66,44,19,6 54,33,12,1 44,27,7,-3"],
  "brigham-young-university": ["USC00427064", "41,24,5,-5 48,28,9,-2 58,35,15,1 66,40,19,4 76,47,24,9 87,55,31,13 95,62,35,17 93,61,34,16 83,52,28,11 69,41,20,5 53,32,12,0 41,24,5,-4"],
  "university-of-arizona": ["USC00028815", "66,42,19,6 69,45,21,7 76,50,24,10 83,56,28,13 91,64,33,18 101,73,38,23 100,77,38,25 98,76,37,25 95,72,35,22 86,60,30,16 75,50,24,10 65,42,18,5"],
  "pennsylvania-state-university": ["USC00368449", "34,21,1,-6 37,22,3,-6 46,28,8,-2 59,39,15,4 69,50,21,10 77,59,25,15 81,63,27,17 79,62,26,16 72,54,22,12 61,43,16,6 49,34,9,1 38,26,4,-3"],
  "dartmouth-college": ["USC00273850", "30,13,-1,-11 34,14,1,-10 44,24,7,-5 58,35,15,2 71,46,22,8 79,55,26,13 83,61,29,16 82,59,28,15 74,52,23,11 60,40,16,5 47,31,8,-1 36,20,2,-6"],
  "california-polytechnic-state-university": ["USC00047851", "65,44,18,7 65,44,18,7 67,46,20,8 69,47,21,8 72,49,22,10 76,52,24,11 78,54,26,12 80,55,27,13 80,54,27,12 78,52,25,11 71,47,22,9 64,44,18,7"],
  "st-bonaventure-university": ["USC00306196", "32,13,0,-10 34,15,1,-10 43,21,6,-6 57,32,14,0 68,44,20,7 76,53,24,11 80,57,27,14 79,55,26,13 73,49,23,9 60,38,15,4 47,29,8,-2 37,21,3,-6"],
  "arkansas-state-university": ["USC00033734", "46,27,8,-3 51,30,10,-1 60,38,16,3 71,48,22,9 79,57,26,14 87,66,31,19 90,70,32,21 89,68,32,20 83,60,28,16 72,48,22,9 59,37,15,3 49,30,9,-1"],
  "grand-canyon-university": ["USW00023183", "68,46,20,8 71,49,22,9 78,55,26,13 86,61,30,16 95,70,35,21 104,79,40,26 107,85,41,29 105,84,41,29 100,78,38,26 89,66,32,19 77,54,25,12 66,45,19,7"],
  "university-of-mary-washington": ["USC00443204", "46,25,8,-4 49,27,10,-3 57,34,14,1 69,44,20,6 76,53,24,12 84,63,29,17 89,68,31,20 87,66,30,19 80,59,27,15 70,46,21,8 59,35,15,2 50,28,10,-2"],
  "queens-university-of-charlotte": ["USW00013881", "52,32,11,0 57,35,14,2 64,41,18,5 73,49,23,10 80,58,27,14 87,66,31,19 90,70,32,21 89,69,31,20 83,63,28,17 73,50,23,10 63,40,17,4 55,35,13,1"],
  "university-of-notre-dame": ["USC00128437", "32,17,0,-8 35,19,2,-7 47,27,8,-3 59,38,15,3 70,50,21,10 80,59,27,15 83,63,28,17 81,61,27,16 76,54,24,12 63,42,17,5 48,32,9,0 37,23,3,-5"],
  "the-ohio-state-university": ["USC00331785", "37,21,3,-6 40,23,5,-5 51,31,10,-1 64,41,18,5 74,51,23,11 82,61,28,16 85,65,29,18 84,63,29,17 78,55,26,13 66,43,19,6 52,33,11,0 41,27,5,-3"],
  "davenport-university": ["USC00206013", "30,17,-1,-9 33,18,1,-8 44,25,7,-4 57,36,14,2 70,48,21,9 78,57,26,14 82,62,28,17 80,60,27,16 73,52,23,11 60,41,16,5 47,32,8,0 35,24,2,-5"],
  "marian-university": ["USW00053842", "36,21,2,-6 41,24,5,-4 52,33,11,1 64,43,18,6 74,54,23,12 82,63,28,17 85,67,30,19 84,65,29,18 78,57,26,14 66,45,19,7 52,35,11,2 41,26,5,-3"],
  "university-of-michigan": ["USC00200228", "32,16,0,-9 35,16,2,-9 45,25,7,-4 58,34,15,1 70,46,21,8 80,56,27,13 84,59,29,15 82,58,28,14 75,50,24,10 62,39,17,4 48,30,9,-1 36,22,2,-5"],
  "indiana-university": ["USC00120784", "37,21,3,-6 42,23,5,-5 52,32,11,0 64,42,18,6 74,53,23,12 82,62,28,17 85,65,30,18 85,64,29,18 79,56,26,13 66,44,19,7 53,34,12,1 41,26,5,-3"],
  "st-thomas-university-florida": ["USW00012882", "77,59,25,15 79,61,26,16 81,64,27,18 84,68,29,20 87,72,31,22 90,76,32,24 91,76,33,25 91,77,33,25 90,76,32,24 86,73,30,23 82,67,28,19 79,62,26,17"],
  "wheeling-university": ["USC00469482", "39,22,4,-6 42,23,5,-5 51,30,11,-1 65,40,18,4 74,50,23,10 81,59,27,15 85,64,29,18 85,63,29,17 79,56,26,13 66,44,19,7 54,34,12,1 43,27,6,-3"],
  "southern-nazarene-university": ["USW00003954", "51,28,10,-2 55,31,13,0 64,40,18,5 72,49,22,9 80,59,27,15 89,68,32,20 95,73,35,23 94,71,34,22 85,63,30,17 74,51,23,10 62,39,17,4 51,30,11,-1"],
  "mckendree-university": ["USW00013802", "43,24,6,-4 49,28,9,-2 59,36,15,2 71,46,21,8 79,56,26,13 87,65,31,18 90,68,32,20 89,65,32,19 83,57,29,14 73,47,23,8 58,37,15,3 46,28,8,-2"],
  "santa-clara-university": ["USW00023293", "60,42,15,5 62,44,17,7 66,46,19,8 69,48,21,9 74,52,23,11 79,56,26,13 81,58,27,15 81,59,27,15 81,57,27,14 76,53,24,12 66,46,19,8 60,42,15,5"],
  "university-of-san-diego": ["USC00047741", "64,47,18,8 63,50,17,10 64,52,18,11 66,54,19,12 67,58,19,14 68,60,20,16 72,65,22,18 74,66,23,19 73,64,23,18 70,59,21,15 66,52,19,11 63,47,17,8"],
  "university-of-utah": ["USC00427655", "40,23,4,-5 46,26,8,-3 56,33,13,1 63,38,17,3 73,46,23,8 84,55,29,13 92,63,34,17 90,62,32,17 80,53,26,12 66,41,19,5 52,31,11,0 41,23,5,-5"],
  "walsh-university": ["USW00014895", "36,20,2,-6 39,22,4,-6 48,29,9,-1 62,40,17,4 72,50,22,10 80,59,27,15 84,63,29,17 83,62,28,17 76,55,24,13 63,44,17,7 51,34,10,1 40,26,4,-3"],
  "siena-college": ["USW00014735", "33,16,0,-9 36,18,2,-8 45,26,7,-3 59,37,15,3 71,48,22,9 79,57,26,14 84,62,29,17 82,61,28,16 74,53,24,11 62,41,16,5 49,32,10,0 38,23,3,-5"],
  "kutztown-university": ["USC00367578", "38,20,3,-7 41,21,5,-6 49,29,10,-2 62,39,17,4 72,49,22,9 80,58,27,14 85,62,29,17 83,60,29,16 77,53,25,12 65,41,18,5 53,32,12,0 43,25,6,-4"],
  "belmont-abbey-college": ["USW00013881", "52,32,11,0 57,35,14,2 64,41,18,5 73,49,23,10 80,58,27,14 87,66,31,19 90,70,32,21 89,69,31,20 83,63,28,17 73,50,23,10 63,40,17,4 55,35,13,1"],
  "thomas-more-university": ["USW00093814", "40,23,4,-5 44,26,7,-3 54,34,12,1 66,44,19,7 75,54,24,12 83,62,28,17 86,66,30,19 85,65,30,18 79,57,26,14 67,46,19,8 54,35,12,2 43,28,6,-2"],
  "fairfield-university": ["USW00094702", "38,24,4,-4 41,26,5,-4 47,32,9,0 58,42,15,5 68,52,20,11 78,62,25,16 83,68,29,20 82,67,28,19 75,60,24,15 64,48,18,9 54,38,12,4 44,30,7,-1"],
  "western-washington-university": ["USC00450587", "48,35,9,2 50,35,10,2 54,38,12,3 59,42,15,5 66,46,19,8 70,51,21,11 75,54,24,12 75,54,24,12 69,50,20,10 60,44,15,7 52,39,11,4 47,35,8,2"],
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const tempsLiteral = (packed) => '[' + packed.split(' ').map((m, i) => {
  const [hF, lF, hC, lC] = m.split(',').map(Number);
  return `{month:"${MONTHS[i]}",hF:${hF},lF:${lF},hC:${hC},lC:${lC}}`;
}).join(',') + ']';
// Same rule as weatherSentence() in src/lib/search/display.ts (kept in sync by a test).
const weatherFrom = (packed) => {
  const t = packed.split(' ').map((m) => m.split(',').map(Number));
  const w = [11, 0, 1].reduce((a, i) => a + (t[i][0] + t[i][1]) / 2, 0) / 3;
  const s = [5, 6, 7].reduce((a, i) => a + t[i][0], 0) / 3;
  const summer = s >= 95 ? 'Very hot summers' : s >= 85 ? 'Hot summers' : s >= 75 ? 'Warm summers' : 'Mild summers';
  const winter = w >= 45 ? 'mild winters' : w >= 30 ? 'cool winters' : 'cold, snowy winters';
  return `${summer}, ${winter}.`;
};

const EDITS = {
  'the-ohio-state-university': { coachName: '' },
  'university-of-utah': { coachName: '' },
  'western-washington-university': {
    coachName: '',
    description: 'Western Washington won the 2025–26 CRAA D1AA national 15s title and moved up to D1A for 2026–27. The university is in Bellingham, Washington, near the Canadian border.',
  },
  'colorado-state-university': { rugbyProgramUrl: 'https://www.coloradostaterugby.com/' },
};

{
  let ts = read(CT);
  let parts = ts.split(/(?=\n  \{\n    id: )/);
  const slugOf = (blk) => (blk.match(/slug: "([^"]+)"/) || [])[1];
  const setStr = (blk, key, val, slug) => {
    const re = new RegExp(`${key}: "(?:[^"\\\\]|\\\\.)*"`);
    if (!re.test(blk)) fail(`${slug}: no ${key}`);
    return blk.replace(re, () => `${key}: ${JSON.stringify(val)}`);
  };
  const seen = new Set();
  parts = parts.map((blk) => {
    const slug = slugOf(blk);
    if (!slug) return blk;
    seen.add(slug);
    for (const [k, v] of Object.entries(EDITS[slug] || {})) blk = setStr(blk, k, v, slug);
    const n = NOAA[slug];
    if (n) {
      if (!/monthlyTemps: \[[^\]]*\]/.test(blk)) fail(`${slug}: no monthlyTemps`);
      blk = blk.replace(/monthlyTemps: \[[^\]]*\]/, () => `monthlyTemps: ${tempsLiteral(n[1])}`);
      blk = setStr(blk, 'weatherSummary', weatherFrom(n[1]), slug);
    }
    return blk;
  });
  for (const s of [...Object.keys(EDITS), ...Object.keys(NOAA)]) if (!seen.has(s)) fail(`colleges.ts: slug missing ${s}`);
  if (seen.size !== 47) fail(`colleges.ts: expected 47 programs, found ${seen.size}`);
  ts = parts.join('');
  for (const name of ['Pete Malcolm', 'Cam DiLoreto', 'Adam Roberts', 'csurec.colostate.edu']) if (ts.includes(name)) fail(`colleges.ts: ${name} still present`);
  files.set(CT, ts);
  console.log(`colleges.ts: 3 coaches blanked, WWU description, CSU link, ${Object.keys(NOAA).length} NOAA weather tables + summaries`);
}

// ───────────────────────── 3. src/data/collegeSearchFacts.json ─────────────────────────
{
  const FP = 'src/data/collegeSearchFacts.json';
  const facts = JSON.parse(read(FP));
  if (Object.keys(facts.colleges).length !== 47) fail('facts: expected 47 programs');
  const NOTE = ' Not a bar to listing it, but check before getting excited.';
  let n = 0;
  for (const slug of ['united-states-naval-academy', 'united-states-military-academy-army']) {
    const f = facts.colleges[slug];
    if (f.intl_warning?.includes(NOTE)) { f.intl_warning = f.intl_warning.replace(NOTE, ' Check your eligibility with the academy before you plan around it.'); n++; }
  }
  files.set(FP, JSON.stringify(facts));
  console.log(`collegeSearchFacts.json: ${n} service-academy notes cleaned (0 on a re-run)`);
}

// ───────────────────────── 4. One climate rule (display.ts) ─────────────────────────
const DISP = 'src/lib/search/display.ts';
rep(DISP, "  if (winterF >= 40) return 'warm_winters';", "  if (winterF >= 45) return 'warm_winters';");
rep(DISP, "  warm_winters: 'Warm winters',", "  warm_winters: 'Mild winters',");
rep(DISP, "  warm_winters: '≥40°F (≥4.5°C)',\n  cool_winters: '30–39.9°F (−1 to 4.5°C)',", "  warm_winters: '≥45°F (≥7°C)',\n  cool_winters: '30–44.9°F (−1 to 7°C)',");
rep(DISP, "export const VERY_HOT_LABEL = 'Very hot summers';\n", `export const VERY_HOT_LABEL = 'Very hot summers';

// ONE climate rule for the whole site: the stats chip, the search pills, the Weather sentence and the
// monthly table all use climateBand() (winters) and summerLabel() (summers). Thresholds match the
// "climate_tag" definition in collegeSearchFacts.json: mild winters >= 45°F, cool 30–44.9°F, cold < 30°F.
export function summerLabel(summerF: number): string {
  if (summerF >= 95) return VERY_HOT_LABEL;
  if (summerF >= 85) return 'Hot summers';
  if (summerF >= 75) return 'Warm summers';
  return 'Mild summers';
}

const WINTER_PHRASE: Record<ClimateBand, string> = { warm_winters: 'mild winters', cool_winters: 'cool winters', cold_winters: 'cold, snowy winters' };

/** "Hot summers, cool winters." Built from numbers, never typed by hand. */
export function weatherSentence(f: { winter_avg_computed_f: number | null; summer_high_f: number | null }): string {
  const band = climateBand(f.winter_avg_computed_f);
  if (!band) return '';
  const winter = WINTER_PHRASE[band];
  if (f.summer_high_f == null) return winter[0].toUpperCase() + winter.slice(1) + '.';
  return \`\${summerLabel(f.summer_high_f)}, \${winter}.\`;
}

/** Winter average (Dec–Feb mean of high and low) and summer high (Jun–Aug mean high) from a 12-month table. */
export function climateFromTemps(temps: { month: string; hF: number; lF: number }[]): { winter_avg_computed_f: number; summer_high_f: number } | null {
  if (!Array.isArray(temps) || temps.length !== 12) return null;
  const by = new Map(temps.map((t) => [t.month, t]));
  const w = ['Dec', 'Jan', 'Feb'].map((m) => by.get(m));
  const s = ['Jun', 'Jul', 'Aug'].map((m) => by.get(m));
  if ([...w, ...s].some((t) => !t)) return null;
  return {
    winter_avg_computed_f: w.reduce((a, t) => a + (t!.hF + t!.lF) / 2, 0) / 3,
    summer_high_f: s.reduce((a, t) => a + t!.hF, 0) / 3,
  };
}
`);
rep('src/components/search/FilterPanel.tsx', "`Warm winters ${CLIMATE_RANGE[c]}`", "`Mild winters ${CLIMATE_RANGE[c]}`");
rep('api/_lib/prompt.ts', '("warm/sunny/not freezing/no snow/hot/desert" -> warm_winters;', '("warm/mild winters/sunny/not freezing/no snow/hot/desert" -> warm_winters;');
rep('scripts/data-entry.ts', 'export { climateText, airportRows,', 'export { climateText, weatherSentence, climateFromTemps, airportRows,');

// ───────────────────────── 5. College page ─────────────────────────
const CD = 'src/pages/CollegeDetail.tsx';
rep(CD, "import { usePageMeta } from '@/lib/usePageMeta';", "import { usePageMeta, useNoindex } from '@/lib/usePageMeta';");
rep(CD, "import { mlrSummary } from '@/lib/search/display';", "import { climateFromTemps, mlrSummary, weatherSentence } from '@/lib/search/display';");
rep(CD, "Coach contact, program details, and how to get recruited.` : undefined\n  );\n", "Coach contact, program details, and how to get recruited.` : undefined\n  );\n  // Unknown or retired slug: keep this \"not found\" page out of search engines.\n  useNoindex(!college);\n");
rep(CD, "colleges.filter((c) => c.id !== college.id && c.tier === college.tier)", "colleges.filter((c) => c.slug !== college.slug && c.tier === college.tier)");
rep(CD, "<li key={c.id} className=\"border-b border-line\">", "<li key={c.slug} className=\"border-b border-line\">");
// Enrollment: one figure only, the IPEDS undergraduate count in "Cost, study and campus" (labelled with its source).
rep(CD, "    ['Enrollment', college.enrollment > 0 ? `${college.enrollment.toLocaleString()} students` : 'TBC'],\n", '');
rep(CD, '>Honours</h2>', '>Honors</h2>');
rep(CD, '<p className="text-[14px] text-muted mb-5">{college.weatherSummary}</p>', '<p className="text-[14px] text-muted mb-5">{weatherSentence(climateFromTemps(college.monthlyTemps) ?? { winter_avg_computed_f: null, summer_high_f: null })}</p>');
rep(CD, '<p className="text-[11px] text-faint mt-2.5">Average high / low. °C shown large, °F below.</p>', '<p className="text-[11px] text-faint mt-2.5">Average high / low. °C shown large, °F below. NOAA 1991–2020 normals, nearest full weather station.</p>');

const CFS = 'src/components/search/CollegeFactsSection.tsx';
rep(CFS, "` · ${f.enrollment_undergrad.toLocaleString()} undergraduates` : ''}`]);", "` · ${f.enrollment_undergrad.toLocaleString()} undergraduates (IPEDS)` : ''}`]);");
rep(CFS, "['cost', 'majors_cip2', 'climate_tag', 'setting']", "['cost', 'majors_cip2', 'climate_tag', 'size_band']");

const PM = 'src/lib/usePageMeta.ts';
rep(PM, '  }, [title, description]);\n}\n', `  }, [title, description]);
}

/** Adds <meta name="robots" content="noindex"> while active (e.g. the "College not found" page). */
export function useNoindex(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const el = document.createElement('meta');
    el.name = 'robots';
    el.content = 'noindex';
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, [active]);
}
`);

// Programs can share an id between Supabase and the bundle (live Western Washington is 41; bundled Colorado State is 41).
// Use the bundled id when we have the program, and key lists and pins by slug, which is always unique.
const UC = 'src/lib/useColleges.ts';
rep(UC, "            ...r,\n            popularMajors:", "            ...r,\n            id: local?.id ?? r.id,\n            popularMajors:");
rep(UC, "            monthlyTemps: r.monthly_temps ?? r.monthlyTemps ?? [],\n            weatherSummary: r.weather_summary ?? r.weatherSummary ?? '',",
  "            // Weather tables come from NOAA in the repo (Oct 2026). The repo wins when it has a full table.\n            monthlyTemps: local?.monthlyTemps?.length === 12 ? local.monthlyTemps : (r.monthly_temps ?? r.monthlyTemps ?? []),\n            weatherSummary: local?.monthlyTemps?.length === 12 ? local.weatherSummary : (r.weather_summary ?? r.weatherSummary ?? ''),");
rep('src/pages/Colleges.tsx', '<Link key={c.id} href={`/colleges/${c.slug}`}', '<Link key={c.slug} href={`/colleges/${c.slug}`}', 2);
rep('src/pages/Home.tsx', '<Link key={c.id} href={`/colleges/${c.slug}`}', '<Link key={c.slug} href={`/colleges/${c.slug}`}');
rep('src/components/USMap.tsx', 'const isHover = hover?.id === c.id;', 'const isHover = hover?.slug === c.slug;');
rep('src/components/USMap.tsx', '              key={c.id}\n', '              key={c.slug}\n');

// ───────────────────────── 6. Prerender (static HTML) ─────────────────────────
const PR = 'scripts/prerender.mjs';
rep(PR, 'climateText, airportRows,', 'climateText, weatherSentence, climateFromTemps, airportRows,');
rep(PR, "` · ${f.enrollment_undergrad.toLocaleString()} undergraduates` : ''}`]);", "` · ${f.enrollment_undergrad.toLocaleString()} undergraduates (IPEDS)` : ''}`]);");
rep(PR, "    ['Enrollment', c.enrollment ? c.enrollment.toLocaleString() : 'TBC'], ['Weather', c.weatherSummary]];",
  "    ...(climateFromTemps(c.monthlyTemps) ? [['Weather', weatherSentence(climateFromTemps(c.monthlyTemps))]] : [])];");
rep(PR, 'often near the top, playoff calibre, competitive', 'often near the top, playoff caliber, competitive');
rep(PR, 'plus individualised coaching', 'plus individualized coaching');
rep(PR, 'verified profiles and direct enquiries from', 'verified profiles and direct inquiries from');

// ───────────────────────── 7. Retired slugs: real 404 ─────────────────────────
const VJ = 'vercel.json';
rep(VJ, '  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],',
  '  "rewrites": [\n    { "source": "/colleges/iona-university", "destination": "/api/gone" },\n    { "source": "/colleges/iona-university/", "destination": "/api/gone" },\n    { "source": "/((?!api/).*)", "destination": "/index.html" }\n  ],');
if (!fs.existsSync('api/gone.ts')) {
  files.set('api/gone.ts', `// Retired college pages (see RETIRED_SLUGS in src/lib/useColleges.ts) are rewritten here by vercel.json,
// so they answer with a real 404 instead of a 200 "College not found" page. No env vars, no data.
interface RawRes { statusCode: number; setHeader(k: string, v: string): void; end(body?: string): void }

const HTML = \`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>No longer listed — Rugby Campus</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1.25rem;color:#071B33;line-height:1.6">
<h1 style="font-size:1.6rem">This program is no longer listed</h1>
<p>Rugby Campus no longer lists this college. <a href="/colleges" style="color:#00458c">See all programs</a>.</p>
</body></html>\`;

export default function handler(_req: unknown, res: RawRes) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(HTML);
}
`);
  changed++;
}

// ───────────────────────── 8. Copy: claims, internal notes, puffery, US spelling ─────────────────────────
const AR = 'src/data/articles.ts';
// Walsh is "Playoff caliber" on the site (Hugh locked), not in the top group.
rep(AR, "At the top of NCR D1 you'll often hear **St. Bonaventure, Queens, Brown, and Walsh**. Below that is a deep group of playoff-calibre sides,",
  "At the top of NCR D1 are **St. Bonaventure, Queens, and Brown**. Below that is a deep group of playoff-caliber sides (Walsh, Dartmouth, Wheeling and Kutztown in NCR D1),");
rep(AR, "Walsh University — which inherited the Notre Dame College program that won the 2023 title — is a consistent contender.",
  "Walsh University inherited the Notre Dame College program that won the 2023 title; on this site it sits in the Playoff caliber group.");
rep(AR, "In NCR D1, St. Bonaventure and Queens are frequent names at the top.", "In NCR D1, St. Bonaventure, Queens and Brown are the names at the top.");
// Puffery -> checkable statements.
rep(AR, "**D1A** — highest CRAA level. Powerhouse programs such as Cal, Life, Lindenwood, Navy, Saint Mary's. Intense spring championship path.",
  "**D1A** — highest CRAA level. Our top group here is Cal, Navy, Life, Lindenwood, Saint Mary's and Army. The championship is played in the spring.");
rep(AR, "World-class academics plus elite rugby if you can get in.", "Berkeley admits about 11% of applicants (federal IPEDS data), so getting in is the first hurdle.");
rep(AR, "Life (Marietta, Georgia) is one of the most important pathways in American college rugby — a varsity program that has attracted strong international talent and produced MLR / Eagles pathways. Smaller, specialised campus",
  "Life (Marietta, Georgia) runs rugby as a varsity sport and has won four D1A national titles (2013, 2016, 2018, 2019). Smaller, specialized campus");
rep(AR, "**Scholarships:** do not hard-claim. Soft line only — Life and other varsity programs **may have limited athletic aid**; academic aid may also be available. Verify with the coach.",
  "**Scholarships:** Life and other varsity programs **may have limited athletic aid**, and academic aid may also be available. Ask the coach.");
rep(AR, "After Cal / Life / the usual elites, **Saint Mary's College of California**", "After Cal and Life, **Saint Mary's College of California**");
rep(AR, "Saint Mary's has a deep Bay Area rugby tradition.", "Saint Mary's has won four D1A national titles (2014, 2015, 2017, 2024).");
rep(AR, "Navy and Army are absolutely up there on the field.", "Navy and Army are both in our top group on the field.");
rep(AR, "before you romanticise the jersey.", "before you romanticize the jersey.");
rep(AR, "The landscape moves in both directions — avoid the word \"churn\"; just say programs appear and disappear.", "The landscape moves in both directions: programs appear and disappear.");
// Coach contact claim (Home + guide FAQ).
rep(AR, "You can email coaches directly — every Rugby Campus profile includes a coach contact.", "You can email coaches directly. Most profiles list a head coach contact; where we couldn't confirm one, we say so.");
rep('src/pages/Home.tsx', "d: 'Every profile has a coach contact. Send a short email", "d: \"Most profiles list a head coach contact; where we couldn't confirm one, we say so. Send a short email");
rep('src/pages/Home.tsx', "that is enough to start the conversation.' },", "that is enough to start the conversation.\" },");
rep(AR, "From direct outreach from prospecting rugby players", "From direct outreach from prospective rugby players");
// US spelling.
rep(AR, "enrolment declines", "enrollment declines");
rep(AR, "**Rugby is usually not a revenue sport.** Grey zone between athletics and clubs gets cut first when budgets tighten.", "**Rugby is usually not a revenue sport.** The gray area between athletics and clubs gets cut first when budgets tighten.");
rep(AR, "Enrolment growing or shrinking?", "Enrollment growing or shrinking?");
rep(AR, "or student organisation?", "or student organization?");
rep(AR, "often sits in a grey zone:", "often sits in a gray area:");
rep(AR, "That grey zone is also why", "That gray area is also why");
rep(AR, "on a rumour that", "on a rumor that");
repAll(AR, 'playoff-calibre', 'playoff-caliber');
repAll(AR, 'Playoff calibre', 'Playoff caliber');
rep('src/lib/search/match.ts', "playoff: 'Playoff calibre'", "playoff: 'Playoff caliber'");
rep('src/lib/search/filters.ts', "mathematics: { label: 'Maths & statistics'", "mathematics: { label: 'Math & statistics'");
rep('public/llms.txt', 'often near the top, playoff calibre, competitive', 'often near the top, playoff caliber, competitive');
// Aid: match the scholarship guide (uncommon, varies, ask).
const AID = "Rugby aid varies by school and is often limited or none, so ask the coach what's available.";
rep('src/components/search/CollegeSearch.tsx', "Rugby recruits usually receive some aid, so ask the coach what's available.", AID);
rep('src/components/search/FilterPanel.tsx', "Rugby recruits often get some aid. Ask the coach what's possible.", AID);
rep('src/lib/search/match.ts', "detail: \"Rugby recruits often get some aid. The coach can tell you what's possible.\"", 'detail: "' + AID + '"');
// Search box placeholder: shorter so it fits at desktop and phone widths.
const PH_OLD = 'placeholder="Study engineering, competitive rugby, mild winters"';
const PH_NEW = 'placeholder="Engineering, good rugby, mild winters"';
rep('src/pages/Home.tsx', PH_OLD, PH_NEW);
rep('src/components/search/CollegeSearch.tsx', PH_OLD, PH_NEW);
rep('src/pages/Home.tsx', 'font-heading text-[22px] outline-none placeholder:text-faint', 'font-heading text-[18px] sm:text-[22px] outline-none placeholder:text-faint');
rep('src/components/search/CollegeSearch.tsx', 'font-heading text-[22px] md:text-[26px] outline-none placeholder:text-faint', 'font-heading text-[18px] sm:text-[22px] md:text-[26px] outline-none placeholder:text-faint');
// Training: readable labels on the dark navy block (WCAG AA). `.kicker` sets navy text, so the override needs `!`.
const TR = 'src/pages/Training.tsx';
rep(TR, '<p className="kicker mb-3 text-white/70">Paid coaching</p>', '<p className="kicker mb-3 !text-white/80">Paid coaching</p>');
rep(TR, '<p className="text-white/40 text-[11px] font-semibold uppercase tracking-caps mb-6">How it works</p>', '<p className="text-white/70 text-[11px] font-semibold uppercase tracking-caps mb-6">How it works</p>');
rep(TR, '<p className="text-white/45 text-[13px] leading-relaxed">{s.d}</p>', '<p className="text-white/70 text-[13px] leading-relaxed">{s.d}</p>');
rep(TR, 'Email to enquire about fit and pricing.', 'Email to ask about fit and pricing.');
rep(TR, 'subject=Coaching%20enquiry', 'subject=Coaching%20inquiry');
rep(TR, '<Mail size={15} /> Enquire about coaching', '<Mail size={15} /> Inquire about coaching');
rep(TR, 'paid individualised coaching', 'paid individualized coaching');
// Same navy-on-navy kicker bug on the other two dark blocks.
rep('src/pages/Home.tsx', '<p className="kicker mb-4 text-white/70">Stay Connected</p>', '<p className="kicker mb-4 !text-white/80">Stay Connected</p>');
const FC = 'src/pages/ForCoaches.tsx';
rep(FC, '<p className="kicker mb-3 text-white/70">Get in touch</p>', '<p className="kicker mb-3 !text-white/80">Get in touch</p>');
rep(FC, 'receive direct enquiries from qualified players.', 'receive direct inquiries from qualified players.');
rep(FC, 'and a direct enquiry button that lands', 'and a direct inquiry button that lands');
rep(FC, '<section id="enquire" className=', '<section id="inquire" className=');
rep('src/components/ContactForm.tsx', "submitLabel = 'Send enquiry'", "submitLabel = 'Send inquiry'");

// ───────────────────────── 9. robots.txt: open for launch ─────────────────────────
const ROBOTS = `User-agent: *
Allow: /

# AI assistants and their crawlers are explicitly welcome
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Bingbot
Allow: /

Sitemap: https://rugbycampus.org/sitemap.xml
`;
if (read('public/robots.txt') !== ROBOTS) { files.set('public/robots.txt', ROBOTS); changed++; }

// ───────────────────────── 10. Tests ─────────────────────────
const MT = 'src/lib/search/__tests__/match.test.ts';
rep(MT, 'expect(climates).toEqual({ warm_winters: 16, cool_winters: 22, cold_winters: 9 });', 'expect(climates).toEqual({ warm_winters: 10, cool_winters: 28, cold_winters: 9 });');
rep(MT, "    expect(e('st-thomas-university-florida', 'cold_winters')).toBe('miss');\n  });",
  "    expect(e('st-thomas-university-florida', 'cold_winters')).toBe('miss');\n    // 44°F winters are cool, not mild (Queens, Belmont Abbey, Life).\n    expect(e('queens-university-of-charlotte', 'warm_winters')).toBe('miss');\n    expect(e('queens-university-of-charlotte', 'cool_winters')).toBe('match');\n    expect(e('life-university', 'warm_winters')).toBe('miss');\n  });");
if (!fs.existsSync('src/lib/__tests__/launchFixes.test.ts')) {
  files.set('src/lib/__tests__/launchFixes.test.ts', `import { describe, expect, it } from 'vitest';
import { colleges, TIER_LABELS } from '@/data/colleges';
import { articles } from '@/data/articles';
import factsFile from '@/data/collegeSearchFacts.json';
import vercel from '../../../vercel.json';
import { RETIRED_SLUGS } from '@/lib/useColleges';
import { CLIMATE_LABEL, climateBand, climateFromTemps, summerLabel, weatherSentence } from '@/lib/search/display';

const F = (factsFile as unknown as { colleges: Record<string, { winter_avg_computed_f: number | null; summer_high_f: number | null; intl_warning: string | null }> }).colleges;
const bySlug = (s: string) => colleges.find((c) => c.slug === s)!;

describe('launch fixes (Oct 2026)', () => {
  it('ids and slugs are unique in the bundle', () => {
    expect(new Set(colleges.map((c) => c.id)).size).toBe(colleges.length);
    expect(new Set(colleges.map((c) => c.slug)).size).toBe(colleges.length);
  });

  it('one climate rule: table, weather sentence and search facts agree for every program with a table', () => {
    const withTable = colleges.filter((c) => c.monthlyTemps.length === 12);
    expect(withTable.length).toBe(39);
    for (const c of withTable) {
      const t = climateFromTemps(c.monthlyTemps)!;
      const f = F[c.slug];
      expect(climateBand(t.winter_avg_computed_f), c.slug).toBe(climateBand(f.winter_avg_computed_f));
      expect(summerLabel(t.summer_high_f), c.slug).toBe(summerLabel(f.summer_high_f!));
      expect(Math.abs(t.summer_high_f - f.summer_high_f!), c.slug).toBeLessThan(1);
      expect(c.weatherSummary, c.slug).toBe(weatherSentence(t));
    }
  });

  it('Queens is cool winters everywhere; UCLA summer sentence matches its table', () => {
    const q = bySlug('queens-university-of-charlotte');
    expect(climateBand(F[q.slug].winter_avg_computed_f)).toBe('cool_winters');
    expect(q.weatherSummary).toBe('Hot summers, cool winters.');
    expect(CLIMATE_LABEL.warm_winters).toBe('Mild winters');
    const u = bySlug('university-of-california-los-angeles-ucla');
    const summer = u.monthlyTemps.filter((m) => ['Jun', 'Jul', 'Aug'].includes(m.month)).map((m) => m.hF);
    expect(Math.round(summer.reduce((a, b) => a + b, 0) / 3)).toBe(Math.round(F[u.slug].summer_high_f!));
  });

  it('retired slugs return a real 404 (or redirect) before the SPA catch-all', () => {
    const v = vercel as { redirects: { source: string }[]; rewrites: { source: string; destination: string }[] };
    const catchAll = v.rewrites.findIndex((r) => r.destination === '/index.html');
    for (const slug of RETIRED_SLUGS) {
      const path = \`/colleges/\${slug}\`;
      const redirected = v.redirects.some((r) => r.source === path);
      const i = v.rewrites.findIndex((r) => r.source === path && r.destination === '/api/gone');
      expect(redirected || (i >= 0 && i < catchAll), slug).toBe(true);
    }
  });

  it('Hugh-locked data: blank coaches, Walsh tier, CSU link', () => {
    for (const s of ['the-ohio-state-university', 'university-of-utah', 'western-washington-university']) expect(bySlug(s).coachName, s).toBe('');
    expect(bySlug('western-washington-university').description).not.toMatch(/Adam Roberts/);
    expect(bySlug('walsh-university').tier).toBe('playoff');
    expect(TIER_LABELS.playoff).toBe('Playoff caliber');
    expect(bySlug('colorado-state-university').rugbyProgramUrl).toBe('https://www.coloradostaterugby.com/');
  });

  it('no internal editing notes or over-claims in visible copy', () => {
    const text = articles.map((a) => a.content).join('\\n') + Object.values(F).map((f) => f.intl_warning ?? '').join('\\n');
    for (const bad of ['do not hard-claim', 'Soft line only', 'avoid the word', 'check before getting excited', 'every Rugby Campus profile includes', 'prospecting rugby', 'Powerhouse', 'World-class', 'Honours', 'enquir', 'calibre']) {
      expect(text.includes(bad), bad).toBe(false);
    }
    const best = articles.find((a) => a.slug === 'best-rugby-colleges-usa')!.content;
    expect(best).not.toMatch(/top of NCR D1[^.]*Walsh/i);
  });
});
`);
  changed++;
}

// ───────────────────────── 11. Docs for Hugh and for agents ─────────────────────────
const SG = 'SETUP-GUIDE.md';
rep(SG, '### 2.2 Create the tables and load all 40 colleges', '### 2.2 Create the tables (first-time setup only — already done for the live site)');
rep(SG, '4. You should see "Success". That one click created 3 tables and loaded all 40 colleges.', '4. You should see "Success". That one click created 3 tables and loaded the original 40 colleges. **Never run the whole file again on the live database** — use the dated blocks in Part 5.');
{
  const s = read(SG);
  const a = s.indexOf('## Part 5 — 2026–27 data update (do this once)');
  const b = s.indexOf('## Part 6 — Going public');
  const NEW5 = `## Part 5 — 2026–27 data update (do this once, after the PR is merged)

Your Supabase database still has the old rows. **Do not paste the whole of \`supabase-setup.sql\`** — the top half fails on a database that already exists ("policy … already exists") and nothing runs. Run only the three dated blocks at the bottom, one at a time, in this order:

1. Supabase → SQL Editor → New query. In \`supabase-setup.sql\`, copy from the line starting \`-- ── Walkthrough fixes 2026-10-06\` down to the line just before \`-- ── Follow-up fixes 2026-10-06\`. Paste → **Run** → you should see "Success".
2. New query. Copy from \`-- ── Follow-up fixes 2026-10-06\` down to the line just before \`-- ── Correction UCLA/Iona 2026-10-07\`. Paste → **Run** → "Success".
3. New query. Copy from \`-- ── Correction UCLA/Iona 2026-10-07\` to the end of the file. Paste → **Run** → "Success".

Each block is safe to run twice. If one shows an error, stop and send the error text — don't run the next block.

Then refresh the site: 47 programs, UCLA shows dual NCR D1 / CRAA, St. Thomas (Florida) is in, Iona is gone.

Weather tables and the weather sentence now come from the repo (NOAA), so the \`weather_summary\` and \`monthly_temps\` columns in Supabase no longer change what the site shows for these 47 programs.

`;
  if (a >= 0 && b > a) { files.set(SG, s.slice(0, a) + NEW5 + s.slice(b)); changed++; }
  else if (!s.includes('Run only the three dated blocks')) fail('SETUP-GUIDE.md: Part 5 / Part 6 headings not found');
  else skipped++;
}
rep(SG, "1. In the `public` folder, delete `robots.txt` and rename `robots.public.txt` to `robots.txt`. Push.\n   (The public version explicitly welcomes Google, Bing, GPTBot, ClaudeBot and PerplexityBot, and points them at your sitemap.)",
  "1. Done already: `public/robots.txt` now lets Google, Bing, GPTBot, ClaudeBot and PerplexityBot in, and points them at your sitemap (launch-fixes paste, Oct 2026).");
rep(SG, "These 12 programs have no head coach on file. Fix them in Supabase → Table Editor → colleges → `coach_name` / `coach_email`:\nDartmouth, Notre Dame, Ohio State, Marian, Michigan, Southern Nazarene, Santa Clara, San Diego, Utah, Walsh, Western Washington.",
  "After the three SQL blocks, these 12 programs show no head coach (the page says \"To be confirmed\"):\n\n- **In Supabase** (fix in Table Editor → colleges → `coach_name` / `coach_email`): Arkansas State, Indiana, Ohio State, Utah, Western Washington.\n- **Not in Supabase yet** (ask Cursor to add the coach in `src/data/colleges.ts`): Aquinas, Colorado State, Cal State Long Beach, CU Boulder, Fordham, Indiana Tech, Rio Grande.\n\nIndiana: the repo has Luke Gross but the live row is blank, so the site shows blank. Decide which is right.");

const AG = 'AGENTS.md';
rep(AG, 'robots.txt (currently BLOCKING), robots.public.txt, llms.txt', 'robots.txt (public: allows crawlers, lists the sitemap), llms.txt');
rep(AG, "3. **`public/robots.txt`** currently contains `Disallow: /` **on purpose** — the site is deliberately private pre-launch. Never \"fix\" this. Going public is a manual step by Hugh (swap in `robots.public.txt`).",
  "3. **`public/robots.txt`** is public since the Oct 2026 launch fixes (allows all crawlers, AI crawlers named, sitemap listed). Don't change it back to `Disallow: /` unless Hugh asks.");
rep(AG, 'Deployed to Vercel, **private** (robots blocked), custom domain not yet attached.', 'Deployed to Vercel; robots.txt is public (launch, Oct 2026); custom domain not yet attached.');
rep(AG, '`playoff` (Playoff calibre,', '`playoff` (Playoff caliber,');
rep(AG, '12 programs have empty `coachName` — that is correct', 'Some programs have an empty `coachName` — that is correct');
rep(AG, '1. Fill the 12 empty coach records (Hugh is verifying; do not invent).', '1. Fill the empty coach records (Hugh is verifying; do not invent). SETUP-GUIDE.md lists them.');
rep('.cursorrules', '1. public/robots.txt contains "Disallow: /" ON PURPOSE. The site is private\n   pre-launch. Never change it.', '1. public/robots.txt is PUBLIC since the Oct 2026 launch (allows crawlers,\n   lists the sitemap). Never change it back to "Disallow: /" unless Hugh asks.');
rep('.cursorrules', '"prerendered 62 pages + sitemap.xml + llms-full.txt"', '"prerendered 61 pages + sitemap.xml + llms-full.txt" (61 with 47 programs)');
rep('TASKS.md', '- [ ] Confirm `public/robots.txt` still contains `Disallow: /`.', '- [ ] Confirm `public/robots.txt` allows crawlers and lists the sitemap (public since Oct 2026).');
rep('TASKS.md', 'confirm it prints "✓ built" AND "prerendered 62 pages + sitemap.xml + llms-full.txt".', 'confirm it prints "✓ built" AND "prerendered 61 pages + sitemap.xml + llms-full.txt" (61 with 47 programs).');

// ───────────────────────── write ─────────────────────────
for (const [p, s] of files) {
  const onDisk = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (onDisk !== s) fs.writeFileSync(p, s);
}
let removed = 0;
if (fs.existsSync('public/robots.public.txt')) { fs.rmSync('public/robots.public.txt'); removed++; }
console.log(`launch fixes: ${changed} edits applied, ${skipped} already done, ${removed} file removed (robots.public.txt)`);
