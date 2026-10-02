import { useState } from 'react';
import { sendShortlist } from '@/lib/search/client';
import { captureEmail } from '@/lib/supabase';

export default function ShortlistEmail({ slugs, sentence }: { slugs: string[]; sentence: string }) {
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  if (slugs.length === 0) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    if (hp) { setState('done'); setMsg('Saved.'); return; } // honeypot
    void captureEmail(email.trim().toLowerCase(), 'search_shortlist'); // same table + path as the newsletter box
    const r = await sendShortlist(email, slugs, sentence, hp);
    if (r.ok) { setState('done'); setMsg(r.emailed ? 'Sent. Check your inbox (and spam).' : 'Saved. We will email this shortlist to you.'); } else { setState('error'); setMsg(r.message ?? 'Something went wrong. Please try again.'); }
  };
  return (
    <section className="mt-8 border-t border-line pt-5 max-w-xl" aria-label="Email me this shortlist">
      <h3 className="font-heading text-[16px] text-ink mb-1">Email me this shortlist</h3>
      <p className="text-[12px] text-muted mb-3">{slugs.length} {slugs.length === 1 ? 'college' : 'colleges'} selected. Optional. Just your email, nothing else. No account needed.</p>
      {state === 'done' ? <p className="text-[13px] text-navy" role="status">{msg}</p> : (
        <form onSubmit={submit} className="flex gap-2 flex-wrap">
          <label className="sr-only" htmlFor="sl-email">Email address</label>
          <input id="sl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 min-w-[200px] bg-white border border-line rounded-md px-3 py-2 text-[13px] outline-none focus:border-navy" />
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" name="website" />
          <button disabled={state === 'sending'} className="btn bg-navy text-white px-4 py-2 rounded-md text-[13px] font-semibold disabled:opacity-60">{state === 'sending' ? 'Sending…' : 'Email me the list'}</button>
          {state === 'error' && <p className="w-full text-[12px] text-ink" role="alert">{msg}</p>}
        </form>
      )}
    </section>
  );
}
