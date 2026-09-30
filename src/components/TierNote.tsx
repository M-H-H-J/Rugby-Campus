import { TIER_DISCLAIMER } from '@/data/colleges';

export default function TierNote({ className = '' }: { className?: string }) {
  return (
    <div role="note" className={`bg-cream border border-line border-l-[3px] border-l-gold rounded-md px-3 py-2 text-[12px] leading-relaxed text-muted ${className}`}>
      <p>{TIER_DISCLAIMER}</p>
      <p className="mt-1">Program information can be incomplete or change. Verify with the school or coach.</p>
    </div>
  );
}
