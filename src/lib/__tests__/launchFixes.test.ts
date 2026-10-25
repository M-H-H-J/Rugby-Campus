import { describe, expect, it } from 'vitest';
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
      const path = `/colleges/${slug}`;
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
    const text = articles.map((a) => a.content).join('\n') + Object.values(F).map((f) => f.intl_warning ?? '').join('\n');
    for (const bad of ['do not hard-claim', 'Soft line only', 'avoid the word', 'check before getting excited', 'every Rugby Campus profile includes', 'prospecting rugby', 'Powerhouse', 'World-class', 'Honours', 'enquir', 'calibre']) {
      expect(text.includes(bad), bad).toBe(false);
    }
    const best = articles.find((a) => a.slug === 'best-rugby-colleges-usa')!.content;
    expect(best).not.toMatch(/top of NCR D1[^.]*Walsh/i);
  });
});
