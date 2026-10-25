import type { Tier } from '@/data/colleges';
import { TIER_DOT_CLASS } from '@/data/colleges';

export default function TierDot({ tier, size = 'md' }: { tier: Tier; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  return <span className={`inline-block rounded-full shrink-0 ${dim} ${TIER_DOT_CLASS[tier]}`} aria-hidden />;
}
