import { useState, useEffect } from 'react';
import { Mail, Lock, X, Check } from 'lucide-react';
import { captureEmail } from '@/lib/supabase';

const STORAGE_KEY = 'rc_unlocked';

export default function CoachEmailUnlock({ coachName, coachEmail }: { coachName: string; coachEmail: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

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
    setDone(true);
    setTimeout(() => { setShowModal(false); setDone(false); }, 1400);
  };

  return (
    <>
      <div className="bg-white border border-line rounded-lg p-6">
        <p className="kicker mb-2">Head coach</p>
        <p className="font-heading text-[22px] text-ink mb-4">{coachName || 'To be confirmed'}</p>
        <div className="pt-4 border-t border-line">
          {unlocked ? (
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-faint flex-shrink-0" />
              {coachEmail ? (
                <a href={`mailto:${coachEmail}`} className="text-navy text-[14px] font-medium hover:text-navy-deep break-all">{coachEmail}</a>
              ) : (
                <span className="text-faint text-[13px] italic">Email being verified — check back soon</span>
              )}
            </div>
          ) : (
            <button onClick={() => setShowModal(true)} className="w-full flex items-center gap-2.5 group text-left">
              <Lock size={13} className="text-faint flex-shrink-0" />
              <span className="text-[14px] text-faint blur-[5px] select-none">coach@university.edu</span>
              <span className="btn ml-auto text-[12px] font-bold text-dark bg-gold px-3.5 py-2 rounded-md whitespace-nowrap">
                Unlock email
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
                <p className="text-muted text-[13.5px] leading-relaxed mb-6">One email unlocks coach contacts across all 40 colleges. Free, forever. No spam.</p>
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
