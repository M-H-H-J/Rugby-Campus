// scripts/apply-followup-data.mjs  (one-off, safe to re-run)
// Follow-up to scripts/apply-walkthrough-data.mjs (run that one first; it is a one-off and won't re-run after this,
// because the Minnesota slug it lists is gone).
// 1) Replaces University of St. Thomas (Minnesota) with St. Thomas University (Miami Gardens, Florida), CRAA D1A Independent,
//    in src/data/colleges.ts and src/data/collegeSearchFacts.json (same id 26, new slug st-thomas-university-florida).
// 2) League labels, head coaches, badges and honours checked against CRAA, NCR, school pages and results (Oct 2026).
// 3) Appends one SQL block to supabase-setup.sql for Hugh to run after the merge. Nothing here writes to Supabase.
import fs from 'node:fs';

const OLD = 'university-of-st-thomas-minnesota';
const NEW = 'st-thomas-university-florida';
const STU_BLOCK = `
  {
    id: 26, slug: "st-thomas-university-florida", name: "St. Thomas University (Florida)",
    location: "Miami Gardens, Florida", state: "Florida", region: "southeast",
    lat: 25.9221, lng: -80.2533, mapX: 808.3, mapY: 560.1,
    affiliation: "CRAA D1A", conference: "Independent", tier: "emerging", programType: "Varsity",
    draftPicks: 0, mlrPlayed: null, mlrUnconfirmed: 0, mlrNoAppearance: 0, mlrNotYet: 0, playerCount: 0,
    coachName: "Gavin McLeavy", coachEmail: "gmcleavy@stu.edu",
    rugbyProgramUrl: "https://stubobcats.com/sports/mens-rugby", assistantCoaches: [],
    description: "St. Thomas University added men's rugby as a varsity sport in fall 2022 under founding head coach Gavin McLeavy, and won the 2025 CRAA D1AA national title, beating San Diego 38–32 in the final. Moving up to D1A as an independent in 2025–26, the Bobcats won at Queens and reached the semifinals of the 2026 D1A Challenger Cup, losing 30–23 to Davenport. The university is in Miami Gardens, Florida, about 11 miles north of downtown Miami.",
    enrollment: 7652, popularMajors: ["Nursing", "Business", "Criminal Justice", "Biology"],
    weatherSummary: "Hot summers, warm winters.",
    monthlyTemps: [{month:"Jan",hF:77,lF:59,hC:25,lC:15},{month:"Feb",hF:79,lF:61,hC:26,lC:16},{month:"Mar",hF:81,lF:64,hC:27,lC:18},{month:"Apr",hF:84,lF:68,hC:29,lC:20},{month:"May",hF:87,lF:72,hC:31,lC:22},{month:"Jun",hF:90,lF:76,hC:32,lC:24},{month:"Jul",hF:91,lF:76,hC:33,lC:25},{month:"Aug",hF:91,lF:77,hC:33,lC:25},{month:"Sep",hF:90,lF:76,hC:32,lC:24},{month:"Oct",hF:86,lF:73,hC:30,lC:23},{month:"Nov",hF:82,lF:66,hC:28,lC:19},{month:"Dec",hF:78,lF:62,hC:26,lC:17}],
    badges: ["2025 CRAA D1AA National Champions"], achievements: ["2026 D1A Challenger Cup semifinalists"],
    website: "https://www.stu.edu", imageUrl: "/college-images/st-thomas-university-florida.jpg", imageCredit: "Photo: Stthomaslaw / Wikimedia Commons (CC BY-SA 4.0)", imageSourcePage: "https://commons.wikimedia.org/wiki/File:Visit%20St%20Thomas%20Law%20Miami.jpg", gender: "mens",
  },`;
const STU_FACTS = {"unitid":137476,"name":"St. Thomas University (Florida)","city_state":"Miami Gardens, FL","state":"FL","region_census":"South","control":"private_nonprofit","setting":"suburb","enrollment_undergrad":4486,"size_band":"medium","athletics_division":"naia","football_level":"naia","has_football":true,"athletics_conference":"The Sun Conference","football_conference":"The Sun Conference","mens_rugby_program_type":"varsity","rugby_tier":"emerging","tuition_fees_in_state":34544,"tuition_fees_out_of_state":34544,"total_cost_in_state":54904,"total_cost_out_of_state":54904,"cost_basis":"official_coa","cost_year":"2026-27","religious_affiliation":"Roman Catholic","religion_group":"catholic","winter_avg_computed_f":69.4,"summer_high_f":90.5,"climate_tag":"Mild winters","freezing_nights_per_year":0,"nearest_airport_iata":"MIA","nearest_airport_name":"Miami International Airport","airport_distance_miles":9,"big_sport_tag":"NAIA","intl_admission_route":"standard","intl_warning":null,"test_policy":"not_considered","acceptance_rate":97.9,"graduation_rate_6yr":48,"majors_top":["Health professions (46%)","Business & management (33%)","Security & criminal justice (6%)","Biological & biomedical sciences (3%)","Psychology (3%)","Computer & information sciences (3%)"],"majors_cip2":{"51":218,"52":157,"43":27,"26":14,"42":14,"11":12,"45":9,"27":5,"30":5,"09":4,"13":2,"23":2,"31":2,"38":2,"40":2,"39":1},"majors_programs":[["Registered Nursing, Nursing Administration, Nursing Research and Clinical Nursing",203],["Business Administration, Management and Operations",107],["Criminal Justice and Corrections",27],["Health/Medical Preparatory Programs",15],["Business/Commerce, General",15],["Biology, General",14],["Psychology, General",14],["International Business",14]],"prov":{"athletics_conference":{"c":"medium","u":"https://nces.ed.gov/ipeds/datacenter/institutionprofile.aspx?unitId=137476","d":"2024-25"},"football_conference":{"c":"medium","u":"https://nces.ed.gov/ipeds/datacenter/institutionprofile.aspx?unitId=137476","d":"2026-10-06"},"tuition_fees_in_state":{"c":"medium","u":"https://www.stu.edu/cost-of-attendance/","d":"2026-27"},"total_cost_in_state":{"c":"medium","u":"https://www.stu.edu/cost-of-attendance/","d":"2026-27"},"total_cost_out_of_state":{"c":"medium","u":"https://www.stu.edu/cost-of-attendance/","d":"2026-27"},"climate_tag":{"c":"medium","u":"https://www.ncei.noaa.gov/data/normals-monthly/1991-2020/access/USW00012882.csv","d":"1991-2020"},"majors_cip2":{"c":"medium","u":"https://nces.ed.gov/ipeds/datacenter/institutionprofile.aspx?unitId=137476","d":"2023-24"},"setting":{"c":"high","u":"https://nces.ed.gov/ipeds/datacenter/institutionprofile.aspx?unitId=137476","d":"2026-10-06"},"size_band":{"c":"medium","u":"https://nces.ed.gov/ipeds/datacenter/institutionprofile.aspx?unitId=137476","d":"2026-10-06"},"nearest_airport_iata":{"c":"medium","u":"https://ourairports.com/data/","d":"2026-10-06"},"religion_group":{"c":"high","u":"https://nces.ed.gov/ipeds/datacenter/institutionprofile.aspx?unitId=137476","d":"2026-10-06"},"football_level":{"c":"high","u":"https://nces.ed.gov/ipeds/datacenter/institutionprofile.aspx?unitId=137476","d":"2024-25"},"athletics_division":{"c":"high","u":"https://ope.ed.gov/athletics/api/dataFiles/file?fileName=EADA_2024-2025.zip","d":"2024-25"},"cost":{"c":"medium","u":"https://www.stu.edu/cost-of-attendance/","d":"2026-27"},"flights_airport_iata":{"c":"medium","u":"https://www.faa.gov/airports/planning_capacity/passenger_allcargo_stats/passenger","d":"2026-10-06"},"campus_feel":{"c":"medium","u":"https://nces.ed.gov/ipeds/datacenter/institutionprofile.aspx?unitId=137476","d":"2026-10-06"}},"campus_feel":"suburb","flights_airport_iata":"MIA","flights_airport_name":"Miami International Airport","flights_airport_miles":9,"flights_airport_limited":false,"safety_clery":null,"rugby_aid":null};

// Per-program changes. badges = the non-MLR badges (the existing "N drafted into MLR" badge is kept and stays last).
// Only the keys listed are changed.
const EDITS = {
  'university-of-california-berkeley': { conference: 'Independent', achievements: ['30 national 15s titles and 5 national 7s titles (as of 2026)', '9 PAC Rugby 7s titles'] },
  'united-states-naval-academy': { achievements: ['2023 D1A National Champions', '2025–26 Rugby East champions (5–0)'] },
  'life-university': { achievements: ['4× D1A National Champions (2013, 2016, 2018, 2019)'] },
  'lindenwood-university': { achievements: ['2025–26 Midwest Conference champions (5–0)'] },
  'saint-mary-s-college-of-california': { achievements: ['4× D1A National Champions (2014, 2015, 2017, 2024)'] },
  'united-states-military-academy-army': { achievements: ['2022 D1A National Champions'] },
  'university-of-california-los-angeles-ucla': { affiliation: 'NCR D1', conference: 'Independent' },
  'brown-university': { achievements: ['2022 and 2024 NCR D1 National Champions'] },
  'mount-st-mary-s-university': { achievements: ['2016 NSCRO National Champions'] },
  'brigham-young-university': { achievements: ['5 National Championships', '2025–26 Rocky Mountain Conference champions (5–0)'] },
  'university-of-arizona': { achievements: ['2026 D1A quarterfinalists'] },
  'pennsylvania-state-university': { coachName: 'Zac Mizell', coachEmail: 'zvm5239@psu.edu', achievements: ['2021 NCR D1 National Finalists', '2018 D1A semifinalists'] },
  'dartmouth-college': { achievements: ['2019 D1-AA Spring Championship'] },
  'california-polytechnic-state-university': { achievements: [] },
  'st-bonaventure-university': { coachName: 'Daniel Neighbour', coachEmail: 'dneighbo@sbu.edu', achievements: ['2021 NCR D1 National Champions', '2023 NCR D1 National Finalists'] },
  'arkansas-state-university': { coachName: '', coachEmail: '', achievements: ['2012, 2013 USA Rugby 7s National Champions', '2012 D1A National Finalists'] },
  'grand-canyon-university': { achievements: ['2025 D1A Challenger Cup finalists'] },
  'university-of-mary-washington': { coachName: 'Andrew Spencer', coachEmail: 'aspence8@umw.edu', achievements: ["2017 Men's D1AA Fall Champions", '2025 D1A Challenger Cup champions'] },
  'queens-university-of-charlotte': { coachName: 'Tyree Reed', coachEmail: 'reedt2@queens.edu', achievements: [] },
  'university-of-notre-dame': { achievements: ['2025 Big Ten Universities champions', '2025 NCR D1 quarterfinalists'] },
  'the-ohio-state-university': { conference: 'Midwest', badges: ['2024 Big Ten Universities champions'], achievements: [] },
  'davenport-university': { coachName: 'Dominique Bailey', coachEmail: 'dominique.bailey@davenport.edu', achievements: ['2010/11 D1AA National Champions', '2011/12 D1AA National Champions', '2026 D1A Challenger Cup champions'] },
  'marian-university': { achievements: ['2025 Big Rivers champions', '2025 NCR D1 quarterfinalists', '2026 Big Rivers 7s champions'] },
  'university-of-michigan': { achievements: [] },
  'indiana-university': { achievements: ["7x Big Ten 15's Champions"] },
  'wheeling-university': { coachName: 'Maxwell Hamilton', coachEmail: 'mhamilton@wheeling.edu', achievements: ['2024 CRC National 7s champions', 'Unbeaten 2024 7s season (20–0–1)'] },
  'southern-nazarene-university': { conference: 'Independent', achievements: [] },
  'university-of-utah': { coachName: 'Cam DiLoreto', coachEmail: '' },
  'siena-college': { coachName: 'Jaco Visser', coachEmail: '' },
  'iona-university': { affiliation: 'NCR D1AA', coachName: 'Kyle Granby', coachEmail: 'kgranby@iona.edu' },
  'wingate-university': { conference: 'Independent', coachName: 'Frank McKinney', coachEmail: '' },
};
// Description patches on top of the walkthrough descriptions: [find, replace] (find must exist unless already replaced).
const DESC_PATCH = {
  'iona-university': [/^Iona plays NCR Division 1 in the Liberty Conference\..*$/, "Iona moved to the Liberty Conference's Division 1AA for fall 2026 and opened with wins at Yale (39–21) and Babson (47–12). In fall 2025, in Liberty Division 1, the Gaels earned their first conference win, 30–29 over Siena. The university is in New Rochelle, New York, about 20 miles north of Manhattan."],
  'brown-university': [/^Brown won the 2022 Division 1 national title\./, 'Brown won NCR Division 1 national titles in 2022 and 2024.'],
  'davenport-university': [/beating St\. Thomas 30–23/, 'beating St. Thomas (Florida) 30–23'],
};
// Coach rows Hugh set by hand that are blank in the live database (names only, no emails).
const DB_COACH_ONLY = { 'the-ohio-state-university': 'Pete Malcolm', 'western-washington-university': 'Adam Roberts' };

const fail = (m) => { console.error('STOP:', m); process.exit(1); };
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const qj = (a) => `${q(JSON.stringify(a))}::jsonb`;

// ---- 1. src/data/colleges.ts ----
let ts = fs.readFileSync('src/data/colleges.ts', 'utf8');
if (!ts.includes('St. Bonaventure won the 2025 NCR Division 1 national title')) fail('walkthrough descriptions not found. Run LOCAL-AGENT-PASTE-walkthrough-fixes.md first.');
let parts = ts.split(/(?=\n  \{\n    id: )/);
const slugOf = (blk) => (blk.match(/slug: "([^"]+)"/) || [])[1];
let swapped = 'already done';
const iOld = parts.findIndex((b) => slugOf(b) === OLD);
if (iOld >= 0) {
  if (parts.some((b) => slugOf(b) === NEW)) fail('both slugs present');
  if (!/\n  \},\s*$/.test(parts[iOld])) fail('Minnesota block does not end with "  },"');
  parts[iOld] = STU_BLOCK;
  swapped = 'Minnesota replaced by Florida';
} else if (!parts.some((b) => slugOf(b) === NEW)) fail('neither slug found');
const seen = new Set(); let fieldEdits = 0, descEdits = 0;
const setStr = (blk, key, val, slug) => {
  const re = new RegExp(`${key}: "(?:[^"\\\\]|\\\\.)*"`);
  if (!re.test(blk)) fail(`${slug}: no ${key}`);
  return blk.replace(re, () => `${key}: ${JSON.stringify(val)}`);
};
const setArr = (blk, key, val, slug) => {
  const re = new RegExp(`${key}: (\\[[^\\]]*\\])`);
  if (!re.test(blk)) fail(`${slug}: no ${key}`);
  return blk.replace(re, () => `${key}: ${JSON.stringify(val)}`);
};
parts = parts.map((blk) => {
  const slug = slugOf(blk); if (!slug) return blk; seen.add(slug);
  const e = EDITS[slug];
  if (e) {
    for (const k of ['affiliation', 'conference', 'coachName', 'coachEmail']) if (k in e) blk = setStr(blk, k, e[k], slug);
    if ('badges' in e) {
      const cur = JSON.parse(blk.match(/badges: (\[[^\]]*\])/)[1]);
      blk = setArr(blk, 'badges', [...e.badges, ...cur.filter((b) => /MLR/.test(b))], slug);
    }
    if ('achievements' in e) blk = setArr(blk, 'achievements', e.achievements, slug);
    fieldEdits++;
  }
  const p = DESC_PATCH[slug];
  if (p) {
    const m = blk.match(/description: ("(?:[^"\\]|\\.)*"),/); if (!m) fail(`${slug}: no description`);
    const cur = JSON.parse(m[1]);
    const next = p[0].test(cur) ? cur.replace(p[0], p[1]) : cur;
    if (next === cur && !cur.includes(p[1])) fail(`${slug}: description text to patch not found`);
    blk = blk.replace(m[0], () => `description: ${JSON.stringify(next)},`);
    descEdits++;
  }
  return blk;
});
const missing = Object.keys(EDITS).filter((s) => !seen.has(s));
if (missing.length) fail('slugs not found in colleges.ts: ' + missing.join(', '));
ts = parts.join('');
const count = (ts.match(/\n  \{\n    id: /g) || []).length;
if (count !== 48) fail(`expected 48 programs, found ${count}`);
fs.writeFileSync('src/data/colleges.ts', ts);
console.log(`colleges.ts: ${swapped}; ${fieldEdits}/${Object.keys(EDITS).length} programs updated; ${descEdits}/3 descriptions patched; 48 programs`);

// ---- 2. src/data/collegeSearchFacts.json ----
const FP = 'src/data/collegeSearchFacts.json';
const facts = JSON.parse(fs.readFileSync(FP, 'utf8'));
const next = {};
for (const [k, v] of Object.entries(facts.colleges)) {
  if (k === OLD) next[NEW] = STU_FACTS; else if (k !== NEW) next[k] = v;
}
if (!next[NEW]) next[NEW] = STU_FACTS;
facts.colleges = next;
if (Object.keys(next).length !== 48) fail(`facts: expected 48, found ${Object.keys(next).length}`);
fs.writeFileSync(FP, JSON.stringify(facts));
console.log('collegeSearchFacts.json: St. Thomas (Florida) entry in place of Minnesota; 48 entries');

// ---- 3. supabase-setup.sql (append once) ----
let sql = fs.readFileSync('supabase-setup.sql', 'utf8');
const marker = '-- ── Follow-up fixes 2026-10-06';
if (!sql.includes(marker)) {
  const blk = parts.find((b) => slugOf(b) === NEW);
  // Pull the Florida record back out of the TS block for the insert.
  const g = (k) => { const m = blk.match(new RegExp(`${k}: ("(?:[^"\\\\]|\\\\.)*"|-?[0-9.]+|null)`)); return m ? JSON.parse(m[1]) : null; };
  const ga = (k) => JSON.parse(blk.match(new RegExp(`${k}: (\\[[^\\]]*\\])`))[1]);
  const temps = Function(`return ${blk.match(/monthlyTemps: (\[[^\]]*\])/)[1]}`)();
  const cols = ['id','slug','name','location','state','region','lat','lng','map_x','map_y','affiliation','conference','tier','program_type','draft_picks','player_count','coach_name','coach_email','description','enrollment','popular_majors','weather_summary','monthly_temps','badges','achievements','website','image_url','gender','rugby_program_url','assistant_coaches'];
  const vals = [26, q(NEW), q(g('name')), q(g('location')), q(g('state')), q(g('region')), g('lat'), g('lng'), g('mapX'), g('mapY'), q(g('affiliation')), q(g('conference')), q(g('tier')), q(g('programType')), 0, 0, q(g('coachName')), q(g('coachEmail')), q(g('description')), g('enrollment'), qj(ga('popularMajors')), q(g('weatherSummary')), qj(temps), qj(ga('badges')), qj(ga('achievements')), q(g('website')), q(g('imageUrl')), q('mens'), q(g('rugbyProgramUrl')), qj([])];
  const lines = [
    `\n${marker} (St. Thomas FL replaces St. Thomas MN; league labels; coaches; honours; safe to re-run). HUGH ONLY: run in the Supabase SQL Editor after the PR is merged, after the walkthrough block above. ──`,
    `-- 1. Remove the Minnesota row and add St. Thomas University (Florida) with the same id (26).`,
    `delete from colleges where slug=${q(OLD)};`,
    `insert into colleges (${cols.join(', ')})\nvalues (${vals.join(', ')})\non conflict (slug) do update set ${cols.filter((c) => c !== 'id' && c !== 'slug').map((c) => `${c}=excluded.${c}`).join(', ')};`,
    `-- 2. Labels, coaches, badges and honours (rows not in the table yet just update nothing).`,
  ];
  for (const slug of Object.keys(EDITS).sort()) {
    const blk2 = parts.find((b) => slugOf(b) === slug);
    const e = EDITS[slug]; const sets = [];
    if ('affiliation' in e) sets.push(`affiliation=${q(e.affiliation)}`);
    if ('conference' in e) sets.push(`conference=${q(e.conference)}`);
    if ('coachName' in e) sets.push(`coach_name=${q(e.coachName)}`, `coach_email=${q(e.coachEmail)}`);
    if ('badges' in e) sets.push(`badges=${qj(JSON.parse(blk2.match(/badges: (\[[^\]]*\])/)[1]))}`);
    if ('achievements' in e) sets.push(`achievements=${qj(e.achievements)}`);
    if (DESC_PATCH[slug]) sets.push(`description=${q(JSON.parse(blk2.match(/description: ("(?:[^"\\]|\\.)*"),/)[1]))}`);
    lines.push(`update colleges set ${sets.join(', ')} where slug=${q(slug)};`);
  }
  for (const [slug, name] of Object.entries(DB_COACH_ONLY)) lines.push(`update colleges set coach_name=${q(name)}, coach_email='' where slug=${q(slug)};`);
  sql += lines.join('\n') + '\n';
}
fs.writeFileSync('supabase-setup.sql', sql);
console.log('supabase-setup.sql: follow-up block present');
