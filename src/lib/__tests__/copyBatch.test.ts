import { describe, it, expect } from 'vitest';
import { colleges, TIER_LABELS, TIER_SUBLINE } from '@/data/colleges';
import { articles } from '@/data/articles';
import facts from '@/data/collegeSearchFacts.json';

const body = (slug: string) => articles.find((a) => a.slug === slug)!.content;

describe('copy batch, 2 Nov 2026', () => {
  it('Queens is Playoff caliber, in the bundle and in the search facts', () => {
    expect(colleges.find((c) => c.slug === 'queens-university-of-charlotte')!.tier).toBe('playoff');
    const f = (facts as any).colleges;
    const q = Array.isArray(f) ? f.find((c: any) => c.slug === 'queens-university-of-charlotte') : f['queens-university-of-charlotte'];
    expect(q.rugby_tier).toBe('playoff');
    expect(body('best-rugby-colleges-usa')).not.toMatch(/Queens, and Brown|Queens and Brown/);
  });
  it('the fourth tier is "Rounding out the best", with no "Up and coming" left anywhere in the guides', () => {
    expect(TIER_LABELS.emerging).toBe('Rounding out the best');
    expect(TIER_SUBLINE.emerging).toBe('Earlier game time, and a say in where the program goes.');
    expect(articles.map((a) => a.content).join('\n')).not.toMatch(/up and coming|up & coming/i);
  });
  it('guide edits are in', () => {
    expect(body('best-rugby-colleges-usa')).toContain("it's not uncommon to see a side struggle in 15s and be elite at 7s");
    const lies = body('why-college-rugby-rankings-lie');
    expect(lies).toContain('My senior year was better, however, we still missed the playoffs.');
    expect(lies).toContain('by the time they were juniors they were all much better players');
    expect(lies).toContain('None of them is being dishonest.');
    expect(lies).not.toContain('not a scandal');
    expect(lies).not.toContain('Look at the film');
    expect(body('when-college-rugby-programs-die')).not.toContain('Two programs that were **known if you play rugby**');
  });
});
