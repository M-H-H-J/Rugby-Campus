import { useState } from 'react';
import { TIER_DISCLAIMER } from '@/data/colleges';

export default function TierNote({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div role="note" className={`border-y border-line py-3 text-[13px] leading-relaxed text-muted ${className}`}>
      <p>
        Tiers, not rankings. Based on 2025–26 results; some details may be incomplete.{' '}
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="text-navy font-medium underline underline-offset-2">
          How tiers work
        </button>
      </p>
      {open && (
        <div className="mt-2 space-y-1">
          <p>{TIER_DISCLAIMER}</p>
          <p>Program information can be incomplete or change. Verify with the school or coach.</p>
        </div>
      )}
    </div>
  );
}
