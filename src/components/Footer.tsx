import { useState } from 'react';
import { Link } from 'wouter';
import { Check } from 'lucide-react';
import { captureEmail } from '@/lib/supabase';
import { useSaveState } from '@/lib/useSaveState';
import SaveError from '@/components/SaveError';
import { CONTACT_EMAIL, MONEY_LINE } from '@/config';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { state, run } = useSaveState();

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await run(() => captureEmail(email, 'newsletter'));
  };

  return (
    <footer className="bg-dark text-white">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="mb-3">
              <img src="/logo-white.png" alt="" width={75} height={28} className="h-7 w-auto opacity-90" />
            </div>
            <p className="text-white/75 text-xs leading-relaxed">
              Helping aspiring players discover U.S. college rugby.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h2 className="text-[11px] font-semibold font-body tracking-caps text-white/75 uppercase mb-3">Explore</h2>
            {[['/map', 'Interactive map'], ['/colleges', 'All colleges'], ['/learn', 'Guides'], ['/for-coaches', 'For coaches'], ['/about', 'About']].map(([href, label]) => (
              <Link key={href} href={href} className="block text-white/75 hover:text-white text-xs py-2.5 transition-colors">{label}</Link>
            ))}
          </div>

          {/* Rugby resources */}
          <div>
            <h2 className="text-[11px] font-semibold font-body tracking-caps text-white/75 uppercase mb-3">Rugby resources</h2>
            {[
              ['https://www.ncr.rugby', 'National Collegiate Rugby'],
              ['https://craa.rugby', 'CRAA'],
              ['https://www.majorleague.rugby', 'Major League Rugby'],
            ].map(([href, label]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="block text-white/75 hover:text-white text-xs py-2.5 transition-colors">{label} ↗</a>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="text-[11px] font-semibold font-body tracking-caps text-white/75 uppercase mb-3">New guides by email</h2>
            <p className="text-white/75 text-xs mb-3">Get new guides and program updates. A short email, only when there is something worth sending.</p>
            {state === 'done' ? (
              <p className="inline-flex items-center gap-1.5 text-white text-xs"><Check size={13} /> Subscribed</p>
            ) : (
              <>
              <form onSubmit={subscribe} className="flex gap-1.5">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-3 py-2 min-h-[44px] rounded-md bg-white/5 border border-white/15 text-white text-xs outline-none placeholder:text-white/70 focus:border-white/25"
                />
                <button type="submit" disabled={state === 'busy'} className="btn px-3.5 py-2 min-h-[44px] border border-white/40 text-white rounded-md text-[12px] font-bold hover:border-white transition-colors disabled:opacity-60">{state === 'busy' ? 'Joining…' : 'Join'}</button>
              </form>
              {state === 'failed' && <SaveError dark className="mt-2 !text-[12px]" />}
              </>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col gap-3">
          <p className="text-white/75 text-[11px] leading-relaxed">Program information can be incomplete or change; verify with the school or coach.</p>
          <p className="text-white/75 text-[11px] leading-relaxed">{MONEY_LINE}</p>
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <p className="text-white/70 text-[11px]">© 2026 Rugby Campus.</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-white/70 hover:text-white text-[11px] transition-colors">{CONTACT_EMAIL}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
