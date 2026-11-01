import { useEffect, useRef, useState } from 'react';
import { dismissTierNotice, shouldShowTierNotice } from '@/lib/tierNotice';

/** First-visit pop-up on /colleges. The button is the only way out, and it stores the choice so the pop-up shows once. */
export default function TierNoticeModal() {
  const [open, setOpen] = useState<boolean>(() => shouldShowTierNotice());
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    button.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus?.(); };
  }, [open]);

  if (!open) return null;
  const close = () => { dismissTierNotice(); setOpen(false); };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(7,27,51,0.55)', backdropFilter: 'blur(3px)' }}>
      <div role="dialog" aria-modal="true" aria-labelledby="tier-notice-title" aria-describedby="tier-notice-body"
        className="bg-white border border-line rounded-lg max-w-md w-full p-7 md:p-8"
        // Only one thing can be focused in here, so Tab stays on the button.
        onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault(); button.current?.focus(); } }}>
        <h2 id="tier-notice-title" className="font-heading text-[24px] text-ink mb-3">Tiers are a guide</h2>
        <p id="tier-notice-body" className="text-muted text-[14.5px] leading-relaxed mb-6">
          Tiers are a guide, based on recent seasons' results. Every program has strong years and quieter ones, so talk to coaches and look at current form too.
        </p>
        <button ref={button} type="button" onClick={close} className="btn w-full py-3 bg-navy text-white rounded-md text-[13px] font-semibold">
          I understand
        </button>
      </div>
    </div>
  );
}
