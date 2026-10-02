import { describe, expect, it } from 'vitest';
import { colleges } from '@/data/colleges';
import { preferBundledMlr } from '@/lib/useColleges';

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
    expect(merged.badges[0]).toBe('2019 National Champions');
    expect(merged.description).toBe(life.description);
  });

  it('leaves a description alone when it does not quote a draft count', () => {
    const merged = preferBundledMlr({
      draft_picks: 8,
      badges: [],
      description: 'A short campus note with no draft mention.',
    }, life);
    expect(merged.description).toBe('A short campus note with no draft mention.');
  });
});
