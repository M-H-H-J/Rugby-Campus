// Pure matching engine. No AI, no network. Answers come only from our stored facts.
// RULE: an unknown/null value NEVER excludes a college. Only HARD filters can drop a college, and only on a clear miss of a known value.
import type { CollegeFacts } from './facts';
import { HARD_KEYS, MAJOR_FIELDS, type Filters } from './filters';
import { costFor, usd } from './cost';

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
  active: boolean;        // any filter set at all
  results: Result[];      // best first
  exactCount: number;     // colleges passing every hard filter
  usedClosest: boolean;
  message: string | null; // plain-English line shown above results
  relaxHint: { key: string; label: string; wouldAdd: number } | null;
}
export const MIN_EXACT = 3;
export const MAX_CLOSEST_TOTAL = 6;

const TIER_RANK: Record<string, number> = { championship: 0, playoff: 1, competitive: 2, emerging: 3 };

const DIV: Record<string, string> = { ncaa_d1: 'd1', ncaa_d2: 'd2', ncaa_d3: 'd3', naia: 'naia' };
const DIV_LABEL: Record<string, string> = { d1: 'NCAA D1', d2: 'NCAA D2', d3: 'NCAA D3', naia: 'NAIA' };
const CONTROL_LABEL: Record<string, string> = { public: 'Public', private_nonprofit: 'Private' };
const SETTING_LABEL: Record<string, string> = { city: 'City', suburb: 'Suburb', town: 'Town', rural: 'Rural' };
const SIZE_LABEL: Record<string, string> = { small: 'Small (<3k)', medium: 'Medium (3-10k)', large: 'Large (10-25k)', very_large: 'Very large (25k+)' };
const FB_LABEL: Record<string, string> = { fbs: 'FBS football', fcs: 'FCS football', d2: 'D2 football', d3: 'D3 football', naia: 'NAIA football', none: 'No football' };
const CLIMATE_LABEL: Record<string, string> = { mild_winters: 'Mild winters', has_seasons: 'Has seasons', cold_winters: 'Cold winters', hot: 'Hot' };
const TIER_LABEL: Record<string, string> = { championship: 'Often near the top', playoff: 'Playoff calibre', competitive: 'Competitive', emerging: 'Up and coming' };
const STATE_NAMES: Record<string, string> = { AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'Washington DC',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming' };
export const stateName = (c: string) => STATE_NAMES[c] ?? c;

export const filterLabel = {
  states: (v: string[]) => v.map(stateName).join(' / '),
  regions: (v: string[]) => v.map((x) => x[0].toUpperCase() + x.slice(1)).join(' / '),
  control: (v: string[]) => v.map((x) => CONTROL_LABEL[x] ?? x).join(' / '),
  setting: (v: string[]) => v.map((x) => SETTING_LABEL[x] ?? x).join(' / '),
  division: (v: string[]) => v.map((x) => DIV_LABEL[x] ?? x).join(' / '),
  size_band: (v: string[]) => v.map((x) => SIZE_LABEL[x] ?? x).join(' / '),
  football_level: (v: string[]) => v.map((x) => FB_LABEL[x] ?? x).join(' / '),
  climate: (v: string[]) => v.map((x) => CLIMATE_LABEL[x] ?? x).join(' / '),
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

function climateOf(c: CollegeFacts): Set<string> | null {
  if (c.winter_avg_computed_f == null) return null;
  const s = new Set<string>();
  const w = c.winter_avg_computed_f;
  if (w >= 45) s.add('mild_winters'); else if (w >= 30) s.add('has_seasons'); else s.add('cold_winters');
  if (c.summer_high_f != null && c.summer_high_f >= 95) s.add('hot');
  return s;
}

/** Evaluate one college against the filters. */
export function evaluate(slug: string, c: CollegeFacts, f: Filters): Check[] {
  const out: Check[] = [];
  const push = (x: Check) => out.push(x);

  // ---------- HARD ----------
  if (f.states.length) {
    push(c.state ? (f.states.includes(c.state as never) ? { key: 'states', hard: true, status: 'match', label: stateName(c.state) } : { key: 'states', hard: true, status: 'miss', label: `Not in ${filterLabel.states(f.states)}`, detail: `It is in ${stateName(c.state)}.` }) : { key: 'states', hard: true, status: 'unknown', label: 'State unverified' });
  }
  if (f.regions.length) {
    const r = c.region_census?.toLowerCase();
    push(r ? (f.regions.includes(r as never) ? { key: 'regions', hard: true, status: 'match', label: `${c.region_census} US` } : { key: 'regions', hard: true, status: 'miss', label: `Not ${filterLabel.regions(f.regions)}`, detail: `It is in the ${c.region_census}.` }) : { key: 'regions', hard: true, status: 'unknown', label: 'Region unverified' });
  }
  if (f.control.length) {
    const v = c.control === 'private_forprofit' ? null : c.control;
    push(v ? (f.control.includes(v as never) ? { key: 'control', hard: true, status: 'match', label: CONTROL_LABEL[v] } : { key: 'control', hard: true, status: 'miss', label: `${CONTROL_LABEL[v]} (not ${filterLabel.control(f.control)})` }) : { key: 'control', hard: true, status: 'unknown', label: 'Type unverified' });
  }
  if (f.setting.length) {
    push(c.setting ? (f.setting.includes(c.setting) ? { key: 'setting', hard: true, status: 'match', label: SETTING_LABEL[c.setting] } : { key: 'setting', hard: true, status: 'miss', label: `${SETTING_LABEL[c.setting]} setting`, detail: `Campus is classed as ${c.setting}, you asked for ${filterLabel.setting(f.setting).toLowerCase()}.` }) : { key: 'setting', hard: true, status: 'unknown', label: 'Setting unverified' });
  }
  if (f.division.length) {
    const d = c.athletics_division ? DIV[c.athletics_division] : null;
    push(d ? (f.division.includes(d as never) ? { key: 'division', hard: true, status: 'match', label: DIV_LABEL[d] } : { key: 'division', hard: true, status: 'miss', label: `${DIV_LABEL[d]} (not ${filterLabel.division(f.division)})` }) : { key: 'division', hard: true, status: 'unknown', label: 'Division unverified' });
  }
  if (f.size_band.length) {
    push(c.size_band ? (f.size_band.includes(c.size_band) ? { key: 'size_band', hard: true, status: 'match', label: SIZE_LABEL[c.size_band] } : { key: 'size_band', hard: true, status: 'miss', label: `${SIZE_LABEL[c.size_band]}`, detail: `About ${c.enrollment_undergrad?.toLocaleString() ?? '?'} undergraduates.` }) : { key: 'size_band', hard: true, status: 'unknown', label: 'Size unverified' });
  }

  // ---------- SOFT ----------
  if (f.football_level.length) {
    push(c.football_level ? (f.football_level.includes(c.football_level) ? { key: 'football_level', hard: false, status: 'match', label: FB_LABEL[c.football_level] } : { key: 'football_level', hard: false, status: 'miss', label: FB_LABEL[c.football_level] }) : { key: 'football_level', hard: false, status: 'unknown', label: 'Football level unverified' });
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
  }
  if (f.religion && f.religion !== 'any') {
    const g = c.religion_group;
    if (!g) push({ key: 'religion', hard: false, status: 'unknown', label: 'Religion unverified' });
    else if (f.religion === 'none_only') {
      if (g === 'none') push({ key: 'religion', hard: false, status: 'match', label: 'Not religious' });
      else if (g === 'none_formal') push({ key: 'religion', hard: false, status: 'unknown', label: 'Religious roots, no formal control', detail: c.religious_affiliation ?? undefined });
      else push({ key: 'religion', hard: false, status: 'miss', label: c.religious_affiliation ?? 'Religious' });
    } else if (f.religion === 'catholic') push(g === 'catholic' ? { key: 'religion', hard: false, status: 'match', label: 'Catholic' } : { key: 'religion', hard: false, status: 'miss', label: g === 'none' ? 'Not religious' : (c.religious_affiliation ?? 'Other') });
    else if (f.religion === 'christian_other') push(g === 'christian_other' ? { key: 'religion', hard: false, status: 'match', label: c.religious_affiliation ?? 'Christian' } : { key: 'religion', hard: false, status: 'miss', label: g === 'none' ? 'Not religious' : (c.religious_affiliation ?? 'Other') });
  }
  if (f.climate.length) {
    const cs = climateOf(c);
    if (!cs) push({ key: 'climate', hard: false, status: 'unknown', label: 'Climate unverified' });
    else {
      const hit = f.climate.some((x) => cs.has(x));
      const t = `${c.climate_tag ?? ''}${c.winter_avg_computed_f != null ? ` (winter avg ${Math.round(c.winter_avg_computed_f)}°F)` : ''}`;
      push(hit ? { key: 'climate', hard: false, status: 'match', label: c.climate_tag ?? 'Climate', detail: t } : { key: 'climate', hard: false, status: 'miss', label: c.climate_tag ?? 'Other climate', detail: t });
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

export function activeHardKeys(f: Filters): (typeof HARD_KEYS)[number][] {
  return HARD_KEYS.filter((k) => (f[k] as unknown[]).length > 0);
}

export function search(facts: Record<string, CollegeFacts>, f: Filters): SearchOutcome {
  const slugs = Object.keys(facts);
  const all = slugs.map((s) => toResult(s, facts[s], f));
  const anyCheck = all.some((r) => r.checks.length > 0);
  if (!anyCheck) {
    return { active: false, results: all.sort((a, b) => byRank(a, b, facts)), exactCount: all.length, usedClosest: false, message: null, relaxHint: null };
  }
  const exact = all.filter((r) => r.hardMisses.length === 0).sort((a, b) => byRank(a, b, facts));
  let results = exact;
  let usedClosest = false;
  let message: string | null = null;
  let relaxHint: SearchOutcome['relaxHint'] = null;
  const hardKeys = activeHardKeys(f);
  if (exact.length < MIN_EXACT) {
    usedClosest = true;
    const need = Math.max(0, MAX_CLOSEST_TOTAL - exact.length);
    const near = all.filter((r) => r.hardMisses.length > 0)
      .sort((a, b) => a.hardMisses.length - b.hardMisses.length || byRank(a, b, facts))
      .slice(0, need).map((r) => ({ ...r, closest: true }));
    results = [...exact, ...near];
    const want = hardKeys.map((k) => `${k === 'states' ? 'state' : k === 'regions' ? 'region' : k === 'size_band' ? 'size' : k}: ${(filterLabel as Record<string, (v: string[]) => string>)[k](f[k] as string[])}`).join(', ');
    message = exact.length === 0
      ? `Nothing in our list fits every one of your must-haves (${want}). These are the closest. What didn't fit is shown on each card.`
      : `Only ${exact.length} of our ${slugs.length} colleges fit everything (${want}). The rest are the closest matches. What didn't fit is shown on each card.`;
    // which single hard filter, if relaxed, brings in the most colleges?
    let best: { key: string; wouldAdd: number } | null = null;
    for (const k of hardKeys) {
      const relaxed = { ...f, [k]: [] } as Filters;
      const n = slugs.filter((s) => toResult(s, facts[s], relaxed).hardMisses.length === 0).length - exact.length;
      if (n > 0 && (!best || n > best.wouldAdd)) best = { key: k, wouldAdd: n };
    }
    if (best) {
      const lab = (filterLabel as Record<string, (v: string[]) => string>)[best.key](f[best.key as keyof Filters] as string[]);
      relaxHint = { key: best.key, label: lab, wouldAdd: best.wouldAdd };
      message += ` Dropping "${lab}" would add ${best.wouldAdd} more.`;
    }
  }
  return { active: true, results, exactCount: exact.length, usedClosest, message, relaxHint };
}

export function describeFilters(f: Filters): { key: string; label: string; hard: boolean }[] {
  const o: { key: string; label: string; hard: boolean }[] = [];
  if (f.states.length) o.push({ key: 'states', label: filterLabel.states(f.states), hard: true });
  if (f.regions.length) o.push({ key: 'regions', label: filterLabel.regions(f.regions) + ' US', hard: true });
  if (f.control.length) o.push({ key: 'control', label: filterLabel.control(f.control), hard: true });
  if (f.setting.length) o.push({ key: 'setting', label: filterLabel.setting(f.setting), hard: true });
  if (f.division.length) o.push({ key: 'division', label: filterLabel.division(f.division), hard: true });
  if (f.size_band.length) o.push({ key: 'size_band', label: filterLabel.size_band(f.size_band), hard: true });
  if (f.football_level.length) o.push({ key: 'football_level', label: filterLabel.football_level(f.football_level), hard: false });
  if (f.conference.length) o.push({ key: 'conference', label: f.conference.join(' / '), hard: false });
  if (f.max_cost_usd_per_year != null) o.push({ key: 'max_cost_usd_per_year', label: 'Up to ' + usd(f.max_cost_usd_per_year) + '/yr', hard: false });
  if (f.religion && f.religion !== 'any') o.push({ key: 'religion', label: ({ none_only: 'Not religious', catholic: 'Catholic', christian_other: 'Other Christian' } as Record<string, string>)[f.religion], hard: false });
  if (f.climate.length) o.push({ key: 'climate', label: filterLabel.climate(f.climate), hard: false });
  if (f.majors.length) o.push({ key: 'majors', label: filterLabel.majors(f.majors), hard: false });
  if (f.rugby_tier.length) o.push({ key: 'rugby_tier', label: filterLabel.rugby_tier(f.rugby_tier), hard: false });
  if (f.rugby_program) o.push({ key: 'rugby_program', label: f.rugby_program === 'varsity' ? 'Varsity rugby' : 'Club rugby', hard: false });
  return o;
}
