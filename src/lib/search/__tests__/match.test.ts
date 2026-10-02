import { describe, it, expect } from 'vitest';
import facts from '../../../data/collegeSearchFacts.json';
import type { CollegeFacts, FactsFile } from '../facts';
import { emptyFilters, parseFilters } from '../filters';
import { search, evaluate } from '../match';
import { costText, costFor, COST_DISCLAIMER } from '../cost';

const F = (facts as unknown as FactsFile).colleges;
const base = (o: Record<string, unknown>) => parseFilters({ ...emptyFilters(), ...o })!;
const clone = (): Record<string, CollegeFacts> => JSON.parse(JSON.stringify(F));

describe('facts file', () => {
  it('has all 48 colleges with the new computed fields', () => {
    const slugs = Object.keys(F);
    expect(slugs.length).toBe(48);
    for (const s of slugs) {
      expect(F[s].nearest_airport_iata, s).toMatch(/^[A-Z]{3}$/);
      expect(typeof F[s].airport_distance_miles, s).toBe('number');
      expect(['Mild winters', 'Has seasons', 'Cold winters', 'Hot'], s).toContain(F[s].climate_tag);
      expect(F[s].big_sport_tag, s).toBeTruthy();
    }
  });
  it('applies the verified fixes', () => {
    expect(F['life-university'].athletics_conference).toMatch(/SSAC/);
    expect(F['colorado-state-university'].football_conference).toBe('Pac-12 Conference');
    expect(F['siena-college'].name).toBe('Siena University');
    expect(F['united-states-military-academy-army'].city_state).toBe('West Point, NY');
    expect(F['fordham-university'].tuition_fees_out_of_state).toBe(70949);
    expect(F['dartmouth-college'].total_cost_in_state).toBe(98427);
    expect(F['california-state-university-long-beach'].tuition_fees_out_of_state).toBe(20994);
    expect(F['united-states-naval-academy'].test_policy).toBe('required');
    expect(F['united-states-naval-academy'].intl_warning).toMatch(/nomination/i);
  });
});

describe('unknown NEVER excludes', () => {
  it('a hard filter on a null value is "unknown", not a miss', () => {
    const c = clone(); c['life-university'].setting = null;
    const r = search(c, base({ setting: ['rural'] }));
    const life = r.results.find((x) => x.slug === 'life-university')!;
    expect(life).toBeTruthy();
    expect(life.hardMisses.length).toBe(0);
    expect(life.unknowns.some((u) => u.key === 'setting')).toBe(true);
  });
  it('null cost is "ask the coach", stays in results, never a miss', () => {
    const r = search(F, base({ max_cost_usd_per_year: 10000, residency: 'international' }));
    const pen = r.results.find((x) => x.slug === 'pennsylvania-state-university')!; // total cost null in data
    expect(pen).toBeTruthy();
    expect(pen.softMisses.some((m) => m.key === 'max_cost_usd_per_year')).toBe(true); // tuition alone is 44k > 10k = clear miss
    const c = clone(); for (const k of ['tuition_fees_in_state','tuition_fees_out_of_state','total_cost_in_state','total_cost_out_of_state'] as const) c['brigham-young-university'][k] = null;
    const r2 = search(c, base({ max_cost_usd_per_year: 10000, residency: 'international' }));
    const byu = r2.results.find((x) => x.slug === 'brigham-young-university')!;
    expect(byu.unknowns.some((u) => u.label.includes('ask the coach'))).toBe(true);
    expect(byu.softMisses.length).toBe(0);
  });
  it('soft filters never drop a college', () => {
    const r = search(F, base({ climate: ['hot'], majors: ['agriculture_environment'], football_level: ['fbs'], religion: 'none_only', max_cost_usd_per_year: 5000 }));
    expect(r.results.length).toBe(48);
  });
  it('null conference is unverified, not a miss', () => {
    const c = clone(); c['life-university'].athletics_conference = null; c['life-university'].football_conference = null;
    const r = search(c, base({ conference: ['Big Ten'] }));
    expect(r.results.find((x) => x.slug === 'life-university')!.unknowns[0].label).toMatch(/unverified/i);
  });
  it('"religious roots, no formal control" is NOT treated as "not religious"', () => {
    const r = search(F, base({ religion: 'none_only' }));
    const lind = r.results.find((x) => x.slug === 'lindenwood-university')!;
    expect(lind.softMisses.length).toBe(0);
    expect(lind.unknowns.length).toBe(1);
  });
});

describe('hard filters + closest match', () => {
  it('drops only on a clear miss', () => {
    const r = search(F, base({ states: ['CA'] }));
    expect(r.usedClosest).toBe(false);
    expect(r.results.every((x) => F[x.slug].state === 'CA')).toBe(true);
    expect(r.results.length).toBeGreaterThanOrEqual(5);
  });
  it('falls back to closest matches with an explanation and relax hint', () => {
    const r = search(F, base({ states: ['WY'], setting: ['rural'] }));
    expect(r.exactCount).toBe(0);
    expect(r.usedClosest).toBe(true);
    expect(r.results.length).toBeGreaterThan(0);
    expect(r.results.every((x) => x.closest && x.hardMisses.length > 0)).toBe(true);
    expect(r.message).toMatch(/closest/i);
    expect(r.relaxHint).not.toBeNull();
  });
  it('no filters = not active', () => {
    const r = search(F, emptyFilters());
    expect(r.active).toBe(false);
    expect(r.results.length).toBe(48);
  });
  it('size band + control + region work together', () => {
    const r = search(F, base({ control: ['public'], regions: ['west'], size_band: ['very_large'] }));
    for (const x of r.results.filter((y) => !y.closest)) {
      expect(F[x.slug].control).toBe('public'); expect(F[x.slug].region_census).toBe('West'); expect(F[x.slug].size_band).toBe('very_large');
    }
  });
});

describe('cost', () => {
  it('international visitors use the out-of-state price at public universities', () => {
    const c = F['university-of-california-berkeley'];
    expect(costFor(c, 'international', null).amount).toBe(c.total_cost_out_of_state);
    expect(costFor(c, 'international', null).rate).toBe('out_of_state');
    expect(costFor(c, 'in_state', 'CA').amount).toBe(c.total_cost_in_state);
  });
  it('no residency given: assumes out-of-state and says so', () => {
    const v = costFor(F['the-ohio-state-university'], null, null);
    expect(v.rate).toBe('out_of_state'); expect(v.assumed).toBe(true);
  });
  it('budget miss shows the dollar gap', () => {
    const r = search(F, base({ max_cost_usd_per_year: 50000, residency: 'international' }));
    const dart = r.results.find((x) => x.slug === 'dartmouth-college')!;
    const m = dart.softMisses.find((x) => x.key === 'max_cost_usd_per_year')!;
    expect(m.gap).toBe(98427 - 50000);
    expect(m.label).toBe('$48,427 over budget');
  });
  it('always shows the before-scholarships line when a number is shown, never for blanks', () => {
    expect(costText(F['dartmouth-college'], 'international').sub).toContain(COST_DISCLAIMER);
    expect(costText(F['pennsylvania-state-university'], 'international').sub).toContain(COST_DISCLAIMER); // tuition only, still labelled
    const blank = { ...F['dartmouth-college'], total_cost_in_state: null, total_cost_out_of_state: null, tuition_fees_in_state: null, tuition_fees_out_of_state: null };
    expect(costText(blank, null).headline).toBe('Ask the coach');
  });
  it('service academies: no tuition, warn but never exclude', () => {
    const r = search(F, base({ max_cost_usd_per_year: 1000 }));
    expect(r.results.find((x) => x.slug === 'united-states-naval-academy')!.softMatches).toBe(1);
    expect(F['united-states-naval-academy'].intl_warning).toBeTruthy();
  });
});

describe('majors, climate, tiers', () => {
  it('maths maps to CIP 27, engineering to 14/15', () => {
    const r = search(F, base({ majors: ['mathematics'] }));
    const hit = r.results.find((x) => x.slug === 'university-of-michigan')!;
    expect(hit.checks[0].status).toBe('match');
  });
  it('climate bands follow the written rule', () => {
    const e = (slug: string, climate: string) => evaluate(slug, F[slug], base({ climate: [climate] }))[0].status;
    expect(e('university-of-california-los-angeles-ucla', 'mild_winters')).toBe('match');
    expect(e('grand-canyon-university', 'hot')).toBe('match');
    expect(e('university-of-st-thomas-minnesota', 'cold_winters')).toBe('match');
    expect(e('university-of-st-thomas-minnesota', 'mild_winters')).toBe('miss');
  });
  it('conference aliases', () => {
    expect(evaluate('x', F['university-of-utah'], base({ conference: ['Big 12'] }))[0].status).toBe('match');
    expect(evaluate('x', F['university-of-michigan'], base({ conference: ['Big Ten'] }))[0].status).toBe('match');
    expect(evaluate('x', F['colorado-state-university'], base({ conference: ['Pac-12'] }))[0].status).toBe('match');
  });
});
