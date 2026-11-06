import { describe, expect, it } from 'vitest';
import { colleges } from '@/data/colleges';
import { dropRetired, preferBundledMlr } from '@/lib/useColleges';

describe('preferBundledMlr', () => {
  const life = colleges.find((c) => c.slug === 'life-university');
  if (!life) throw new Error('life missing');

  it('uses the database drafted count, badges and description when they are set', () => {
    const merged = preferBundledMlr({
      draft_picks: 8,
      mlr_played: 4,
      badges: ['2019 National Champions', '8 drafted into MLR · 4 played'],
      description: 'The live row.',
    }, life);
    expect(merged.draftPicks).toBe(8);
    expect(merged.mlrPlayed).toBe(4);
    expect(merged.badges).toEqual(['2019 National Champions', '8 drafted into MLR · 4 played']);
    expect(merged.description).toBe('The live row.');
  });

  it('falls back to the bundle when the database leaves a field blank', () => {
    const merged = preferBundledMlr({
      draft_picks: 8,
      badges: [],
      description: '',
    }, life);
    expect(merged.draftPicks).toBe(8);
    expect(merged.description).toBe(life.description);
    expect(merged.mlrPlayed).toBe(life.mlrPlayed);
  });

  it('falls back to the Supabase description for a program that is not bundled', () => {
    const merged = preferBundledMlr({
      draft_picks: 0,
      badges: [],
      description: 'A short campus note.',
    }, undefined);
    expect(merged.description).toBe('A short campus note.');
  });

  it('uses the database league labels, badges and honours when they are set', () => {
    const osu = colleges.find((c) => c.slug === 'the-ohio-state-university');
    if (!osu) throw new Error('osu missing');
    const merged = preferBundledMlr({
      draft_picks: 2,
      affiliation: 'CRAA D1A',
      conference: 'Big Ten',
      badges: ['2025 Big Ten Champions'],
      achievements: ['Multiple All-Americans'],
    }, osu);
    expect(merged.conference).toBe('Big Ten');
    expect(merged.affiliation).toBe('CRAA D1A');
    expect(merged.badges).toEqual(['2025 Big Ten Champions']);
    expect(merged.achievements).toEqual(['Multiple All-Americans']);
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
    expect(merged.badges).toEqual(['2019 National Champions', '8 MLR draft picks']);
    expect(merged.achievements).toEqual(['A sourced title']);
  });

  it('hides retired Minnesota and Iona rows; UCLA is dual', () => {
    const rows = [
      { slug: 'university-of-st-thomas-minnesota' },
      { slug: 'iona-university' },
      { slug: 'life-university' },
    ];
    expect(dropRetired(rows).map((r) => r.slug)).toEqual(['life-university']);
    expect(colleges).toHaveLength(50);
    expect(colleges.some((c) => c.slug === 'iona-university')).toBe(false);
    expect(colleges.find((c) => c.slug === 'university-of-california-los-angeles-ucla')?.affiliation).toBe('NCR D1 / CRAA dual');
  });
});
