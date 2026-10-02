// scripts/apply-redesign-facts.mjs  (one-off, safe to re-run)
// Adds to src/data/collegeSearchFacts.json:
//   campus_feel                      city | college_town | suburb | country   (from the NCES locale code, plus 6 hand overrides)
//   flights_airport_iata/name/miles  nearest airport with scheduled passenger flights (FAA CY2025 commercial-service list)
//   flights_airport_limited          true when that airport has under 50,000 boardings a year (a few flights a day at most)
//   safety_clery                     null for every college (no Clery data collected yet; shown as "see the official report")
//   rugby_aid                        null for every college (shown as "Ask the coach")
// And fixes the major-airport bug: Southern Nazarene now gets OKC (8 mi), not Tulsa (108 mi).
// Source of the numbers: /workspace/rugby-campus-search/airport-calc-2026-10-02.json (OurAirports coordinates + FAA CY2025 enplanements).
import fs from 'node:fs';
const P = 'src/data/collegeSearchFacts.json';
const d = JSON.parse(fs.readFileSync(P, 'utf8'));
const DATE = '2026-10-02';
// slug: [flights IATA, airport name, straight-line miles, limited (1 = under 50k boardings/yr)]
const FLIGHTS = {
 'aquinas-college': ['GRR', "Gerald R. Ford International Airport", 8, 0],
 'arkansas-state-university': ['MEM', "Frederick W. Smith International Airport", 68, 0],
 'belmont-abbey-college': ['CLT', "Charlotte Douglas International Airport", 6, 0],
 'brigham-young-university': ['PVU', "Provo Municipal Airport", 4, 0],
 'brown-university': ['PVD', "Rhode Island T. F. Green International Airport", 7, 0],
 'california-polytechnic-state-university': ['SBP', "San Luis County Regional Airport", 4, 0],
 'california-state-university-long-beach': ['LGB', "Long Beach International Airport", 3, 0],
 'colorado-state-university': ['CYS', "Cheyenne Regional Jerry Olson Field", 43, 1],
 'dartmouth-college': ['LEB', "Lebanon Municipal Airport", 5, 1],
 'davenport-university': ['GRR', "Gerald R. Ford International Airport", 2, 0],
 'fairfield-university': ['HVN', "Tweed New Haven Airport", 20, 0],
 'fordham-university': ['LGA', "LaGuardia Airport", 6, 0],
 'grand-canyon-university': ['PHX', "Phoenix Sky Harbor International Airport", 9, 0],
 'indiana-institute-of-technology': ['FWA', "Fort Wayne International Airport", 8, 0],
 'indiana-university': ['IND', "Indianapolis International Airport", 40, 0],
 'iona-university': ['HPN', "Westchester County Airport", 11, 0],
 'kutztown-university': ['ABE', "Lehigh Valley International Airport", 20, 0],
 'life-university': ['ATL', "Hartsfield Jackson Atlanta International Airport", 21, 0],
 'lindenwood-university': ['STL', "St. Louis Lambert International Airport", 8, 0],
 'marian-university': ['IND', "Indianapolis International Airport", 8, 0],
 'mckendree-university': ['BLV', "Scott AFB/Midamerica Airport", 4, 0],
 'mount-st-mary-s-university': ['HGR', "Hagerstown Regional Richard A Henson Field", 20, 1],
 'pennsylvania-state-university': ['SCE', "State College Regional Airport", 4, 0],
 'queens-university-of-charlotte': ['CLT', "Charlotte Douglas International Airport", 6, 0],
 'saint-mary-s-college-of-california': ['OAK', "Oakland San Francisco Bay Airport", 10, 0],
 'santa-clara-university': ['SJC', "Mineta San Jose International Airport", 1, 0],
 'siena-college': ['ALB', "Albany International Airport", 3, 0],
 'southern-nazarene-university': ['OKC', "OKC Will Rogers World Airport", 8, 0],
 'st-bonaventure-university': ['BFD', "Bradford Regional Airport", 21, 1],
 'the-ohio-state-university': ['CMH', "John Glenn Columbus International Airport", 6, 0],
 'thomas-more-university': ['CVG', "Cincinnati Northern Kentucky International Airport", 6, 0],
 'united-states-military-academy-army': ['SWF', "New York Stewart International Airport", 11, 0],
 'united-states-naval-academy': ['BWI', "Baltimore/Washington International Thurgood Marshall Airport", 17, 0],
 'university-of-arizona': ['TUS', "Tucson International Airport", 8, 0],
 'university-of-california-berkeley': ['OAK', "Oakland San Francisco Bay Airport", 11, 0],
 'university-of-california-los-angeles-ucla': ['LAX', "Los Angeles International Airport", 9, 0],
 'university-of-colorado-boulder': ['DEN', "Denver International Airport", 33, 0],
 'university-of-mary-washington': ['IAD', "Washington Dulles International Airport", 44, 0],
 'university-of-michigan': ['DTW', "Detroit Metropolitan Wayne County Airport", 20, 0],
 'university-of-notre-dame': ['SBN', "South Bend International Airport", 4, 0],
 'university-of-rio-grande': ['HTS', "Tri-State Airport / Milton J. Ferguson Field", 37, 0],
 'university-of-san-diego': ['SAN', "San Diego International Airport", 3, 0],
 'university-of-st-thomas-minnesota': ['MSP', "Minneapolis\u2013Saint Paul International Airport / Wold\u2013Chamberlain Field", 5, 0],
 'university-of-utah': ['SLC', "Salt Lake City International Airport", 7, 0],
 'walsh-university': ['CAK', "Akron Canton Regional Airport", 5, 0],
 'western-washington-university': ['BLI', "Bellingham International Airport", 4, 0],
 'wheeling-university': ['PIT', "Pittsburgh International Airport", 38, 0],
 'wingate-university': ['USA', "Concord-Padgett Regional Airport", 32, 0],
};
// slug: campus feel. City codes 11/12 -> city; 13, 23, 31, 32 -> college_town; 21/22 -> suburb; 33/4x -> country.
// Hand overrides (flagged in WHAT-PEOPLE-SEARCH-FOR.md section E): Penn State, Indiana, Cal Poly SLO, Notre Dame -> college_town; Life, Lindenwood -> suburb.
const FEEL = {
 'aquinas-college': 'city',
 'arkansas-state-university': 'college_town',
 'belmont-abbey-college': 'suburb',
 'brigham-young-university': 'city',
 'brown-university': 'city',
 'california-polytechnic-state-university': 'college_town',
 'california-state-university-long-beach': 'city',
 'colorado-state-university': 'city',
 'dartmouth-college': 'country',
 'davenport-university': 'suburb',
 'fairfield-university': 'suburb',
 'fordham-university': 'city',
 'grand-canyon-university': 'city',
 'indiana-institute-of-technology': 'city',
 'indiana-university': 'college_town',
 'iona-university': 'suburb',
 'kutztown-university': 'college_town',
 'life-university': 'suburb',
 'lindenwood-university': 'suburb',
 'marian-university': 'city',
 'mckendree-university': 'suburb',
 'mount-st-mary-s-university': 'country',
 'pennsylvania-state-university': 'college_town',
 'queens-university-of-charlotte': 'city',
 'saint-mary-s-college-of-california': 'suburb',
 'santa-clara-university': 'city',
 'siena-college': 'suburb',
 'southern-nazarene-university': 'suburb',
 'st-bonaventure-university': 'country',
 'the-ohio-state-university': 'city',
 'thomas-more-university': 'suburb',
 'united-states-military-academy-army': 'college_town',
 'united-states-naval-academy': 'suburb',
 'university-of-arizona': 'city',
 'university-of-california-berkeley': 'city',
 'university-of-california-los-angeles-ucla': 'city',
 'university-of-colorado-boulder': 'city',
 'university-of-mary-washington': 'suburb',
 'university-of-michigan': 'city',
 'university-of-notre-dame': 'college_town',
 'university-of-rio-grande': 'country',
 'university-of-san-diego': 'city',
 'university-of-st-thomas-minnesota': 'city',
 'university-of-utah': 'city',
 'walsh-university': 'suburb',
 'western-washington-university': 'college_town',
 'wheeling-university': 'college_town',
 'wingate-university': 'suburb',
};
const slugs = Object.keys(d.colleges);
for (const s of slugs) { if (!FLIGHTS[s] || !FEEL[s]) throw new Error('missing data for ' + s); }
for (const s of slugs) {
  const c = d.colleges[s];
  const [iata, name, miles, ltd] = FLIGHTS[s];
  c.campus_feel = FEEL[s];
  c.flights_airport_iata = iata; c.flights_airport_name = name; c.flights_airport_miles = miles; c.flights_airport_limited = ltd === 1;
  c.safety_clery = null; c.rugby_aid = null;
  c.prov = c.prov || {};
  c.prov.flights_airport_iata = { c: 'medium', u: 'https://www.faa.gov/airports/planning_capacity/passenger_allcargo_stats/passenger', d: DATE };
  c.prov.campus_feel = { c: 'medium', u: c.prov.setting?.u ?? 'https://nces.ed.gov/ipeds/datacenter/', d: DATE };
}
// Major-airport bug: OKC Will Rogers is a large airport but has no "International" in its name, so the old rule skipped it.
const snu = d.colleges['southern-nazarene-university'];
snu.nearest_airport_iata = 'OKC'; snu.nearest_airport_name = 'OKC Will Rogers World Airport'; snu.airport_distance_miles = 8;
d.definitions.airport = "Nearest major airport: a US airport that OurAirports classes as large_airport with scheduled service and 'International'/'Intercontinental' in its name (plus Detroit Metropolitan and OKC Will Rogers), excluding 15 airports that carry 'International' in the name but have little overseas service (MDW, LGB, SNA, ONT, SBD, SFB, PIE, PSP, PNS, MYR, SRQ, FAT, RNO, GSO, DJT). Straight-line miles from campus, NOT driving distance.";
d.definitions.flights_airport = "Nearest airport with scheduled passenger flights: any airport on the FAA CY2025 commercial-service enplanement list. Straight-line miles, NOT driving distance. 'Limited' = under 50,000 boardings a year.";
d.definitions.campus_feel = "city = NCES locale 11/12; college_town = 13, 23, 31, 32; suburb = 21/22; country = 33 and 4x. Hand overrides: Penn State, Indiana, Cal Poly SLO, Notre Dame -> college_town; Life, Lindenwood -> suburb.";
d.generated = DATE + ' (Sydney time), redesign-v2 facts';
fs.writeFileSync(P, JSON.stringify(d));
console.log('updated', slugs.length, 'colleges');
