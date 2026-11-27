// Post-launch audit (Nov 2026): three sentences the live search got wrong, plus the rule layer that fixes them.
// The spy replays what the live model actually returned for each sentence, so the fix is proven against the real failure.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockEnv, search } from './helpers';
import facts from '../../src/data/collegeSearchFacts.json';
import type { FactsFile } from '../../src/lib/search/facts';
import { AFFORDABLE_MAX_USD, applySentenceRules, emptyFilters, parseFilters, SELECTIVE_MAX_ADMIT_RATE, type Filters } from '../../src/lib/search/filters';
import { describeFilters, search as runSearch } from '../../src/lib/search/match';

const F = (facts as unknown as FactsFile).colleges;
const EMPTY = { residency: null, home_state: null, states: [], regions: [], control: [], setting: [], division: [], size_band: [], conference: [], max_cost_usd_per_year: null, religion: null, climate: [], majors: [], rugby_tier: [], rugby_program: null, unparsed: [] };

beforeEach(() => mockEnv());

async function withModel(sentence: string, modelOut: Record<string, unknown>): Promise<Filters> {
  const llm = await import('../../api/_lib/llm');
  const spy = vi.spyOn(llm, 'callModel').mockResolvedValue({ text: JSON.stringify({ ...EMPTY, ...modelOut }), tokensIn: 900, tokensOut: 60, model: 'gemini-3.1-flash-lite' });
  const r = await search(sentence);
  spy.mockRestore();
  expect(r.code).toBe(200);
  expect(r.body.ok).toBe(true);
  return r.body.filters as Filters;
}
const slugsOf = (rows: { slug: string }[]) => rows.map((r) => r.slug);

describe('"affordable D1 rugby programs in the Midwest"', () => {
  const sentence = 'affordable D1 rugby programs in the Midwest';
  it('D1 means D1 rugby, not NCAA Division I, and "affordable" becomes a cost band', async () => {
    // What the live model returned: NCAA D1, and "affordable" ignored.
    const f = await withModel(sentence, { regions: ['midwest'], division: ['d1'], unparsed: ['affordable'] });
    expect(f.division).toEqual([]);
    expect(f.rugby_level).toBe('d1');
    expect(f.budget).toBe('affordable');
    expect(f.unparsed).toEqual([]);
    expect(f.rugby_tier).toEqual([]);
  });
  it('keeps the affordable Midwest D1 rugby schools in "fits everything" and moves Notre Dame out', async () => {
    const f = await withModel(sentence, { regions: ['midwest'], division: ['d1'] });
    const out = runSearch(F, f);
    const fits = slugsOf(out.fitsAll);
    for (const s of ['davenport-university', 'marian-university', 'walsh-university', 'mckendree-university', 'aquinas-college', 'indiana-institute-of-technology', 'lindenwood-university']) expect(fits, s).toContain(s);
    expect(fits).not.toContain('university-of-notre-dame');
    const nd = out.close.find((r) => r.slug === 'university-of-notre-dame')!;
    expect(nd.softMisses.map((m) => m.key)).toEqual(['max_cost_usd_per_year']);
    // Rio Grande only publishes an in-state price: it stays listed (grey, never a miss), straight after the fits.
    const rio = out.close.find((r) => r.slug === 'university-of-rio-grande')!;
    expect(rio.softMisses).toEqual([]);
    expect(out.close.indexOf(rio)).toBeLessThan(out.close.indexOf(nd));
    // Every result is still listed.
    expect(out.results.length).toBe(Object.keys(F).length);
  });
  it('sorts equally good fits cheapest first', async () => {
    const f = await withModel(sentence, { regions: ['midwest'] });
    const costs = runSearch(F, f).fitsAll.map((r) => F[r.slug].total_cost_out_of_state ?? 0);
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
    expect(costs.every((c) => c <= AFFORDABLE_MAX_USD)).toBe(true);
  });
});

describe('"warm weather college rugby with good academics"', () => {
  const sentence = 'warm weather college rugby with good academics';
  it('drops the Tier 1/2 filter the user never asked for and maps "good academics" to admit rate', async () => {
    // What the live model returned: an invented Tier 1-2 filter, academics ignored.
    const f = await withModel(sentence, { climate: ['warm_winters'], rugby_tier: ['championship', 'playoff'], unparsed: ['good academics'] });
    expect(f.rugby_tier).toEqual([]);
    expect(f.academics).toBe('strong');
    expect(f.unparsed).toEqual([]);
  });
  it('San Diego, UCLA, Santa Clara and Long Beach fit; St. Thomas (FL) is listed with one honest miss', async () => {
    const f = await withModel(sentence, { climate: ['warm_winters'], rugby_tier: ['championship', 'playoff'] });
    const out = runSearch(F, f);
    const fits = slugsOf(out.fitsAll);
    for (const s of ['university-of-san-diego', 'university-of-california-los-angeles-ucla', 'santa-clara-university', 'california-state-university-long-beach']) expect(fits, s).toContain(s);
    const stu = out.close.find((r) => r.slug === 'st-thomas-university-florida')!;
    expect(stu.softMisses.map((m) => m.key)).toEqual(['academics']);
    expect(stu.checks.some((c) => c.key === 'rugby_tier')).toBe(false);
  });
  it('no "Very hot summers" grey pill on Arizona or Grand Canyon (shown as a plain note instead)', async () => {
    const f = await withModel(sentence, { climate: ['warm_winters'] });
    const out = runSearch(F, f);
    for (const s of ['university-of-arizona', 'grand-canyon-university']) {
      const r = out.results.find((x) => x.slug === s)!;
      expect(r.checks.some((c) => c.key === 'very_hot' || /very hot/i.test(c.label))).toBe(false);
    }
  });
});

describe('"D1 rugby on the East Coast"', () => {
  const sentence = 'D1 rugby on the East Coast';
  it('East Coast covers the Northeast, Mid-Atlantic and Southeast, not the Northeast only', async () => {
    // What the live model returned: Northeast only.
    const f = await withModel(sentence, { regions: ['northeast'] });
    expect(f.regions).toEqual(['east_coast']);
    const out = runSearch(F, f);
    const fits = slugsOf(out.fitsAll);
    for (const s of ['mount-st-mary-s-university', 'belmont-abbey-college', 'united-states-naval-academy', 'brown-university', 'queens-university-of-charlotte', 'st-thomas-university-florida', 'life-university']) expect(fits, s).toContain(s);
    for (const s of ['university-of-notre-dame', 'university-of-california-berkeley', 'university-of-utah']) expect(fits, s).not.toContain(s);
    expect(describeFilters(f).find((c) => c.key === 'where')!.label).toBe('East Coast US');
  });
  it('keeps an explicit second region the user named', async () => {
    const f = await withModel('east coast or the midwest', { regions: ['northeast', 'midwest'] });
    expect([...f.regions].sort()).toEqual(['east_coast', 'midwest']);
  });
});

describe('sentence rules: edge cases', () => {
  const rules = (s: string, o: Partial<Filters> = {}) => applySentenceRules(s, parseFilters({ ...emptyFilters(), ...o })!);
  it.each([
    'top rugby and engineering', 'best D1 rugby programs', 'competitive rugby, mild winters', 'tier 1 programs only', 'championship level team',
    'good rugby in the south', 'a strong team near a city', 'high-level rugby', 'title-winning program', 'play at the highest level',
  ])('keeps a tier the user asked for: %s', (s) => {
    expect(rules(s, { rugby_tier: ['championship', 'playoff'] }).rugby_tier).toEqual(['championship', 'playoff']);
  });
  it.each([
    'warm weather college rugby with good academics', 'good academics and rugby', 'D1 rugby in Ohio', 'college rugby in California',
    'competitive admissions, engineering', 'cheap, warm, business',
  ])('drops a tier the user did not ask for: %s', (s) => {
    expect(rules(s, { rugby_tier: ['championship', 'playoff'] }).rugby_tier).toEqual([]);
  });
  it('"NCAA D1" still means the athletics division', () => {
    const f = rules('NCAA D1 school in Ohio', { division: ['d1'] });
    expect(f.division).toEqual(['d1']);
    expect(f.rugby_level).toBeNull();
  });
  it.each(['D1', 'd1 rugby', 'D1A rugby', 'D1AA', 'Division 1 rugby', 'division I'])('"%s" is D1 rugby', (s) => {
    const f = rules(s, { division: ['d1'] });
    expect(f.division).toEqual([]);
    expect(f.rugby_level).toBe('d1');
  });
  it('"D2" is not touched (an NCAA division, not a rugby level)', () => {
    expect(rules('snow is fine, d2', { division: ['d2'] }).division).toEqual(['d2']);
  });
  it.each(['affordable', 'cheap', 'cheapest options', 'low-cost', 'on a budget', 'not too expensive', 'budget-friendly'])('"%s" sets the affordable budget', (s) => {
    expect(rules(s, { unparsed: [s] })).toMatchObject({ budget: 'affordable', unparsed: [] });
  });
  it('a stated number wins over "affordable" in matching and in the chip', () => {
    const f = rules('affordable, under $40k', { max_cost_usd_per_year: 40000 });
    expect(f.budget).toBe('affordable');
    const chips = describeFilters(f);
    expect(chips.find((c) => c.key === 'max_cost_usd_per_year')!.label).toBe('Up to $40,000/yr');
    expect(chips.some((c) => c.key === 'budget')).toBe(false);
    const ucla = runSearch(F, f).results.find((r) => r.slug === 'university-of-california-los-angeles-ucla')!;
    expect(ucla.checks.find((c) => c.key === 'max_cost_usd_per_year')!.status).toBe('miss');
  });
  it.each(['good academics', 'strong academics', 'top academic schools', 'academically strong', 'a selective college', 'prestigious'])('"%s" sets strong academics', (s) => {
    expect(rules(s).academics).toBe('strong');
  });
  it('"admits N% or fewer" is the academics rule, and unknown admit rate is grey, never a miss', () => {
    const f = rules('good academics');
    const out = runSearch(F, f);
    const nd = out.results.find((r) => r.slug === 'university-of-notre-dame')!;
    expect(nd.checks.find((c) => c.key === 'academics')).toMatchObject({ status: 'match', label: 'Admits 11%' });
    const rio = out.results.find((r) => r.slug === 'university-of-rio-grande')!;
    expect(rio.checks.find((c) => c.key === 'academics')!.status).toBe('unknown');
    expect(SELECTIVE_MAX_ADMIT_RATE).toBe(60);
  });
  it('old shared links (filter version 3, no new keys) still parse', () => {
    const f = parseFilters({ version: 3, regions: ['midwest'], max_cost_usd_per_year: 50000 })!;
    expect(f).toMatchObject({ regions: ['midwest'], budget: null, academics: null, rugby_level: null });
  });
  it('the mock parser and the rules agree on the three audit sentences', async () => {
    const a = (await search('affordable D1 rugby programs in the Midwest')).body.filters;
    expect(a).toMatchObject({ regions: ['midwest'], division: [], rugby_level: 'd1', budget: 'affordable', rugby_tier: [] });
    const b = (await search('warm weather college rugby with good academics')).body.filters;
    expect(b).toMatchObject({ climate: ['warm_winters'], academics: 'strong', rugby_tier: [] });
    const c = (await search('D1 rugby on the East Coast')).body.filters;
    expect(c).toMatchObject({ regions: ['east_coast'], rugby_level: 'd1' });
  });
});
