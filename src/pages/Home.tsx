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
      {/* ── Hero: editorial broadsheet style ── */}
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-5 pt-16 md:pt-24 pb-14 md:pb-20">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="kicker mb-4">College Rugby USA</p>
              <h1 className="font-heading text-[48px] md:text-[64px] lg:text-[72px] leading-[0.95] tracking-[-0.02em] text-ink mb-6">
                Every top program in America
              </h1>
              <p className="font-heading text-[19px] md:text-[21px] text-muted leading-[1.5] mb-8 max-w-md">
                40 programs across CRAA D1A and NCR D1 — tiered on results, with coach contacts and straight answers on how recruitment actually works.
              </p>

              <form onSubmit={handleSearch} className="max-w-md mb-6">
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

              <p className="text-[13px] text-muted border-t border-line pt-4">
                Built by a 2023 NCR D1 national championship coach. Free for players.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white border border-line rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-caps text-navy">Interactive Map</span>
                  <span className="text-[12px] text-faint">{colleges.length} programs</span>
                </div>
                <Link href="/map" aria-label="Open the interactive map" className="block group cursor-pointer">
                  <USMap colleges={colleges} onSelect={() => navigate('/map')} height={400} interactive={false} />
                  <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-line bg-white group-hover:bg-navy/[0.02] transition-colors">
                    <span className="text-[13px] font-semibold text-navy">Open full map</span>
                    <ArrowRight size={14} className="text-navy transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Championship contenders — editorial rows ── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="flex items-end justify-between mb-10 pb-4 border-b border-line">
          <div>
            <p className="kicker mb-3">2025–26 Season</p>
            <h2 className="font-heading text-[32px] md:text-[38px] text-ink leading-[1.1] tracking-[-0.01em]">The championship contenders</h2>
          </div>
          <Link href="/colleges" className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:text-navy-deep transition-colors">
            All 40 programs <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-0">
          {featured.map((c, i) => (
            <Link key={c.id} href={`/colleges/${c.slug}`} className={`group flex gap-6 md:gap-8 py-6 cursor-pointer ${i > 0 ? 'border-t border-line' : ''}`}>
              <div className="w-28 md:w-40 flex-shrink-0">
                <div className="aspect-[4/3] rounded-md overflow-hidden bg-[#eef1f5]">
                  <img src={c.imageUrl} alt={c.name} className="card-img w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
              <div className="flex-1 min-w-0 py-1">
                <p className="text-[11px] font-semibold uppercase tracking-caps text-faint mb-2">{c.affiliation} · {c.conference}</p>
                <h3 className="font-heading text-[22px] md:text-[26px] leading-[1.15] text-ink group-hover:text-navy transition-colors mb-2">{c.name}</h3>
                <p className="text-[14px] text-muted line-clamp-2 max-w-xl">{c.location} · {c.programType}{c.draftPicks >= 2 ? ` · ${c.draftPicks} MLR draft picks` : ''}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-line sm:hidden">
          <Link href="/colleges" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy">
            All 40 programs <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── How it works: editorial numbered list ── */}
      <section className="border-y border-line bg-white">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="max-w-xl mb-12 pb-6 border-b border-line">
            <p className="kicker mb-3">The Pathway</p>
            <h2 className="font-heading text-[32px] md:text-[38px] text-ink leading-[1.1] tracking-[-0.01em] mb-4">From anywhere in the world to a US squad</h2>
            <p className="font-heading text-[17px] text-muted leading-[1.6]">
              No agency required. This is the same process I used as a 17-year-old from Australia — and later ran from the other side as a head coach.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-0">
            {[
              { n: '1', t: 'Find programs that fit', d: 'Browse the map and the tiers. Match your level honestly — game time at the right program beats a bench spot at a famous one.' },
              { n: '2', t: 'Email the coach yourself', d: 'Every profile has the coach\u2019s contact. A short, direct email with your position, size, and highlights is all it takes. Coaches answer players.' },
              { n: '3', t: 'Apply and get over there', d: 'The guides cover applications, visas, scholarships, and what to expect when you land. If you want hands-on help, that\u2019s what I do.' },
            ].map((s, i) => (
              <div key={s.n} className={`py-6 md:py-0 md:px-8 ${i > 0 ? 'border-t md:border-t-0 md:border-l border-line' : ''} ${i === 0 ? 'md:pl-0' : ''} ${i === 2 ? 'md:pr-0' : ''}`}>
                <span className="font-heading text-[42px] text-navy leading-none block mb-4">{s.n}</span>
                <h3 className="font-heading text-[18px] text-ink mb-2">{s.t}</h3>
                <p className="text-muted text-[14px] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reading: editorial list ── */}
      {lead && (
        <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="flex items-end justify-between mb-10 pb-4 border-b border-line">
            <div>
              <p className="kicker mb-3">Honest Guides</p>
              <h2 className="font-heading text-[32px] md:text-[38px] text-ink leading-[1.1] tracking-[-0.01em]">How it really works over here</h2>
            </div>
            <Link href="/learn" className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:text-navy-deep transition-colors">
              All guides <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            <Link href={`/learn/${lead.slug}`} className="lg:col-span-7 group cursor-pointer">
              <p className="kicker mb-3">{lead.category}</p>
              <h3 className="font-heading text-[28px] md:text-[34px] leading-[1.12] text-ink group-hover:text-navy transition-colors mb-4">
                {lead.title}
              </h3>
              <p className="font-heading text-[17px] text-muted leading-[1.6] mb-4 max-w-xl">{lead.excerpt}</p>
              <span className="text-[13px] text-faint">{lead.readTime}</span>
            </Link>
            <div className="lg:col-span-5 lg:border-l lg:border-line lg:pl-10">
              {rest.map((a, i) => (
                <Link key={a.id} href={`/learn/${a.slug}`} className={`block group cursor-pointer py-5 ${i > 0 ? 'border-t border-line' : 'lg:pt-0'}`}>
                  <p className="kicker mb-2">{a.category}</p>
                  <h4 className="font-heading text-[20px] leading-snug text-ink group-hover:text-navy transition-colors mb-2">{a.title}</h4>
                  <span className="text-[13px] text-faint">{a.readTime}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter: dark band with gold CTA ── */}
      <section className="bg-dark">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="kicker mb-4 text-gold">Stay Connected</p>
            <h2 className="font-heading text-[28px] md:text-[36px] text-white leading-[1.15] tracking-[-0.01em] mb-4">The season is starting. Stay across it.</h2>
            <p className="text-white/50 text-[15px] leading-relaxed mb-8 max-w-lg mx-auto">
              Program updates, recruitment windows, and new guides — a short email, only when there's something worth sending.
            </p>
            {subscribed ? (
              <p className="inline-flex items-center gap-2 text-[14px] text-white font-medium">
                <Check size={16} className="text-gold" /> You're on the list. Welcome aboard.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-4 py-3.5 rounded-md bg-white/10 border border-white/15 text-white text-[14px] outline-none placeholder:text-white/40 focus:border-white/40 transition-colors"
                />
                <button type="submit" className="btn bg-gold text-dark px-6 py-3.5 rounded-md text-[13px] font-bold whitespace-nowrap">
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
