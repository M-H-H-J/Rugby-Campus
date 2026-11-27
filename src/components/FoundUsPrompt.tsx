import { useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { FOUND_US_CHANNELS, FOUND_US_DETAIL_MAX, foundUsDone, markFoundUsDone, newAnswerId, sendFoundUs, type FoundUsChannel, type FoundUsContext } from '@/lib/foundUs';

/**
 * Shown only on a confirmation state (after the email is saved), so it can never block a sign-up.
 * One click answers it. "AI assistant" opens one optional box for which AI and what they asked.
 */
export default function FoundUsPrompt({ context, dark = false, className = '' }: { context: FoundUsContext; dark?: boolean; className?: string }) {
  const [hidden, setHidden] = useState(() => foundUsDone());
  const [picked, setPicked] = useState<FoundUsChannel | null>(null);
  const [detail, setDetail] = useState('');
  const [thanked, setThanked] = useState(false);
  const rid = useRef(newAnswerId());
  const id = useId();
  if (hidden) return null;

  const pick = (channel: FoundUsChannel) => {
    if (picked) return;
    setPicked(channel);
    markFoundUsDone();
    void sendFoundUs({ rid: rid.current, channel, context });
    if (channel !== 'ai_assistant') setThanked(true);
  };
  const sendDetail = (e: React.FormEvent) => {
    e.preventDefault();
    const text = detail.trim();
    if (text) void sendFoundUs({ rid: rid.current, channel: 'ai_assistant', context, detail: text.slice(0, FOUND_US_DETAIL_MAX) });
    setThanked(true);
  };
  const dismiss = () => { markFoundUsDone(); setHidden(true); };

  const muted = dark ? 'text-white/75' : 'text-muted';
  const ink = dark ? 'text-white' : 'text-ink';
  const pill = dark
    ? 'border-white/30 text-white hover:border-white aria-pressed:bg-white aria-pressed:text-dark'
    : 'border-line text-ink hover:border-navy aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white';

  if (thanked) return <p className={`text-[12.5px] ${muted} ${className}`} role="status">Thanks. That helps.</p>;

  return (
    <div className={`border-t ${dark ? 'border-white/15' : 'border-line'} pt-3 ${className}`} role="group" aria-labelledby={`${id}-q`}>
      <div className="flex items-start justify-between gap-3">
        <p id={`${id}-q`} className={`text-[13px] ${ink} font-medium`}>One quick question, if you like: how did you find Rugby Campus?</p>
        <button type="button" onClick={dismiss} aria-label="No thanks" className={`-mt-2 -mr-2 w-9 h-9 flex items-center justify-center flex-shrink-0 ${dark ? 'text-white/75 hover:text-white' : 'text-muted hover:text-ink'}`}>
          <X size={15} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {FOUND_US_CHANNELS.map((c) => (
          <button key={c.id} type="button" aria-pressed={picked === c.id} disabled={!!picked && picked !== c.id} onClick={() => pick(c.id)}
            className={`min-h-[36px] px-3 py-1.5 rounded-md border text-[12.5px] font-medium transition-colors disabled:opacity-40 ${pill}`}>
            {c.label}
          </button>
        ))}
      </div>
      {picked === 'ai_assistant' && (
        <form onSubmit={sendDetail} className="mt-3">
          <label htmlFor={`${id}-ai`} className={`block text-[12.5px] ${muted} mb-1.5`}>Which AI did you use, and what did you ask it? (optional)</label>
          <div className="flex gap-1.5">
            <input id={`${id}-ai`} type="text" value={detail} maxLength={FOUND_US_DETAIL_MAX} onChange={(e) => setDetail(e.target.value)}
              placeholder="e.g. ChatGPT: best rugby colleges in the US"
              className={`flex-1 min-w-0 px-3 py-2 min-h-[40px] rounded-md border text-[16px] sm:text-[13px] outline-none ${dark ? 'bg-white/5 border-white/15 text-white placeholder:text-white/50 focus:border-white/40' : 'border-line text-ink focus:border-navy'}`} />
            <button type="submit" className={`btn px-3.5 min-h-[40px] rounded-md text-[12.5px] font-semibold border ${dark ? 'border-white/40 text-white' : 'border-navy text-navy'}`}>
              {detail.trim() ? 'Send' : 'Skip'}
            </button>
          </div>
          <p className={`mt-1.5 text-[11.5px] ${muted}`}>Saved without your email. Please don't include personal details.</p>
        </form>
      )}
    </div>
  );
}
