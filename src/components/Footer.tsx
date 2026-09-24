import { useState } from 'react';
import { Link } from 'wouter';
import { Check } from 'lucide-react';
import { captureEmail } from '@/lib/supabase';
import { CONTACT_EMAIL } from '@/config';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await captureEmail(email, 'newsletter');
    setDone(true);
  };

  return (
    <footer className="bg-dark text-white">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="mb-3">
              <img src="/logo-white.png" alt="Rugby Campus" className="h-7 w-auto opacity-90" />
            </div>
            <p className="text-white/45 text-xs leading-relaxed">
              Helping aspiring players discover U.S. college rugby.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-caps mb-3">Explore</h4>
            {[['/map', 'Interactive map'], ['/colleges', 'All colleges'], ['/learn', 'Guides'], ['/for-coaches', 'For coaches'], ['/about', 'About']].map(([href, label]) => (
              <Link key={href} href={href} className="block text-white/45 hover:text-white/80 text-xs py-1 transition-colors">{label}</Link>
            ))}
          </div>

          {/* Rugby resources */}
          <div>
            <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-caps mb-3">Rugby resources</h4>
            {[
              ['https://goffrugbyreport.com', 'Goff Rugby Report'],
              ['https://www.ncr.rugby', 'National Collegiate Rugby'],
              ['https://craa.rugby', 'CRAA'],
              ['https://www.majorleague.rugby', 'Major League Rugby'],
            ].map(([href, label]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="block text-white/45 hover:text-white/80 text-xs py-1 transition-colors">{label} ↗</a>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-caps mb-3">Stay connected</h4>
            <p className="text-white/45 text-xs mb-3">Program updates and recruitment tips.</p>
            {done ? (
              <p className="inline-flex items-center gap-1.5 text-green-400 text-xs"><Check size={13} /> Subscribed</p>
            ) : (
              <form onSubmit={subscribe} className="flex gap-1.5">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-3 py-2 rounded-md bg-white/5 border border-white/15 text-white text-xs outline-none placeholder:text-white/35 focus:border-white/25"
                />
                <button type="submit" className="btn px-3.5 py-2 bg-gold text-dark rounded-md text-[12px] font-bold hover:bg-gold/90 transition-colors">Join</button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-white/35 text-[11px]">© 2026 Rugby Campus.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-white/35 hover:text-white/60 text-[11px] transition-colors">{CONTACT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}
