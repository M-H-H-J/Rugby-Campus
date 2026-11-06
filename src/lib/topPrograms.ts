import type { College } from '@/data/colleges';
import { TOP_TIER_ORDER, compareColleges } from '@/lib/collegeOrder';

// Home strip: Cal, Navy, Life, Saint Mary's, in that order, and only while they stay in the top tier.
const TOP_COUNT = 4;

export function pickTopPrograms(colleges: College[]): College[] {
  const top = colleges.filter((c) => c.tier === 'championship').sort(compareColleges);
  const picked = TOP_TIER_ORDER.map((slug) => top.find((c) => c.slug === slug)).filter((c): c is College => Boolean(c));
  const rest = top.filter((c) => !picked.includes(c));
  return [...picked, ...rest].slice(0, TOP_COUNT);
}
