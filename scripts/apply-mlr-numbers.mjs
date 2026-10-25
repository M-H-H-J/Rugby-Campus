// scripts/apply-mlr-numbers.mjs  (one-off, safe to re-run)
// Rewrites the MLR draft numbers in src/data/colleges.ts and supabase-setup.sql from the verified report
// (rugby-campus-search/MLR-DRAFT-VERIFY-2026-10-02.md, 217 official picks 2020-26).
// Table: slug: [drafted, played >=1 MLR match (confirmed), no appearance recorded, unconfirmed, 2026 class (no season yet)]
// Every row adds up: drafted = played + noAppearance + unconfirmed + notYet. Programs not listed had no draftees (all zero).
// Walsh is the combined figure: Walsh 3 + Notre Dame College 3 (the program moved to Walsh; NDC closed in 2024).
import fs from 'node:fs';
const MLR = {
 'arkansas-state-university': [6, 3, 1, 1, 1],
 'brigham-young-university': [5, 2, 2, 1, 0],
 'brown-university': [2, 1, 0, 0, 1],
 'california-polytechnic-state-university': [2, 1, 0, 0, 1],
 'california-state-university-long-beach': [1, 0, 1, 0, 0],
 'dartmouth-college': [4, 3, 0, 1, 0],
 'davenport-university': [1, 0, 1, 0, 0],
 'fairfield-university': [1, 0, 0, 1, 0],
 'grand-canyon-university': [1, 1, 0, 0, 0],
 'indiana-university': [3, 2, 1, 0, 0],
 'iona-university': [2, 2, 0, 0, 0],
 'kutztown-university': [7, 5, 2, 0, 0],
 'life-university': [17, 13, 1, 1, 2],
 'lindenwood-university': [23, 16, 4, 2, 1],
 'marian-university': [1, 1, 0, 0, 0],
 'mount-st-mary-s-university': [2, 0, 0, 1, 1],
 'pennsylvania-state-university': [7, 4, 2, 1, 0],
 'queens-university-of-charlotte': [4, 0, 3, 1, 0],
 'saint-mary-s-college-of-california': [14, 9, 0, 3, 2],
 'santa-clara-university': [3, 1, 2, 0, 0],
 'st-bonaventure-university': [5, 2, 1, 1, 1],
 'the-ohio-state-university': [2, 1, 1, 0, 0],
 'thomas-more-university': [3, 2, 1, 0, 0],
 'united-states-military-academy-army': [2, 2, 0, 0, 0],
 'university-of-arizona': [6, 4, 1, 1, 0],
 'university-of-california-berkeley': [10, 5, 0, 3, 2],
 'university-of-california-los-angeles-ucla': [6, 3, 0, 3, 0],
 'university-of-mary-washington': [3, 1, 0, 1, 1],
 'university-of-notre-dame': [1, 1, 0, 0, 0],
 'university-of-san-diego': [2, 1, 0, 1, 0],
 'university-of-utah': [1, 1, 0, 0, 0],
 'walsh-university': [6, 3, 1, 1, 1],
 'wheeling-university': [1, 0, 0, 1, 0],
};
const NOTES = { 'walsh-university': 'Includes 3 players drafted as Notre Dame College (closed 2024), whose program moved to Walsh.' };
const BADGE_OVERRIDE = { 'walsh-university': '6 drafted into MLR (3 as Notre Dame College) · 3 played' };
const badgeFor = (slug) => {
  const r = MLR[slug]; if (!r) return null;
  const [D, P] = r;
  if (BADGE_OVERRIDE[slug]) return BADGE_OVERRIDE[slug];
  return P > 0 ? `${D} drafted into MLR · ${P} played` : `${D} drafted into MLR · none confirmed played`;
};

// ---- 1. src/data/colleges.ts ----
let ts = fs.readFileSync('src/data/colleges.ts', 'utf8');
const parts = ts.split(/(?=\n  \{\n    id: )/);
let touched = 0;
const newBadgeBySlug = {};
const out = parts.map((blk) => {
  const sm = blk.match(/slug: "([^"]+)"/); if (!sm) return blk;
  const slug = sm[1];
  const r = MLR[slug] ?? [0, null, 0, 0, 0];
  const [D, P, Z, U, Y] = r;
  const note = NOTES[slug] ? ` mlrNote: ${JSON.stringify(NOTES[slug])},` : '';
  blk = blk.replace(/draftPicks: \d+,(?: mlrPlayed: [^,]+, mlrUnconfirmed: \d+, mlrNoAppearance: \d+, mlrNotYet: \d+,(?: mlrNote: "[^"]*",)?)? playerCount:/,
    `draftPicks: ${D}, mlrPlayed: ${P === null ? 'null' : P}, mlrUnconfirmed: ${U}, mlrNoAppearance: ${Z}, mlrNotYet: ${Y},${note} playerCount:`);
  blk = blk.replace(/badges: (\[[^\]]*\])/, (_, arr) => {
    const kept = JSON.parse(arr).filter((b) => !/MLR/i.test(b));
    const nb = badgeFor(slug); if (nb) kept.push(nb);
    newBadgeBySlug[slug] = nb;
    return 'badges: ' + JSON.stringify(kept);
  });
  touched++;
  return blk;
});
ts = out.join('');
const DESC = [
  ['Varsity CRAA D1A in Rugby East, with 8 MLR draft picks.', 'Varsity CRAA D1A in Rugby East, with 17 players drafted in the MLR College Draft (2020–26), 13 of them confirmed to have played an MLR match.'],
  ['has produced 17 MLR draft picks.', 'has had 23 players drafted in the MLR College Draft (2020–26), 16 of them confirmed to have played an MLR match.'],
  ['live scoreboards and video replay — with 4 MLR draft picks.', 'live scoreboards and video replay — with 6 players drafted in the MLR College Draft (2020–26), 3 of them confirmed to have played an MLR match.'],
  ['under head coach Tui Osbourne, with 4 MLR draft picks.', 'under head coach Tui Osbourne, with 5 players drafted in the MLR College Draft (2020–26), 2 of them confirmed to have played an MLR match.'],
  ['transitioning to NCAA Division I athletics. Three MLR draft picks.', 'transitioning to NCAA Division I athletics. Four players drafted in the MLR College Draft (2020–26), none confirmed to have played an MLR match yet.'],
  ['Kutztown has seven MLR draft picks.', 'Kutztown has had seven players drafted in the MLR College Draft (2020–26), five of them confirmed to have played an MLR match.'],
  ['plays NCR D1 in the Big Rivers Conference. Three MLR draft picks.', 'plays NCR D1 in the Big Rivers Conference. Three players drafted in the MLR College Draft (2020–26), two of them confirmed to have played an MLR match.'],
  ['just north of New York City. Two MLR draft picks.', 'just north of New York City. Two players drafted in the MLR College Draft (2020–26), both confirmed to have played an MLR match.'],
];
let descDone = 0;
for (const [a, b] of DESC) { if (ts.includes(a)) { ts = ts.split(a).join(b); descDone++; } }
fs.writeFileSync('src/data/colleges.ts', ts);
console.log(`colleges.ts: ${touched} programs updated, ${descDone}/8 description sentences replaced (re-runs report fewer: that is fine)`);

// ---- 2. supabase-setup.sql (seed rows + an idempotent update block for Hugh to run later) ----
let sql = fs.readFileSync('supabase-setup.sql', 'utf8');
const SQLDESC = [
  ['and have produced four MLR draft picks.', 'and have had six players drafted in the MLR College Draft (2020–26), three of them confirmed to have played an MLR match.'],
  ['with seven MLR draft picks to its name.', 'with seven players drafted in the MLR College Draft (2020–26), five of them confirmed to have played an MLR match.'],
  ['The Saints have sent three players to the MLR draft and offer', 'Three players have been drafted in the MLR College Draft (2020–26), two of them confirmed to have played an MLR match. The Saints offer'],
  ['With two MLR draft picks and a location', 'With two players drafted in the MLR College Draft (2020–26), both confirmed to have played an MLR match, and a location'],
];
for (const [a, b] of SQLDESC) sql = sql.split(a).join(b);
const sqlBlocks = sql.split(/(?=\ninsert into colleges )/);
let seeded = 0;
sql = sqlBlocks.map((blk) => {
  const sm = blk.match(/^\ninsert into colleges[^\n]*values \(\n  '([^']+)'/); if (!sm) return blk;
  const slug = sm[1]; const r = MLR[slug]; if (!r) return blk;
  // draft_picks is the first number of the line "  <draft>,<player_count>,'coach'..."
  blk = blk.replace(/\n  (\d+),(\d+),'/, (_, d, pc) => `\n  ${r[0]},${pc},'`);
  // badges = the first JSON array of the line that holds two arrays (badges, achievements)
  blk = blk.replace(/\n  '(\[[^\n]*?\])','(\[[^\n]*?\])',\n/, (m0, badges, ach) => {
    const kept = JSON.parse(badges).filter((b) => !/MLR/i.test(b)); const nb = badgeFor(slug); if (nb) kept.push(nb);
    return `\n  '${JSON.stringify(kept).replace(/'/g, "''")}','${ach}',\n`;
  });
  seeded++;
  return blk;
}).join('');
const marker = '-- ── MLR draft numbers (corrected';
if (!sql.includes(marker)) {
  const lines = Object.keys(MLR).sort().map((s) => {
    const nb = badgeFor(s).replace(/'/g, "''");
    return `update colleges set draft_picks=${MLR[s][0]}, badges=(select coalesce(jsonb_agg(b), '[]'::jsonb) from jsonb_array_elements(badges) b where b::text !~* 'MLR') || '${JSON.stringify([badgeFor(s)]).replace(/'/g, "''")}'::jsonb where slug='${s}';`;
  });
  sql += `\n-- ── MLR draft numbers (corrected 2026-10-02; safe to re-run). HUGH ONLY: run in the Supabase SQL Editor after the PR is merged. ──\n-- Drafted = picked in the official MLR College Draft 2020-26. It does NOT mean he played. Played counts live in the site code, not in this table.\n` + lines.join('\n') + '\n';
}
fs.writeFileSync('supabase-setup.sql', sql);
console.log(`supabase-setup.sql: ${seeded} seed rows updated, update block present`);
