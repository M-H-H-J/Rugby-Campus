// scripts/apply-correction-ucla-iona.mjs  (one-off, safe to re-run)
// After walkthrough + follow-up. Does NOT write to Supabase.
// 1) Drop Iona from colleges.ts + collegeSearchFacts.json
// 2) UCLA dual NCR D1 / CRAA dual; description says it plays both
// 3) Kutztown → Jeff Duke, blank email; Cal Poly keeps ob13@sbcglobal.net; Queens confirm Tyree Reed
// 4) Set recruitmentFormUrl for verified school forms
// 5) Append SQL block for Hugh after merge
import fs from 'node:fs';

const IONA = 'iona-university';
const UCLA = 'university-of-california-los-angeles-ucla';
const UCLA_DESC =
  'UCLA plays both NCR Division 1 and CRAA D1A for 2026–27. In 2025–26 it played CRAA D1A, going 5–2 in the southern half of the California Conference. Home games are at Wallis Annenberg Stadium, and the team runs through UCLA Club Sports.';
const UCLA_AFF = 'NCR D1 / CRAA dual';

const EDITS = {
  [UCLA]: { affiliation: UCLA_AFF, description: UCLA_DESC },
  'kutztown-university': { coachName: 'Jeff Duke', coachEmail: '' },
  'california-polytechnic-state-university': { coachEmail: 'ob13@sbcglobal.net' },
  'queens-university-of-charlotte': { coachName: 'Tyree Reed', coachEmail: 'reedt2@queens.edu' },
};

/** Verified 2026-10-07 — see RECRUITMENT-FORMS-2026-10-07.md (Hugh has the research copy). */
const FORMS = {
  'queens-university-of-charlotte': 'https://questionnaires.armssoftware.com/3a2844a9d2bb',
  'st-bonaventure-university': 'https://admissions.sbu.edu/register/men_rugby',
  'lindenwood-university': 'https://lindenwoodsl-sports.com/sb_output.aspx?form=3',
  'united-states-naval-academy': 'https://questionnaires.armssoftware.com/c201f880feaa',
  'walsh-university': 'https://athletics.walsh.edu/sb_output.aspx?form=4',
  'marian-university': 'https://muknights.com/sb_output.aspx?form=3',
  'davenport-university': 'https://questionnaires.armssoftware.com/51e171a97e12',
  'thomas-more-university': 'https://questionnaires.armssoftware.com/ea57063a3d3e',
  'mount-st-mary-s-university': 'https://questionnaires.armssoftware.com/7b1d8150c7fb',
  'wheeling-university': 'https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=NDY0MQ==-QjDUpcgOe7E=&ptype=Recruit',
};

const fail = (m) => { console.error('STOP:', m); process.exit(1); };
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

let ts = fs.readFileSync('src/data/colleges.ts', 'utf8');
if (!ts.includes('st-thomas-university-florida')) fail('follow-up St. Thomas (Florida) not found. Run LOCAL-AGENT-PASTE-followup-stthomas-labels.md first.');
if (!ts.includes('St. Bonaventure won the 2025 NCR Division 1 national title')) fail('walkthrough descriptions not found. Run LOCAL-AGENT-PASTE-walkthrough-fixes.md first.');

// Ensure optional field on the interface (once).
if (!/recruitmentFormUrl\?: string;/.test(ts)) {
  if (!/coachName: string; coachEmail: string;/.test(ts)) fail('College interface coach fields not found');
  ts = ts.replace(
    /coachName: string; coachEmail: string;/,
    'coachName: string; coachEmail: string;\n  /** Public recruitment / interest form on the school site. Omit when unknown. */\n  recruitmentFormUrl?: string;',
  );
}

let parts = ts.split(/(?=\n  \{\n    id: )/);
const slugOf = (blk) => (blk.match(/slug: "([^"]+)"/) || [])[1];
const before = parts.filter((b) => slugOf(b)).length;
parts = parts.filter((b) => {
  const s = slugOf(b);
  return !s || s !== IONA;
});
const after = parts.filter((b) => slugOf(b)).length;
if (before === after && after !== 47) {
  // already removed?
  if (!parts.some((b) => slugOf(b) === IONA) && after === 47) {
    // ok, already done
  } else fail(`expected to drop Iona from ${before} → 47, got ${after}`);
}
if (after !== 47) fail(`expected 47 programs after dropping Iona, found ${after}`);

const setStr = (blk, key, val, slug) => {
  const re = new RegExp(`${key}: "(?:[^"\\\\]|\\\\.)*"`);
  if (!re.test(blk)) fail(`${slug}: no ${key}`);
  return blk.replace(re, () => `${key}: ${JSON.stringify(val)}`);
};

const seen = new Set();
let fieldEdits = 0;
parts = parts.map((blk) => {
  const slug = slugOf(blk);
  if (!slug) return blk;
  seen.add(slug);
  const e = EDITS[slug];
  if (e) {
    for (const k of Object.keys(e)) blk = setStr(blk, k, e[k], slug);
    fieldEdits++;
  }
  const form = FORMS[slug];
  if (form) {
    if (/recruitmentFormUrl: "/.test(blk)) {
      blk = setStr(blk, 'recruitmentFormUrl', form, slug);
    } else if (/rugbyProgramUrl: "(?:[^"\\]|\\.)*",/.test(blk)) {
      blk = blk.replace(/rugbyProgramUrl: "(?:[^"\\]|\\.)*",/, (m) => `${m}\n    recruitmentFormUrl: ${JSON.stringify(form)},`);
    } else {
      fail(`${slug}: no rugbyProgramUrl to hang recruitmentFormUrl on`);
    }
  }
  return blk;
});

for (const s of Object.keys(EDITS)) if (!seen.has(s)) fail('edit slug missing: ' + s);
for (const s of Object.keys(FORMS)) if (!seen.has(s)) fail('form slug missing: ' + s);

ts = parts.join('');
if ((ts.match(/\n  \{\n    id: /g) || []).length !== 47) fail('count check failed');
if (ts.includes(`slug: "${IONA}"`)) fail('Iona still in colleges.ts');
fs.writeFileSync('src/data/colleges.ts', ts);
console.log(`colleges.ts: Iona removed; ${fieldEdits}/${Object.keys(EDITS).length} programs edited; ${Object.keys(FORMS).length} recruitmentFormUrl set; 47 programs`);

// ---- facts ----
const FP = 'src/data/collegeSearchFacts.json';
const facts = JSON.parse(fs.readFileSync(FP, 'utf8'));
if (!(IONA in facts.colleges) && Object.keys(facts.colleges).length !== 47) {
  fail(`facts: Iona missing but count is ${Object.keys(facts.colleges).length}, expected 47`);
}
delete facts.colleges[IONA];
if (Object.keys(facts.colleges).length !== 47) fail(`facts: expected 47, found ${Object.keys(facts.colleges).length}`);
fs.writeFileSync(FP, JSON.stringify(facts));
console.log('collegeSearchFacts.json: Iona removed; 47 entries');

// ---- SQL append ----
let sql = fs.readFileSync('supabase-setup.sql', 'utf8');
const marker = '-- ── Correction UCLA/Iona 2026-10-07';
if (!sql.includes(marker)) {
  const lines = [
    `\n${marker} (drop Iona; UCLA dual; Kutztown Jeff Duke; Cal Poly personal email; Queens confirm; safe to re-run). HUGH ONLY: run in the Supabase SQL Editor after the PR is merged, after the walkthrough and follow-up blocks above. ──`,
    `-- 1. Remove Iona from the live directory (NCR D1AA; out of the curated top-level list).`,
    `delete from colleges where slug=${q(IONA)};`,
    `-- 2. UCLA is dual NCR D1 and CRAA D1A (same label pattern as Indiana).`,
    `update colleges set affiliation=${q(UCLA_AFF)}, description=${q(UCLA_DESC)} where slug=${q(UCLA)};`,
    `-- 3. Kutztown head coach stays Jeff Duke. Live email was blank — leave blank (do not invent).`,
    `update colleges set coach_name=${q('Jeff Duke')}, coach_email=${q('')} where slug=${q('kutztown-university')};`,
    `-- 4. Cal Poly: keep the personal sbcglobal email already on the live row.`,
    `update colleges set coach_email=${q('ob13@sbcglobal.net')} where slug=${q('california-polytechnic-state-university')};`,
    `-- 5. Queens: confirm Tyree Reed.`,
    `update colleges set coach_name=${q('Tyree Reed')}, coach_email=${q('reedt2@queens.edu')} where slug=${q('queens-university-of-charlotte')};`,
  ];
  sql += lines.join('\n') + '\n';
  fs.writeFileSync('supabase-setup.sql', sql);
  console.log('supabase-setup.sql: correction block appended');
} else {
  console.log('supabase-setup.sql: correction block already present');
}
