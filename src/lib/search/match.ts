// Pure matching engine. No AI, no network. Answers come only from our stored facts.
// RULE: nothing removes a college. A miss is an amber pill. Unknown is grey and never counts against a college.
import type { CollegeFacts } from './facts';
import { MAJOR_FIELDS, type Filters } from './filters';
import { costFor, usd } from './cost';
import { CAMPUS_FEEL_LABEL, CLIMATE_LABEL, SIZE_LABEL, climateBand, fToC, isVeryHot, sizeBand } from './display';

export type Status = 'match' | 'miss' | 'unknown';
export interface Check {
  key: string;            // filter key, e.g. 'setting'
  hard: boolean;
  status: Status;
  label: string;          // short pill text, e.g. "Mild winters"
  detail?: string;        // longer explanation, e.g. "$6,200 over your budget"
  gap?: number;           // dollars over budget when status === 'miss' on cost
}
export interface Result {
  slug: string;
  checks: Check[];
  hardMisses: Check[];
  softMisses: Check[];
  unknowns: Check[];
  softMatches: number;
  score: number;
  closest: boolean;       // true when shown only because too few colleges fit every hard filter
}
export interface SearchOutcome {
  active: boolean;
  results: Result[];      // fitsAll, then close
  fitsAll: Result[];
  close: Result[];
  fitsAllCount: number;
}

const TIER_RANK: Record<string, number> = { championship: 0, playoff: 1, competitive: 2, emerging: 3 };

const DIV: Record<string, string> = { ncaa_d1: 'd1', ncaa_d2: 'd2', ncaa_d3: 'd3', naia: 'naia' };
const DIV_LABEL: Record<string, string> = { d1: 'NCAA D1', d2: 'NCAA D2', d3: 'NCAA D3', naia: 'NAIA' };
const CONTROL_LABEL: Record<string, string> = { public: 'Public', private_nonprofit: 'Private' };
const SETTING_LABEL = CAMPUS_FEEL_LABEL;
const TIER_LABEL: Record<string, string> = { championship: 'Often near the top', playoff: 'Playoff calibre', competitive: 'Competitive', emerging: 'Up and coming' };
const STATE_NAMES: Record<string, string> = { AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'Washington DC',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming' };
export const stateName = (c: string) => STATE_NAMES[c] ?? c;

export const filterLabel = {
  states: (v: string[]) => v.map(stateName).join(' / '),
  regions: (v: string[]) => v.map((x) => x[0].toUpperCase() + x.slice(1)).join(' / '),
  control: (v: string[]) => v.map((x) => CONTROL_LABEL[x] ?? x).join(' / '),
  setting: (v: string[]) => v.map((x) => SETTING_LABEL[x as keyof typeof SETTING_LABEL] ?? x).join(' / '),
  division: (v: string[]) => v.map((x) => DIV_LABEL[x] ?? x).join(' / '),
  size_band: (v: string[]) => v.map((x) => SIZE_LABEL[x as keyof typeof SIZE_LABEL] ?? x).join(' / '),
  climate: (v: string[]) => v.map((x) => CLIMATE_LABEL[x as keyof typeof CLIMATE_LABEL] ?? x).join(' / '),
  majors: (v: string[]) => v.map((x) => MAJOR_FIELDS[x]?.label ?? x).join(' / '),
  rugby_tier: (v: string[]) => v.map((x) => TIER_LABEL[x] ?? x).join(' / '),
};

// ---- conference matching (soft) ----
const norm = (s: string) => s.toLowerCase().replace(/conference|athletic|association|league|\(.*?\)|[^a-z0-9]/g, '');
const CONF_ALIASES: Record<string, string[]> = {
  bigtwelve: ['big12', 'big 12'], bigten: ['big10', 'big ten'], atlantic10: ['a10', 'atlantic 10'], ivy: ['ivyleague', 'ivy'],
  americanathletic: ['aac', 'american'], metroatlantic: ['maac'], westcoast: ['wcc'], pac12: ['pac12', 'pac 12'], mountainwest: ['mwc', 'mountain west'],
  atlantic: ['acc'], southernstates: ['ssac'], coasttocoast: ['c2c'], sunbelt: ['sunbelt'], atlanticsun: ['asun', 'atlantic sun'], ohiovalley: ['ovc'],
};
function confMatches(want: string, have: string | null): boolean {
  if (!have) return false;
  const w = norm(want), h = norm(have);
  if (!w) return false;
  if (h.includes(w) || w.includes(h)) return true;
  for (const [canon, al] of Object.entries(CONF_ALIASES)) {
    const group = [canon, ...al.map(norm)];
    if (group.some((g) => g === w || (g && w.includes(g))) && group.some((g) => g && h.includes(g))) return true;
  }
  return false;
}


/** Evaluate one college against the filters. */
export function evaluate(slug: string, c: CollegeFacts, f: Filters): Check[] {
  const out: Check[] = [];
  const push = (x: Check) => out.push(x);

  if (f.states.length || f.regions.length) {
    const region = c.region_census?.toLowerCase() ?? '';
    const stateHit = !!c.state && f.states.includes(c.state as never);
    const regionHit = !!region && f.regions.includes(region as never);
    const asked = [f.states.length ? filterLabel.states(f.states) : '', f.regions.length ? `${filterLabel.regions(f.regions)} US` : ''].filter(Boolean).join(' or ');
    if (!c.state && !region) push({ key: 'where', hard: false, status: 'unknown', label: 'Location unverified' });
    else if (stateHit || regionHit) push({ key: 'where', hard: false, status: 'match', label: stateHit ? stateName(c.state) : `${c.region_census} US` });
    else push({ key: 'where', hard: false, status: 'miss', label: `Not in ${asked}`, detail: `It is in ${c.state ? stateName(c.state) : 'an unknown state'}.` });
  }
  if (f.control.length) {
    const v = c.control === 'private_forprofit' ? null : c.control;
    push(v ? (f.control.includes(v as never) ? { key: 'control', hard: false, status: 'match', label: CONTROL_LABEL[v] } : { key: 'control', hard: false, status: 'miss', label: `${CONTROL_LABEL[v]} (not ${filterLabel.control(f.control)})` }) : { key: 'control', hard: false, status: 'unknown', label: 'Type unverified' });
  }
  if (f.setting.length) {
    const feel = c.campus_feel;
    push(feel ? (f.setting.includes(feel) ? { key: 'setting', hard: false, status: 'match', label: SETTING_LABEL[feel] } : { key: 'setting', hard: false, status: 'miss', label: SETTING_LABEL[feel], detail: `You asked for ${filterLabel.setting(f.setting).toLowerCase()}.` }) : { key: 'setting', hard: false, status: 'unknown', label: 'Campus feel unverified' });
  }
  if (f.division.length) {
    const d = c.athletics_division ? DIV[c.athletics_division] : null;
    push(d ? (f.division.includes(d as never) ? { key: 'division', hard: false, status: 'match', label: DIV_LABEL[d] } : { key: 'division', hard: false, status: 'miss', label: `${DIV_LABEL[d]} (not ${filterLabel.division(f.division)})` }) : { key: 'division', hard: false, status: 'unknown', label: 'Division unverified' });
  }
  if (f.size_band.length) {
    const band = sizeBand(c.enrollment_undergrad);
    push(band ? (f.size_band.includes(band) ? { key: 'size_band', hard: false, status: 'match', label: SIZE_LABEL[band] } : { key: 'size_band', hard: false, status: 'miss', label: SIZE_LABEL[band], detail: `About ${c.enrollment_undergrad?.toLocaleString() ?? '?'} undergraduates.` }) : { key: 'size_band', hard: false, status: 'unknown', label: 'Size unverified' });
  }
  if (f.conference.length) {
    const hay = [c.athletics_conference, c.football_conference];
    if (!hay[0] && !hay[1]) push({ key: 'conference', hard: false, status: 'unknown', label: 'Conference unverified' });
    else {
      const hit = f.conference.some((w) => hay.some((h) => confMatches(w, h)));
      push(hit ? { key: 'conference', hard: false, status: 'match', label: c.athletics_conference ?? c.football_conference ?? 'Conference' } : { key: 'conference', hard: false, status: 'miss', label: c.athletics_conference ?? 'Other conference', detail: 'Conferences changed a lot in 2025-26; double-check.' });
    }
  }
  if (f.max_cost_usd_per_year != null) {
    const cv = costFor(c, f.residency, f.home_state);
    const max = f.max_cost_usd_per_year;
    if (c.cost_basis === 'service_academy') push({ key: 'max_cost_usd_per_year', hard: false, status: 'match', label: 'No tuition (service commitment)' });
    else if (cv.amount == null) push({ key: 'max_cost_usd_per_year', hard: false, status: 'unknown', label: 'Cost: ask the coach', detail: 'No published figure we trust.' });
    else if (cv.amount > max) push({ key: 'max_cost_usd_per_year', hard: false, status: 'miss', label: `${usd(cv.amount - max)} over budget`, gap: cv.amount - max, detail: `${usd(cv.amount)} per year${cv.kind === 'tuition' ? ' (tuition & fees only, so the true cost is higher)' : ''}, before scholarships. Ask the coach what's available.` });
    else if (cv.kind === 'tuition') push({ key: 'max_cost_usd_per_year', hard: false, status: 'unknown', label: 'Total cost unverified', detail: `Tuition & fees ${usd(cv.amount)} fits, but room and board are not in our figure.` });
    else push({ key: 'max_cost_usd_per_year', hard: false, status: 'match', label: `${usd(cv.amount)} / yr`, detail: 'Before scholarships. Ask the coach what\'s available.' });
    if (c.rugby_aid == null) push({ key: 'rugby_aid', hard: false, status: 'unknown', label: 'Aid: ask the coach', detail: "Rugby recruits often get some aid. The coach can tell you what's possible." });
  }
  if (f.religion && f.religion !== 'any') {
    const g = c.religion_group;
    if (!g) push({ key: 'religion', hard: false, status: 'unknown', label: 'Religion unverified' });
    else if (f.religion === 'none_only') {
      if (g === 'none') push({ key: 'religion', hard: false, status: 'match', label: 'Not religious' });
      else if (g === 'none_formal') push({ key: 'religion', hard: false, status: 'unknown', label: 'Religious roots, no formal control', detail: c.religious_affiliation ?? undefined });
      else push({ key: 'religion', hard: false, status: 'miss', label: c.religious_affiliation ?? 'Religious' });
    } else if (f.religion === 'religious') {
      if (g === 'catholic' || g === 'christian_other' || g === 'other') push({ key: 'religion', hard: false, status: 'match', label: c.religious_affiliation ?? 'Religious' });
      else if (g === 'none_formal') push({ key: 'religion', hard: false, status: 'unknown', label: 'Religious roots, no formal control', detail: c.religious_affiliation ?? undefined });
      else push({ key: 'religion', hard: false, status: 'miss', label: 'Not religious' });
    } else if (f.religion === 'catholic') push(g === 'catholic' ? { key: 'religion', hard: false, status: 'match', label: 'Catholic' } : { key: 'religion', hard: false, status: 'miss', label: g === 'none' ? 'Not religious' : (c.religious_affiliation ?? 'Other') });
    else if (f.religion === 'christian_other') push(g === 'christian_other' ? { key: 'religion', hard: false, status: 'match', label: c.religious_affiliation ?? 'Christian' } : { key: 'religion', hard: false, status: 'miss', label: g === 'none' ? 'Not religious' : (c.religious_affiliation ?? 'Other') });
  }
  if (f.climate.length) {
    const band = climateBand(c.winter_avg_computed_f);
    if (!band || c.winter_avg_computed_f == null) push({ key: 'climate', hard: false, status: 'unknown', label: 'Climate unverified' });
    else {
      const winter = Math.round(c.winter_avg_computed_f);
      const label = `${CLIMATE_LABEL[band]} (${winter}°F / ${fToC(winter)}°C)`;
      push(f.climate.includes(band) ? { key: 'climate', hard: false, status: 'match', label } : { key: 'climate', hard: false, status: 'miss', label });
      if (isVeryHot(c) && f.climate.includes('warm_winters')) push({ key: 'very_hot', hard: false, status: 'unknown', label: 'Very hot summers', detail: 'Summer highs of 95°F (35°C) or more.' });
    }
  }
  if (f.majors.length) {
    const grads = (key: string) => (MAJOR_FIELDS[key]?.cip2 ?? []).reduce((a, k) => a + (c.majors_cip2?.[k] ?? 0), 0);
    const hits = f.majors.filter((k) => grads(k) > 0);
    if (!c.majors_cip2 || Object.keys(c.majors_cip2).length === 0) push({ key: 'majors', hard: false, status: 'unknown', label: 'Majors unverified' });
    else if (hits.length) push({ key: 'majors', hard: false, status: 'match', label: hits.map((k) => MAJOR_FIELDS[k].label).join(' + ') });
    else push({ key: 'majors', hard: false, status: 'miss', label: `No ${filterLabel.majors(f.majors)} graduates found`, detail: 'Based on 2023-24 degrees awarded; a new program could be missing. Check the college site.' });
  }
  if (f.rugby_tier.length) {
    push(c.rugby_tier ? (f.rugby_tier.includes(c.rugby_tier) ? { key: 'rugby_tier', hard: false, status: 'match', label: TIER_LABEL[c.rugby_tier] } : { key: 'rugby_tier', hard: false, status: 'miss', label: TIER_LABEL[c.rugby_tier] }) : { key: 'rugby_tier', hard: false, status: 'unknown', label: 'Rugby level unverified' });
  }
  if (f.rugby_program) {
    push(c.mens_rugby_program_type ? (c.mens_rugby_program_type === f.rugby_program ? { key: 'rugby_program', hard: false, status: 'match', label: f.rugby_program === 'varsity' ? 'Varsity rugby' : 'Club rugby' } : { key: 'rugby_program', hard: false, status: 'miss', label: c.mens_rugby_program_type === 'varsity' ? 'Varsity rugby' : 'Club rugby' }) : { key: 'rugby_program', hard: false, status: 'unknown', label: 'Program type unverified' });
  }
  void slug;
  return out;
}

function toResult(slug: string, c: CollegeFacts, f: Filters): Result {
  const checks = evaluate(slug, c, f);
  const hardMisses = checks.filter((x) => x.hard && x.status === 'miss');
  const softMisses = checks.filter((x) => !x.hard && x.status === 'miss');
  const unknowns = checks.filter((x) => x.status === 'unknown');
  const softMatches = checks.filter((x) => !x.hard && x.status === 'match').length;
  return { slug, checks, hardMisses, softMisses, unknowns, softMatches, score: softMatches * 2 - softMisses.length, closest: false };
}
const byRank = (a: Result, b: Result, facts: Record<string, CollegeFacts>) =>
  b.score - a.score || (TIER_RANK[facts[a.slug].rugby_tier ?? 'emerging'] ?? 9) - (TIER_RANK[facts[b.slug].rugby_tier ?? 'emerging'] ?? 9) || facts[a.slug].name.localeCompare(facts[b.slug].name);

const missCount = (r: Result) => r.checks.filter((x) => x.status === 'miss').length;

export function search(facts: Record<string, CollegeFacts>, f: Filters): SearchOutcome {
  const all = Object.keys(facts).map((s) => toResult(s, facts[s], f));
  const active = all.some((r) => r.checks.length > 0);
  const fitsAll = all.filter((r) => missCount(r) === 0).sort((a, b) => byRank(a, b, facts));
  const close = all.filter((r) => missCount(r) > 0).sort((a, b) => missCount(a) - missCount(b) || byRank(a, b, facts));
  const idle = all.sort((a, b) => byRank(a, b, facts));
  return { active, fitsAll, close, fitsAllCount: fitsAll.length, results: active ? [...fitsAll, ...close] : idle };
}

export function describeFilters(f: Filters): { key: string; label: string }[] {
  const o: { key: string; label: string }[] = [];
  if (f.states.length || f.regions.length) {
    const parts = [f.states.length ? filterLabel.states(f.states) : '', f.regions.length ? `${filterLabel.regions(f.regions)} US` : ''].filter(Boolean);
    o.push({ key: 'where', label: parts.join(' or ') });
  }
  if (f.control.length) o.push({ key: 'control', label: filterLabel.control(f.control) });
  if (f.setting.length) o.push({ key: 'setting', label: filterLabel.setting(f.setting) });
  if (f.division.length) o.push({ key: 'division', label: filterLabel.division(f.division) });
  if (f.size_band.length) o.push({ key: 'size_band', label: filterLabel.size_band(f.size_band) });
  if (f.conference.length) o.push({ key: 'conference', label: f.conference.join(' / ') });
  if (f.max_cost_usd_per_year != null) o.push({ key: 'max_cost_usd_per_year', label: 'Up to ' + usd(f.max_cost_usd_per_year) + '/yr' });
  if (f.religion && f.religion !== 'any') o.push({ key: 'religion', label: ({ none_only: 'Not religious', religious: 'Religious college', catholic: 'Catholic', christian_other: 'Other Christian' } as Record<string, string>)[f.religion] });
  if (f.climate.length) o.push({ key: 'climate', label: filterLabel.climate(f.climate) });
  if (f.majors.length) o.push({ key: 'majors', label: filterLabel.majors(f.majors) });
  if (f.rugby_tier.length) o.push({ key: 'rugby_tier', label: filterLabel.rugby_tier(f.rugby_tier) });
  if (f.rugby_program) o.push({ key: 'rugby_program', label: f.rugby_program === 'varsity' ? 'Varsity rugby' : 'Club rugby' });
  return o;
}
