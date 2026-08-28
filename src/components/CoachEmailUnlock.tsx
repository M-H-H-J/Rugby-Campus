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
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">Head coach</p>
            <p className="font-heading font-semibold text-lg text-dark">{coachName || 'To be confirmed'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center">
            <Mail size={16} className="text-navy" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          {unlocked ? (
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-gray-400 flex-shrink-0" />
              {coachEmail ? (
                <a href={`mailto:${coachEmail}`} className="text-navy text-sm font-medium hover:underline break-all">{coachEmail}</a>
              ) : (
                <span className="text-gray-400 text-sm italic">Email being verified — check back soon</span>
              )}
            </div>
          ) : (
            <button onClick={() => setShowModal(true)} className="w-full flex items-center gap-2.5 group">
              <Lock size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-400 blur-[5px] select-none">coach@university.edu</span>
              <span className="ml-auto text-[11px] font-semibold text-navy bg-navy/5 group-hover:bg-navy/10 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors">
                Unlock email
              </span>
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(11,16,38,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-7 text-center relative">
            <button onClick={() => setShowModal(false)} aria-label="Close" className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
              <X size={18} />
            </button>
            {done ? (
              <>
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <Check size={22} className="text-green-600" />
                </div>
                <p className="font-heading font-bold text-lg text-dark mb-1">Unlocked</p>
                <p className="text-gray-400 text-sm">Coach emails are now visible on every college page.</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-3">
                  <Mail size={20} className="text-navy" />
                </div>
                <p className="font-heading font-bold text-lg text-dark mb-1">Unlock coach emails</p>
                <p className="text-gray-400 text-sm mb-5">One email unlocks coach contacts across all 40 colleges. Free, forever.</p>
                <form onSubmit={handleUnlock}>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" required autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm mb-2.5 outline-none focus:border-navy/40 focus:ring-4 focus:ring-navy/5 transition-all"
                  />
                  <button type="submit" disabled={busy}
                    className="w-full py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 disabled:opacity-60 transition-all">
                    {busy ? 'Unlocking…' : 'Unlock coach emails — free'}
                  </button>
                </form>
                <p className="text-gray-300 text-[11px] mt-2.5">One-time signup. No spam.</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
