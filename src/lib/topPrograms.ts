import type { College } from '@/data/colleges';

// Top programs come from the "Often near the top" tier. These are the ones to show first, in this order.
// If one drops out of that tier it disappears from the home page and the next tier-1 program takes its place.
const TOP_PICKS = [
  'university-of-california-berkeley',
  'brown-university',
  'united-states-naval-academy',
  'united-states-military-academy-army',
];
const TOP_COUNT = 4;

export function pickTopPrograms(colleges: College[]): College[] {
  const top = colleges.filter((c) => c.tier === 'championship');
  const picked = TOP_PICKS.map((slug) => top.find((c) => c.slug === slug)).filter((c): c is College => Boolean(c));
  const rest = top.filter((c) => !picked.includes(c));
  return [...picked, ...rest].slice(0, TOP_COUNT);
}
