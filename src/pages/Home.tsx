import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ArrowRight, Check } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import { articles } from '@/data/articles';
import CollegeCard from '@/components/CollegeCard';
import USMap from '@/components/USMap';
import { captureEmail } from '@/lib/supabase';

export default function Home() {
  usePageMeta('', 'Every top college rugby program in America — mapped, tiered, and explained. Coach contacts and honest recruitment guides from a national championship-winning coach.');
  const [, navigate] = useLocation();
  const { colleges } = useColleges();
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const featured = colleges.filter((c) => c.tier === 'championship').slice(0, 3);
  const fullArticles = articles.filter((a) => !a.content.startsWith('Coming soon'));
  const [lead, ...rest] = fullArticles;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/colleges?q=${encodeURIComponent(query.trim())}` : '/colleges');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await captureEmail(email, 'newsletter');
    setSubscribed(true);
  };

  return (
    <>
      {/* ── Hero: editorial, left-aligned, map as the object ── */}
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-5 pt-12 md:pt-20 pb-12 md:pb-16 grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <div className="lg:col-span-5">
            <h1 className="font-heading text-[42px] md:text-[54px] leading-[1.04] text-ink mb-5">
              Every top college rugby program in America. Mapped.
            </h1>
            <p className="text-muted text-[15px] leading-relaxed mb-8 max-w-md">
              40 programs across CRAA D1A and NCR D1 — tiered on results, with coach contacts and straight answers on how recruitment actually works.
            </p>

            <form onSubmit={handleSearch} className="max-w-md mb-5">
              <div className="flex items-center border border-line rounded-md focus-within:border-navy transition-colors bg-white">
                <Search size={17} className="text-faint ml-4 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a college, city, or state"
                  className="flex-1 px-3 py-3.5 text-[14px] outline-none bg-transparent placeholder:text-faint min-w-0"
                />
                <button type="submit" className="btn bg-navy text-white text-[13px] font-semibold px-5 py-2.5 rounded-md m-1.5">
                  Search
                </button>
              </div>
            </form>

            <p className="text-[13px] text-faint">
              Built by the coach who won the 2023 NCR D1 national title. Free for players.
            </p>
          </div>

          <div className="lg:col-span-7">
            <Link href="/map" aria-label="Open the interactive map">
              <div className="group cursor-pointer border border-line rounded-lg overflow-hidden bg-white hover:border-navy/30 transition-colors">
                <USMap colleges={colleges} onSelect={() => navigate('/map')} height={430} interactive={false} />
                <div className="flex items-center justify-between px-5 py-3 border-t border-line bg-white">
                  <span className="text-[13px] text-muted">{colleges.length} programs, coast to coast</span>
                  <span className="text-[13px] font-semibold text-navy inline-flex items-center gap-1.5">
                    Open the interactive map <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Championship contenders ── */}
      <section className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="kicker mb-2">2025–26 season</p>
            <h2 className="font-heading text-[28px] md:text-[32px] text-ink leading-tight">The championship contenders</h2>
          </div>
          <Link href="/colleges" className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:text-navy-deep transition-colors mb-1">
            All 40 programs <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {featured.map((c) => <CollegeCard key={c.id} college={c} variant="editorial" />)}
        </div>
        <div className="mt-8 sm:hidden">
          <Link href="/colleges" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy">
            All 40 programs <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── How it works: editorial numbered list ── */}
      <section className="border-y border-line bg-white">
        <div className="max-w-6xl mx-auto px-5 py-14 md:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="kicker mb-2">The pathway</p>
            <h2 className="font-heading text-[28px] md:text-[32px] text-ink leading-tight mb-4">From anywhere in the world to a US squad</h2>
            <p className="text-muted text-[14px] leading-relaxed max-w-sm">
              No agency required. This is the same process I used as a 17-year-old from Australia — and later ran from the other side as a head coach.
            </p>
          </div>
          <div className="lg:col-span-8">
            {[
              { n: '1', t: 'Find programs that fit', d: 'Browse the map and the tiers. Match your level honestly — game time at the right program beats a bench spot at a famous one.' },
              { n: '2', t: 'Email the coach yourself', d: 'Every profile has the coach\u2019s contact. A short, direct email with your position, size, and highlights is all it takes. Coaches answer players.' },
              { n: '3', t: 'Apply and get over there', d: 'The guides cover applications, visas, scholarships, and what to expect when you land. If you want hands-on help, that\u2019s what I do.' },
            ].map((s, i) => (
              <div key={s.n} className={`flex gap-6 py-6 ${i > 0 ? 'border-t border-line' : ''}`}>
                <span className="font-heading text-[34px] text-navy leading-none w-10 flex-shrink-0">{s.n}</span>
                <div>
                  <h3 className="font-body font-semibold text-[15px] text-ink mb-1.5">{s.t}</h3>
                  <p className="text-muted text-[14px] leading-relaxed max-w-xl">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reading: 1 featured + rest stacked ── */}
      {lead && (
        <section className="max-w-6xl mx-auto px-5 py-14 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="kicker mb-2">Honest guides</p>
              <h2 className="font-heading text-[28px] md:text-[32px] text-ink leading-tight">How it really works over here</h2>
            </div>
            <Link href="/learn" className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:text-navy-deep transition-colors mb-1">
              All guides <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            <Link href={`/learn/${lead.slug}`} className="lg:col-span-7 group cursor-pointer">
              <p className="kicker mb-3 text-gold-dark">{lead.category}</p>
              <h3 className="font-heading text-[26px] md:text-[30px] leading-[1.15] text-ink group-hover:text-navy transition-colors mb-3">
                {lead.title}
              </h3>
              <p className="text-muted text-[15px] leading-relaxed mb-4 max-w-xl">{lead.excerpt}</p>
              <span className="text-[13px] text-faint">{lead.readTime}</span>
            </Link>
            <div className="lg:col-span-5 lg:border-l lg:border-line lg:pl-10">
              {rest.map((a, i) => (
                <Link key={a.id} href={`/learn/${a.slug}`} className={`block group cursor-pointer py-5 ${i > 0 ? 'border-t border-line' : 'lg:pt-0'}`}>
                  <p className="kicker mb-2 text-gold-dark">{a.category}</p>
                  <h4 className="font-heading text-[19px] leading-snug text-ink group-hover:text-navy transition-colors mb-1.5">{a.title}</h4>
                  <span className="text-[13px] text-faint">{a.readTime}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter: navy band ── */}
      <section className="bg-dark">
        <div className="max-w-6xl mx-auto px-5 py-14 md:py-16 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <h2 className="font-heading text-[26px] md:text-[30px] text-white leading-tight mb-2">The season is starting. Stay across it.</h2>
            <p className="text-white/50 text-[14px] leading-relaxed max-w-md">
              Program updates, recruitment windows, and new guides — a short email, only when there's something worth sending.
            </p>
          </div>
          <div className="lg:col-span-6">
            {subscribed ? (
              <p className="inline-flex items-center gap-2 text-[14px] text-white font-medium">
                <Check size={16} className="text-gold" /> You're on the list. Welcome aboard.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md lg:ml-auto">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-4 py-3 rounded-md bg-white/10 border border-white/15 text-white text-[14px] outline-none placeholder:text-white/40 focus:border-white/40 transition-colors"
                />
                <button type="submit" className="btn bg-gold text-dark px-5 py-3 rounded-md text-[13px] font-bold whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
