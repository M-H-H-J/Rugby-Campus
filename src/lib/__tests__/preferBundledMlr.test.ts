import { describe, expect, it } from 'vitest';
import { colleges } from '@/data/colleges';
import { dropRetired, preferBundledMlr } from '@/lib/useColleges';

describe('preferBundledMlr', () => {
  const life = colleges.find((c) => c.slug === 'life-university');
  if (!life) throw new Error('life missing');

  it('keeps bundled drafted, played and the MLR badge when Supabase is stale', () => {
    const merged = preferBundledMlr({
      draft_picks: 8,
      badges: ['2019 National Champions', '8 MLR draft picks'],
      description: 'Varsity CRAA D1A in Rugby East, with 8 MLR draft picks.',
    }, life);
    expect(merged.draftPicks).toBe(17);
    expect(merged.mlrPlayed).toBe(13);
    expect(merged.badges.some((b) => /MLR draft picks/i.test(b))).toBe(false);
    expect(merged.badges.some((b) => /drafted into MLR/i.test(b))).toBe(true);
    expect(merged.badges).toEqual(life.badges);
    expect(merged.description).toBe(life.description);
  });

  it('always uses the bundled description when the program is in the bundle', () => {
    const merged = preferBundledMlr({
      draft_picks: 8,
      badges: [],
      description: 'An old Supabase description with excellent facilities.',
    }, life);
    expect(merged.description).toBe(life.description);
  });

  it('falls back to the Supabase description for a program that is not bundled', () => {
    const merged = preferBundledMlr({
      draft_picks: 0,
      badges: [],
      description: 'A short campus note.',
    }, undefined);
    expect(merged.description).toBe('A short campus note.');
  });

  it('uses the bundled league labels, badges and honours when the program is bundled', () => {
    const osu = colleges.find((c) => c.slug === 'the-ohio-state-university');
    if (!osu) throw new Error('osu missing');
    const merged = preferBundledMlr({
      draft_picks: 2,
      affiliation: 'CRAA D1A',
      conference: 'Big Ten',
      badges: ['2025 Big Ten Champions'],
      achievements: ['Multiple All-Americans'],
    }, osu);
    expect(merged.conference).toBe('Midwest');
    expect(merged.badges).toEqual(osu.badges);
    expect(merged.badges).not.toContain('2025 Big Ten Champions');
    expect(merged.achievements).toEqual([]);
  });

  it('falls back to Supabase labels and honours for a program that is not bundled', () => {
    const merged = preferBundledMlr({
      affiliation: 'NCR D1',
      conference: 'Liberty',
      badges: ['2019 National Champions', '8 MLR draft picks'],
      achievements: ['A sourced title'],
    }, undefined);
    expect(merged.affiliation).toBe('NCR D1');
    expect(merged.conference).toBe('Liberty');
    expect(merged.badges).toEqual(['2019 National Champions']);
    expect(merged.achievements).toEqual(['A sourced title']);
  });

  it('hides retired Minnesota and Iona rows; UCLA is dual', () => {
    const rows = [
      { slug: 'university-of-st-thomas-minnesota' },
      { slug: 'iona-university' },
      { slug: 'life-university' },
    ];
    expect(dropRetired(rows).map((r) => r.slug)).toEqual(['life-university']);
    expect(colleges).toHaveLength(47);
    expect(colleges.some((c) => c.slug === 'iona-university')).toBe(false);
    expect(colleges.find((c) => c.slug === 'university-of-california-los-angeles-ucla')?.affiliation).toBe('NCR D1 / CRAA dual');
  });
});
