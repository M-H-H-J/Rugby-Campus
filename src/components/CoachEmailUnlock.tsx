import { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { Lock, X, Check, ExternalLink } from 'lucide-react';
import { captureEmail } from '@/lib/supabase';
import { COACH_EMAIL_TIPS, coachEmailBody, coachEmailSubject } from '@/data/coachEmailTemplate';
import { hasEmailUnlock, rememberEmailUnlock } from '@/lib/unlock';
const FOCUSABLE = 'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

function EmailTemplate({ collegeName, open }: { collegeName: string; open: boolean }) {
  const [copied, setCopied] = useState(false);
  const text = `Subject: ${coachEmailSubject(collegeName)}\n\n${coachEmailBody(collegeName)}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked: the text is selectable */ }
  };
  return (
    <details open={open} className="mt-3 border-t border-line pt-3 text-[13px] text-muted">
      <summary className="cursor-pointer font-medium text-ink min-h-[32px]">How to email a coach</summary>
      <ul className="mt-2 list-disc pl-4 space-y-1 leading-relaxed">
        {COACH_EMAIL_TIPS.map((t) => <li key={t}>{t}</li>)}
      </ul>
      <pre className="mt-3 whitespace-pre-wrap font-body text-[12.5px] leading-relaxed text-ink border-l-2 border-line pl-3">{text}</pre>
      <button type="button" onClick={copy} className="mt-2 min-h-[44px] text-navy font-medium underline underline-offset-2">{copied ? 'Copied' : 'Copy this template'}</button>
    </details>
  );
}

/** Lock body scroll and trap Tab inside `box` while `open`; Escape calls `onClose`. */
export function useModal(open: boolean, box: React.RefObject<HTMLElement>, onClose: () => void, initialFocus?: () => HTMLElement | null) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    (initialFocus?.() ?? box.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); return; }
      if (e.key !== 'Tab' || !box.current) return;
      const f = Array.from(box.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.tabIndex !== -1 && !(el as HTMLInputElement).disabled && el.offsetParent !== null);
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      const inside = box.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

export default function CoachEmailUnlock({ coachName, coachEmail, recruitmentFormUrl, collegeName, clubContactName, clubContactEmail, contactNote, rugbyProgramUrl }: { coachName: string; coachEmail: string; recruitmentFormUrl?: string; collegeName: string; clubContactName?: string; clubContactEmail?: string; contactNote?: string; rugbyProgramUrl?: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (hasEmailUnlock()) setUnlocked(true);
  }, []);

  const closeModal = () => { setShowModal(false); setDone(false); setTimeout(() => trigger.current?.focus(), 0); };
  // Touch devices: don't autofocus the input, so the keyboard doesn't jump up over the dialog.
  const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  useModal(showModal, dialog, closeModal, () => (touch ? dialog.current?.querySelector<HTMLElement>('button[aria-label="Close"]') ?? null : dialog.current?.querySelector<HTMLElement>('input') ?? null));

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await captureEmail(email, 'coach_unlock');
    rememberEmailUnlock();
    setBusy(false);
    setUnlocked(true);
    setJustUnlocked(true);
    setDone(true);
    setTimeout(() => { closeModal(); }, 1400);
  };

  const hasCoach = !!coachName?.trim();
  const noContact = !coachEmail && !recruitmentFormUrl && !clubContactEmail;

  return (
    <>
      <div className="border-t border-ink pt-4">
        <p className="kicker mb-2">Head coach</p>
        {hasCoach
          ? <p className="font-heading text-[22px] text-ink mb-4">{coachName}</p>
          : <p className="text-[14px] text-muted mb-4">Head coach not confirmed yet.</p>}
        {recruitmentFormUrl && (
          <div className="mb-4 border-l-2 border-navy pl-3 py-1">
            <p className="text-[11px] uppercase tracking-caps text-muted">Start here</p>
            <a href={recruitmentFormUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[15px] font-semibold text-navy min-h-[32px]">
              Recruitment form <ExternalLink size={14} />
            </a>
            <p className="mt-1 text-[12px] text-muted">This program has its own form. Use it before you email.</p>
          </div>
        )}
        {contactNote && <p className="mb-4 text-[12.5px] text-muted leading-relaxed">{contactNote}</p>}
        {(clubContactName || clubContactEmail) && (
          <div className="mb-4">
            <p className="kicker mb-1">Club contact</p>
            {clubContactName && <p className="text-[15px] text-ink">{clubContactName}</p>}
            {clubContactEmail && <a href={`mailto:${clubContactEmail}`} className="text-[15px] font-semibold text-navy break-all">{clubContactEmail}</a>}
          </div>
        )}
        {noContact && rugbyProgramUrl && (
          <p className="mb-4 text-[13px] text-muted leading-relaxed">
            No public email for this program yet. Reach the team through its{' '}
            <a href={rugbyProgramUrl} target="_blank" rel="noopener noreferrer" className="text-navy font-medium underline underline-offset-2">program page</a>.
          </p>
        )}
        {coachEmail ? (
        <div className="pt-4 border-t border-line">
          {unlocked ? (
            <div>
              <p className="text-[11px] uppercase tracking-caps text-muted">Coach email</p>
              <a href={`mailto:${coachEmail}`} className="text-[15px] font-semibold text-navy break-all">{coachEmail}</a>
              <EmailTemplate collegeName={collegeName} open={justUnlocked} />
            </div>
          ) : (
            <button ref={trigger} type="button" onClick={() => setShowModal(true)} aria-haspopup="dialog" className="w-full min-h-[44px] flex items-center gap-2.5 group text-left">
              <Lock size={13} className="text-muted flex-shrink-0" aria-hidden />
              <span className="text-[14px] text-muted" aria-hidden><span className="tracking-[0.2em]">•••••</span>@<span className="tracking-[0.2em]">•••••</span></span>
              <span className="btn ml-auto text-[12px] font-bold text-dark bg-gold px-3.5 py-2 rounded-md whitespace-nowrap">
                Unlock coach email
              </span>
            </button>
          )}
        </div>
        ) : null}
      </div>

      {showModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(7,27,51,0.55)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} className="bg-white border border-line rounded-lg max-w-sm w-full p-8 relative my-auto">
            <button type="button" onClick={closeModal} aria-label="Close" className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center text-muted hover:text-ink">
              <X size={18} />
            </button>
            {done ? (
              <div className="text-center py-2" role="status">
                <Check size={26} className="text-navy mx-auto mb-3" />
                <p id={titleId} className="font-heading text-[22px] text-ink mb-1">Unlocked</p>
                <p className="text-muted text-[13px]">Coach emails are now visible on every college page.</p>
              </div>
            ) : (
              <>
                <p id={titleId} className="font-heading text-[24px] text-ink mb-2">Unlock coach emails</p>
                <p className="text-muted text-[13.5px] leading-relaxed mb-6">One email unlocks coach contacts across every college. No spam.</p>
                <form onSubmit={handleUnlock}>
                  <label htmlFor={`${titleId}-email`} className="sr-only">Your email</label>
                  <input
                    id={`${titleId}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" required autoComplete="email"
                    className="w-full px-4 py-3 rounded-md border border-line text-[16px] mb-3 outline-none focus:border-navy transition-colors"
                  />
                  <button type="submit" disabled={busy}
                    className="btn w-full py-3 min-h-[44px] bg-gold text-dark rounded-md text-[13px] font-bold disabled:opacity-60">
                    {busy ? 'Unlocking…' : 'Unlock coach emails'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
