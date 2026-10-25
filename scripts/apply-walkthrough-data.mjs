// scripts/apply-walkthrough-data.mjs  (one-off, safe to re-run)
// 1) Replaces all 48 program descriptions in src/data/colleges.ts with fact-only versions
//    (researched 6 Oct 2026; every fact has a source in Hugh's research notes DESCRIPTIONS-2026-10-06.md).
// 2) Sets programType to "Varsity" for 5 programs where the school's own pages say varsity
//    (Wingate, Indiana Tech, Aquinas, Rio Grande, Mary Washington), and makes the search data agree.
// 3) Appends one idempotent UPDATE block to supabase-setup.sql for Hugh to run after merge.
import fs from 'node:fs';
const DESC = {
 "university-of-california-berkeley":
   "Cal won the 2026 D1A national title, beating Navy 36–22 in Indianapolis for a second straight championship, and went unbeaten all season. Jack Clark has been head coach since 1984. Home games are at Witter Rugby Field in Berkeley.",
 "united-states-naval-academy":
   "Navy reached the 2026 D1A final, beating Army 38–10 and Life on the way before losing 36–22 to Cal. Navy went 5–0 to top Rugby East in 2025–26. Gavin Hickie has led the program since 2017.",
 "life-university":
   "Life won back-to-back D1A national titles in 2018 and 2019. In 2026 the Running Eagles won a 31–24 quarterfinal at Lindenwood and reached the semifinals, where they lost to Navy. Life plays in Rugby East from Marietta, Georgia, near Atlanta.",
 "lindenwood-university":
   "Lindenwood went 5–0 to win the Midwest Conference in 2025–26, then beat Penn State 31–10 in the 2026 D1A playoffs before losing a 31–24 quarterfinal to Life. Rugby is run by the university's Student Life Sports department in St. Charles, Missouri, near St. Louis.",
 "saint-mary-s-college-of-california":
   "Saint Mary's has won four D1A national titles: 2014, 2015, 2017 and 2024. In 2026 the Gaels went 8–0 in the northern half of the California Conference, beat Colorado State and Arizona in the playoffs, and lost the semifinal 59–19 to Cal. The campus is in Moraga, in the San Francisco Bay Area.",
 "united-states-military-academy-army":
   "Army won the 2022 D1A national title. In 2026 Army beat Arkansas State 42–17 in the first round of the playoffs, then lost 38–10 at Navy in the quarterfinals to finish 10–4. Matt Sherman is head coach.",
 "university-of-california-los-angeles-ucla":
   "UCLA played CRAA D1A in 2025–26, going 5–2 in the southern half of the California Conference, and has announced it is joining National Collegiate Rugby (NCR) from 2026–27. Home games are at Wallis Annenberg Stadium, and the team runs through UCLA Club Sports.",
 "brown-university":
   "Brown won the 2022 Division 1 national title. In fall 2025 the team reached the NCR Division 1 quarterfinals, where it lost 51–7 to eventual champions St. Bonaventure. Brown is an Ivy League university in Providence, Rhode Island.",
 "mount-st-mary-s-university":
   "Mount St. Mary's won the 2016 NSCRO national title and joined Rugby East in CRAA D1A in fall 2022. The university made rugby a \"Premier team sport\" in 2018, with a full-time coach and scholarships. In 2026 the Mount went 7–6 and reached the D1A playoffs, losing in the first round at Life.",
 "brigham-young-university":
   "BYU lists five national titles: 2009, 2012, 2013, 2014 and 2015. In 2025–26 the team went 5–0 to win the Rocky Mountain Conference, beat Cal Poly in the first round of the D1A playoffs, and lost 96–12 at Cal in the quarterfinals. BYU is in Provo, Utah.",
 "university-of-arizona":
   "Arizona went 10–4 in 2025–26 as a D1A independent. In the 2026 playoffs the Wildcats beat Grand Canyon 41–35 at home, then lost 48–19 at Saint Mary's in the quarterfinals. Home games are at William David Sitton Field in Tucson.",
 "pennsylvania-state-university":
   "Penn State rugby was founded in 1962 and plays CRAA D1A in Rugby East. The team reached the 2026 D1A playoffs as the East's No. 7 seed and lost 31–10 at Lindenwood in the first round. The main campus is in University Park, Pennsylvania.",
 "dartmouth-college":
   "Dartmouth won the 2019 D1-AA spring national title. In fall 2025 the team reached an NCR Division 1 play-in game and lost 38–33 to Wheeling. Dartmouth plays out of the Corey Ford Rugby Clubhouse in Hanover, New Hampshire.",
 "california-polytechnic-state-university":
   "Cal Poly went 6–2 in the southern half of the California Conference in 2025–26 and made the 2026 D1A playoffs as the West's No. 5 seed. The Mustangs lost in the first round at BYU. The campus is in San Luis Obispo on California's Central Coast.",
 "st-bonaventure-university":
   "St. Bonaventure won the 2025 NCR Division 1 national title, beating Queens 55–19 in the final in Houston. On the way the Bonnies beat Brown 51–7 and Walsh. The program was founded in 1975 and plays in the Atlantic Rugby Conference (ARC) in western New York.",
 "arkansas-state-university":
   "Arkansas State went 4–1 in the Midwest Conference in 2025–26 and reached the D1A playoffs, losing 42–17 at Army in the first round. That was the Red Wolves' fourth straight D1A postseason. Rugby is a club sport at the university in Jonesboro, Arkansas.",
 "grand-canyon-university":
   "Grand Canyon went 7–4 in 2025–26 as a D1A independent and reached the 2026 playoffs, losing 41–35 at Arizona in the first round. Rugby runs through GCU Club Sports in Phoenix, Arizona.",
 "university-of-mary-washington":
   "Mary Washington's men won the 2017 USA Rugby D1AA fall title. In 2026 the Eagles made the D1A playoffs and lost 40–11 at Navy in the first round. The university is in Fredericksburg, Virginia, about an hour south of Washington, D.C.",
 "queens-university-of-charlotte":
   "Queens reached the 2025 NCR Division 1 final, beating Wheeling 45–28 and Belmont Abbey 19–15 before losing 55–19 to St. Bonaventure. Tyree Reed was named head coach in April 2025. Queens is in Charlotte, North Carolina, and plays in the ARC.",
 "university-of-notre-dame":
   "Notre Dame won the 2025 Big Ten Universities Cup final 12–0 over Indiana at its home ground, Stinson Rugby Field. The team then reached the NCR Division 1 quarterfinals, losing 44–24 to Belmont Abbey. The campus is next to South Bend, Indiana.",
 "the-ohio-state-university":
   "Ohio State finished third in the Big Ten East in fall 2025 and beat Michigan State 73–19 in November. CRAA lists Ohio State in its Midwest Conference for 2026–27. The team plays in Columbus, Ohio.",
 "davenport-university":
   "Davenport won the 2026 D1A Challenger Cup, beating St. Thomas 30–23 and Utah 37–17. The Panthers also won back-to-back Division 1AA national titles in 2010–11 and 2011–12. Dom Bailey has been head coach since December 2024, and the university is in Grand Rapids, Michigan.",
 "marian-university":
   "Marian won the 2025 Big Rivers Conference title, beating Thomas More in the final, and reached the NCR Division 1 quarterfinals for the first time, losing 30–28 to Walsh. In spring 2026 the Knights won the Big Rivers 7s, beating Rio Grande 33–12 in the final. Marian is a Catholic university in Indianapolis.",
 "university-of-michigan":
   "Michigan beat Ohio State 25–22 in October 2025, its first 15s win over the Buckeyes since 2013, and went 2–1 in the Big Ten East. The Wolverines lost the Big Ten Cup semifinal 38–10 at Indiana. Home games are at Mitchell Field in Ann Arbor.",
 "indiana-university":
   "Indiana went 3–0 to win the Big Ten West in fall 2025 and reached the Big Ten Cup final, losing 12–0 to Notre Dame. The Hoosiers then lost an NCR Division 1 opening-round game 36–29 to Walsh in Bloomington. Indiana also appears on CRAA's D1A team list for 2026–27.",
 "university-of-st-thomas-minnesota":
   "The University of St. Thomas is a private Catholic university in Saint Paul, Minnesota. Its men's rugby team is a student club listed on the university's TommieLink student-organisation site. Check with the club for its current league and schedule.",
 "wheeling-university":
   "Wheeling won the 2024 national 7s title. In fall 2025, its first season in the ARC, the Cardinals beat Dartmouth 38–33 in an NCR Division 1 play-in game, then lost 45–28 to Queens in the quarterfinals. Wheeling is a small Catholic university in Wheeling, West Virginia.",
 "southern-nazarene-university":
   "Southern Nazarene played as an NCR Division 1 independent in fall 2025 and started 3–0, with wins including 24–3 at Wayne State and 56–21 over Drury. The university fields men's and women's rugby at the SNU Rugby Pitch in Bethany, Oklahoma, in the Oklahoma City area.",
 "mckendree-university":
   "McKendree plays CRAA D1A in the Midwest Conference. In 2025–26 the Bearcats finished 3–12, with wins including 36–5 at Michigan State and 36–14 over Ohio State, and three players were named all-conference. McKendree is a small private university in Lebanon, Illinois, about 25 miles east of St. Louis.",
 "santa-clara-university":
   "Santa Clara reached the semifinals of the 2026 D1A Challenger Cup, losing 42–28 to Utah in Indianapolis. In 2025–26 the Broncos went 4–4 in the northern half of the California Conference. Rugby runs through the university's club sports program in Silicon Valley.",
 "university-of-san-diego":
   "San Diego went 5–1 in the southern half of the California Conference in 2025–26, including a 36–28 win over Long Beach State. The Toreros made the 2026 D1A playoffs as the West's No. 8 seed and lost in the first round at Cal.",
 "university-of-utah":
   "Utah reached the final of the 2026 D1A Challenger Cup, beating Santa Clara 42–28 in the semifinals before losing 37–17 to Davenport. The Utes went 4–1 in the Rocky Mountain Conference in 2025–26. The university is in Salt Lake City.",
 "walsh-university":
   "Walsh took over Notre Dame College's rugby program, the 2023 NCR Division 1 champions, after that college closed in 2024. In fall 2025 Walsh beat Indiana 36–29 and Marian 30–28 to reach the NCR Division 1 semifinals, where it lost to St. Bonaventure. Walsh is a Catholic university in North Canton, Ohio, and plays in the ARC.",
 "siena-college":
   "Siena went 3–5 in the Liberty Conference in fall 2025, including a 45–17 win over Fordham and one-point losses to Fairfield (28–27) and Iona (30–29). Siena is a private Franciscan school in Loudonville, just outside Albany, New York.",
 "kutztown-university":
   "Kutztown won the 2022 college 7s national title, beating Dartmouth 17–12 in the final. The team plays NCR Division 1 in the ARC, and the university lists it among its sport clubs. Kutztown is a public university in eastern Pennsylvania, between Allentown and Reading.",
 "belmont-abbey-college":
   "Belmont Abbey reached the 2025 NCR Division 1 semifinals, beating Notre Dame 44–24 in the quarterfinals before losing 19–15 to Queens. Genaro Fessia became head coach in May 2024. The small Catholic college is in Belmont, North Carolina, just west of Charlotte, and plays in the ARC.",
 "thomas-more-university":
   "Thomas More won the 2021 NCR Division 2 national title, then moved up to Division 1 and won the Big Rivers Conference in its first season there in 2022. In 2025 the Saints reached the Big Rivers final, losing to Marian. The campus is in Crestview Hills, Kentucky, across the river from Cincinnati.",
 "iona-university":
   "Iona plays NCR Division 1 in the Liberty Conference. In fall 2025 the Gaels earned their first Liberty win, 30–29 over Siena, after losses to AIC and Syracuse. The university is in New Rochelle, New York, about 20 miles north of Manhattan.",
 "fairfield-university":
   "Fairfield went 5–3 in fall 2025 and finished fourth in the Liberty Conference, with wins including 55–31 over Fordham and 28–27 over Siena. The team runs through Fairfield's club sports program. The Jesuit university is on the Connecticut coast, about an hour from New York City.",
 "western-washington-university":
   "Western Washington won the 2025–26 CRAA D1AA national 15s title and moved up to D1A for 2026–27. Adam Roberts is head coach. The university is in Bellingham, Washington, near the Canadian border.",
 "colorado-state-university":
   "Colorado State went 4–1 in the Rocky Mountain Conference in 2025–26 and reached the D1A playoffs as the West's No. 7 seed, losing 69–10 at Saint Mary's in the first round. Rugby is a sport club at the university in Fort Collins, Colorado.",
 "california-state-university-long-beach":
   "Long Beach State topped the southern half of the California Conference on points in 2025–26 with a 6–4 record. Results included wins over UC Davis (71–5) and San Diego State (51–29) and a 36–28 loss to San Diego. The university is in Long Beach, California.",
 "university-of-colorado-boulder":
   "Colorado went 2–3 in the Rocky Mountain Conference in 2025–26, with wins including 32–17 over Air Force and 25–20 over Utah State. The university is in Boulder, Colorado.",
 "indiana-institute-of-technology":
   "Indiana Tech added men's rugby in 2024 under head coach Sam DiFilippo, and 2026–27 is its second varsity 15s season. In September 2026 the Warriors won their first Big Rivers Conference game, 22–7 over Thomas More at Shields Field. Indiana Tech is in Fort Wayne, Indiana.",
 "fordham-university":
   "Fordham plays NCR Division 1 in the Liberty Conference as a club team. Its fall 2025 league schedule included Syracuse, AIC, Fairfield and Siena. Fordham's main campus is in the Bronx, New York City.",
 "wingate-university":
   "Wingate made men's rugby a varsity sport from 2025–26, moving up from club, and named Frank McKinney head coach. The Bulldogs won their first home game 20–17 over Coastal Carolina in September 2025. Wingate is in Wingate, North Carolina, about 30 miles southeast of Charlotte.",
 "aquinas-college":
   "Aquinas added men's rugby as a varsity sport in 2021, and head coach Lance Hohaia, a 2008 Rugby League World Cup winner with New Zealand, has led it since. In fall 2025 the Saints went 6–2 and finished third in the Big Rivers Conference. Aquinas is a small Catholic college in Grand Rapids, Michigan.",
 "university-of-rio-grande":
   "Rio Grande made men's rugby a varsity sport in 2021, and Brad Sandig has been head coach since 2024. In spring 2026 the RedStorm finished runner-up at the Big Rivers 7s championship. The university is in Rio Grande, a small town in southeast Ohio.",
};
const VARSITY = ['wingate-university', 'indiana-institute-of-technology', 'aquinas-college', 'university-of-rio-grande', 'university-of-mary-washington'];
// Already Varsity in the code but still 'Club' in the live database. The SQL block fixes those rows too.
const VARSITY_DB_ONLY = ['belmont-abbey-college', 'thomas-more-university', 'mount-st-mary-s-university'];

// ---- 1. src/data/colleges.ts ----
let ts = fs.readFileSync('src/data/colleges.ts', 'utf8');
const parts = ts.split(/(?=\n  \{\n    id: )/);
let descDone = 0, typeDone = 0;
const seen = new Set();
ts = parts.map((blk) => {
  const sm = blk.match(/slug: "([^"]+)"/); if (!sm) return blk;
  const slug = sm[1]; seen.add(slug);
  if (DESC[slug]) {
    const before = blk;
    blk = blk.replace(/description: "(?:[^"\\]|\\.)*",/, () => `description: ${JSON.stringify(DESC[slug])},`);
    if (blk !== before || blk.includes(`description: ${JSON.stringify(DESC[slug])},`)) descDone++;
  }
  if (VARSITY.includes(slug)) {
    blk = blk.replace(/programType: "(Club|Varsity)"/, 'programType: "Varsity"');
    if (blk.includes('programType: "Varsity"')) typeDone++;
  }
  return blk;
}).join('');
const missing = Object.keys(DESC).filter((s) => !seen.has(s));
if (missing.length) { console.error('Slugs not found in colleges.ts:', missing); process.exit(1); }
fs.writeFileSync('src/data/colleges.ts', ts);
console.log(`colleges.ts: ${descDone}/48 descriptions set, ${typeDone}/5 program types set to Varsity`);

// ---- 2. src/data/collegeSearchFacts.json ----
const FP = 'src/data/collegeSearchFacts.json';
const facts = JSON.parse(fs.readFileSync(FP, 'utf8'));
let factsDone = 0;
for (const s of [...VARSITY, ...VARSITY_DB_ONLY]) {
  if (!facts.colleges[s]) { console.error('missing in facts:', s); process.exit(1); }
  facts.colleges[s].mens_rugby_program_type = 'varsity'; factsDone++;
}
fs.writeFileSync(FP, JSON.stringify(facts));
console.log(`collegeSearchFacts.json: ${factsDone}/8 set to varsity`);

// ---- 3. supabase-setup.sql (append once) ----
let sql = fs.readFileSync('supabase-setup.sql', 'utf8');
const marker = '-- ── Walkthrough fixes 2026-10-06';
if (!sql.includes(marker)) {
  const q = (s) => `'${s.replace(/'/g, "''")}'`;
  const lines = Object.keys(DESC).sort().map((s) => `update colleges set description=${q(DESC[s])} where slug=${q(s)};`);
  const types = [...VARSITY, ...VARSITY_DB_ONLY].sort().map((s) => `update colleges set program_type='Varsity' where slug=${q(s)};`);
  sql += `\n${marker} (descriptions + program type; safe to re-run). HUGH ONLY: run in the Supabase SQL Editor after the PR is merged. ──\n-- Rows that are not in the table yet (8 of the 48) just update nothing; the site uses the code version for those.\n` + types.join('\n') + '\n' + lines.join('\n') + '\n';
}
fs.writeFileSync('supabase-setup.sql', sql);
console.log('supabase-setup.sql: walkthrough update block present');
