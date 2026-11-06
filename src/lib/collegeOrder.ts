import type { College, Tier } from '@/data/colleges';

const TIER_RANK: Record<Tier, number> = { championship: 0, playoff: 1, competitive: 2, emerging: 3 };

/** Fixed order inside the top tier. Cal first, then the home-page picks, then A–Z. */
export const TOP_TIER_ORDER = [
  'university-of-california-berkeley',
  'united-states-naval-academy',
  'life-university',
  'saint-mary-s-college-of-california',
];

/** Same input, same order. Tier first, then the fixed top-tier order, then A–Z. */
export function compareColleges(a: College, b: College): number {
  const tier = TIER_RANK[a.tier] - TIER_RANK[b.tier];
  if (tier) return tier;
  const ia = TOP_TIER_ORDER.indexOf(a.slug);
  const ib = TOP_TIER_ORDER.indexOf(b.slug);
  const pa = ia === -1 ? TOP_TIER_ORDER.length : ia;
  const pb = ib === -1 ? TOP_TIER_ORDER.length : ib;
  if (pa !== pb) return pa - pb;
  return a.name.localeCompare(b.name, 'en');
}

export function sortColleges<T extends College>(list: readonly T[]): T[] {
  return [...list].sort(compareColleges);
}
