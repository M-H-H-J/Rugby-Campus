import { useEffect, useRef, useState } from 'react';
import { Check, Mail, X } from 'lucide-react';
import { submitCoachingEnquiry } from '@/lib/supabase';

const FIELD = 'w-full px-4 py-3 rounded-md border border-line text-[14px] text-ink outline-none focus:border-navy transition-colors';
const LABEL = 'block text-[12px] font-semibold text-muted mb-1';

/** "Enquire about coaching" button that opens a pop-up form. Replaces the old email link on /training. */
export default function CoachingEnquiry({ asLink = false }: { asLink?: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  const close = () => { setOpen(false); opener.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLElement>('input:not([tabindex="-1"])')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab' || !dialog.current) return;
      const f = Array.from(dialog.current.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]')).filter((el) => el.tabIndex !== -1 && !(el as HTMLInputElement).disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); };
  }, [open]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    setBusy(true); setFailed(false);
    const ok = await submitCoachingEnquiry({
      firstName: v('firstName'), lastName: v('lastName'), age: v('age'), location: v('location'),
      position: v('position'), email: v('email'), whatsapp: v('whatsapp'), website: v('website'),
    });
    setBusy(false);
    if (ok) setDone(true); else setFailed(true);
  };

  return (
    <>
      <button ref={opener} type="button" onClick={() => { setDone(false); setFailed(false); setOpen(true); }}
        className={asLink ? 'text-navy font-medium underline underline-offset-2' : 'btn inline-flex items-center gap-2 bg-gold text-dark px-6 py-3 rounded-md text-[13px] font-bold'}>
        {!asLink && <Mail size={15} />} Enquire about coaching
      </button>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(7,27,51,0.55)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="coaching-title" className="bg-white border border-line rounded-lg max-w-md w-full p-7 relative my-auto">
            <button type="button" onClick={close} aria-label="Close" className="absolute top-4 right-4 text-faint hover:text-muted"><X size={18} /></button>
            {done ? (
              <div className="text-center py-4">
                <Check size={26} className="text-navy mx-auto mb-3" />
                <p id="coaching-title" className="font-heading text-[22px] text-ink mb-1">Thanks</p>
                <p className="text-muted text-[13.5px] leading-relaxed mb-5">I'll be in touch on WhatsApp or email to set up an intro chat.</p>
                <button type="button" onClick={close} className="btn px-6 py-2.5 bg-navy text-white rounded-md text-[13px] font-semibold">Close</button>
              </div>
            ) : (
              <>
                <p id="coaching-title" className="font-heading text-[24px] text-ink mb-1">Enquire about coaching</p>
                <p className="text-muted text-[13.5px] leading-relaxed mb-5">A few details, and I'll be in touch to set up an intro chat.</p>
                <form onSubmit={submit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label htmlFor="ce-first" className={LABEL}>First name</label><input id="ce-first" name="firstName" required maxLength={60} autoComplete="given-name" className={FIELD} /></div>
                    <div><label htmlFor="ce-last" className={LABEL}>Last name</label><input id="ce-last" name="lastName" required maxLength={60} autoComplete="family-name" className={FIELD} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label htmlFor="ce-age" className={LABEL}>Age</label><input id="ce-age" name="age" type="number" inputMode="numeric" min={8} max={99} required className={FIELD} /></div>
                    <div className="col-span-2"><label htmlFor="ce-pos" className={LABEL}>Position</label><input id="ce-pos" name="position" required maxLength={60} className={FIELD} /></div>
                  </div>
                  <div><label htmlFor="ce-loc" className={LABEL}>Where you live</label><input id="ce-loc" name="location" required maxLength={120} autoComplete="address-level2" placeholder="City and country" className={FIELD} /></div>
                  <div><label htmlFor="ce-email" className={LABEL}>Email</label><input id="ce-email" name="email" type="email" required maxLength={254} autoComplete="email" className={FIELD} /></div>
                  <div><label htmlFor="ce-wa" className={LABEL}>WhatsApp number</label><input id="ce-wa" name="whatsapp" type="tel" required maxLength={30} autoComplete="tel" placeholder="Include your country code" className={FIELD} /></div>
                  {/* Honeypot: people never see or fill this. */}
                  <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                  {failed && <p role="alert" className="text-[13px] text-terra">That didn't send. Please check your details and try again.</p>}
                  <button type="submit" disabled={busy} className="btn w-full py-3 bg-navy text-white rounded-md text-[13px] font-semibold disabled:opacity-60">
                    {busy ? 'Sending…' : 'Send enquiry'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
