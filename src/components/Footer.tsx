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
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-gold text-[9px] font-bold">RC</div>
              <span className="font-heading font-bold text-sm">Rugby Campus</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Helping aspiring players discover U.S. college rugby. Built by a national championship-winning coach.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">Explore</h4>
            {[['/map', 'Interactive map'], ['/colleges', 'All colleges'], ['/learn', 'Guides'], ['/training', 'Training'], ['/about', 'About']].map(([href, label]) => (
              <Link key={href} href={href} className="block text-gray-500 hover:text-gray-300 text-xs py-1 transition-colors">{label}</Link>
            ))}
          </div>

          {/* Rugby resources */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">Rugby resources</h4>
            {[
              ['https://goffrugbyreport.com', 'Goff Rugby Report'],
              ['https://www.ncr.rugby', 'National Collegiate Rugby'],
              ['https://craa.rugby', 'CRAA'],
              ['https://www.majorleague.rugby', 'Major League Rugby'],
            ].map(([href, label]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="block text-gray-500 hover:text-gray-300 text-xs py-1 transition-colors">{label} ↗</a>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">Stay connected</h4>
            <p className="text-gray-500 text-xs mb-3">Program updates and recruitment tips.</p>
            {done ? (
              <p className="inline-flex items-center gap-1.5 text-green-400 text-xs"><Check size={13} /> Subscribed</p>
            ) : (
              <form onSubmit={subscribe} className="flex gap-1.5">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none placeholder:text-gray-600 focus:border-white/25"
                />
                <button type="submit" className="px-3.5 py-2 bg-gold text-navy rounded-lg text-[11px] font-bold hover:bg-gold/90 transition-colors">Join</button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-gray-600 text-[11px]">© 2026 Rugby Campus. Free for players, always.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gray-600 hover:text-gray-400 text-[11px] transition-colors">{CONTACT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}
