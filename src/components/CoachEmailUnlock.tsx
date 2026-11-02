import { useState, useEffect } from 'react';
import { Lock, X, Check, ExternalLink } from 'lucide-react';
import { captureEmail } from '@/lib/supabase';
import { COACH_EMAIL_TIPS, coachEmailBody, coachEmailSubject } from '@/data/coachEmailTemplate';

const STORAGE_KEY = 'rc_unlocked';

function EmailTemplate({ collegeName, open }: { collegeName: string; open: boolean }) {
  const [copied, setCopied] = useState(false);
  const text = `Subject: ${coachEmailSubject(collegeName)}\n\n${coachEmailBody(collegeName)}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked: the text is selectable */ }
  };
  return (
    <details open={open} className="mt-3 rounded-md border border-line px-3 py-2.5 text-[13px] text-muted">
      <summary className="cursor-pointer font-medium text-ink">How to email a coach</summary>
      <ul className="mt-2 list-disc pl-4 space-y-1 leading-relaxed">
        {COACH_EMAIL_TIPS.map((t) => <li key={t}>{t}</li>)}
      </ul>
      <pre className="mt-3 whitespace-pre-wrap font-body text-[12.5px] leading-relaxed text-ink bg-navy/[0.04] rounded-md p-3">{text}</pre>
      <button type="button" onClick={copy} className="mt-2 text-navy font-medium underline underline-offset-2">{copied ? 'Copied' : 'Copy this template'}</button>
    </details>
  );
}

export default function CoachEmailUnlock({ coachName, coachEmail, recruitmentFormUrl, collegeName }: { coachName: string; coachEmail: string; recruitmentFormUrl?: string; collegeName: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(STORAGE_KEY) === 'true') setUnlocked(true); } catch { /* private mode */ }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await captureEmail(email, 'coach_unlock');
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* private mode */ }
    setBusy(false);
    setUnlocked(true);
    setJustUnlocked(true);
    setDone(true);
    setTimeout(() => { setShowModal(false); setDone(false); }, 1400);
  };

  return (
    <>
      <div className="border-t border-ink pt-4">
        <p className="kicker mb-2">Head coach</p>
        <p className="font-heading text-[22px] text-ink mb-4">{coachName || 'To be confirmed'}</p>
        {recruitmentFormUrl && (
          <div className="mb-4 rounded-md border border-navy/25 bg-navy/[0.04] px-3 py-3">
            <p className="text-[11px] uppercase tracking-caps text-faint">Start here</p>
            <a href={recruitmentFormUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[15px] font-semibold text-navy">
              Recruitment form <ExternalLink size={14} />
            </a>
            <p className="mt-1 text-[12px] text-muted">This program has its own form. Use it before you email.</p>
          </div>
        )}
        <div className="pt-4 border-t border-line">
          {unlocked ? (
            <div className="rounded-md border border-navy/25 bg-navy/[0.04] px-3 py-3">
              <p className="text-[11px] uppercase tracking-caps text-faint">Coach email</p>
              {coachEmail ? (
                <a href={`mailto:${coachEmail}`} className="text-[15px] font-semibold text-navy break-all">{coachEmail}</a>
              ) : (
                <span className="text-[15px] font-semibold text-navy">Email being verified. Check back soon.</span>
              )}
              <EmailTemplate collegeName={collegeName} open={justUnlocked} />
            </div>
          ) : (
            <button onClick={() => setShowModal(true)} className="w-full flex items-center gap-2.5 group text-left">
              <Lock size={13} className="text-faint flex-shrink-0" />
              <span className="text-[14px] text-faint blur-[5px] select-none">coach@university.edu</span>
              <span className="btn ml-auto text-[12px] font-bold text-dark bg-gold px-3.5 py-2 rounded-md whitespace-nowrap">
                Unlock coach email
              </span>
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(7,27,51,0.55)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white border border-line rounded-lg max-w-sm w-full p-8 relative">
            <button onClick={() => setShowModal(false)} aria-label="Close" className="absolute top-4 right-4 text-faint hover:text-muted">
              <X size={18} />
            </button>
            {done ? (
              <div className="text-center py-2">
                <Check size={26} className="text-gold mx-auto mb-3" />
                <p className="font-heading text-[22px] text-ink mb-1">Unlocked</p>
                <p className="text-muted text-[13px]">Coach emails are now visible on every college page.</p>
              </div>
            ) : (
              <>
                <p className="font-heading text-[24px] text-ink mb-2">Unlock coach emails</p>
                <p className="text-muted text-[13.5px] leading-relaxed mb-6">One email unlocks coach contacts across every college. No spam.</p>
                <form onSubmit={handleUnlock}>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" required autoFocus
                    className="w-full px-4 py-3 rounded-md border border-line text-[14px] mb-3 outline-none focus:border-navy transition-colors"
                  />
                  <button type="submit" disabled={busy}
                    className="btn w-full py-3 bg-gold text-dark rounded-md text-[13px] font-bold disabled:opacity-60">
                    {busy ? 'Unlocking…' : 'Unlock coach emails'}
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
