import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Check } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import { articles } from '@/data/articles';
import USMap from '@/components/USMap';
import { captureEmail } from '@/lib/supabase';
import { TIER_LABELS } from '@/data/colleges';

export default function Home() {
  usePageMeta('', 'Every top college rugby program in America — mapped, tiered, and explained. Coach contacts and honest recruitment guides from a national championship-winning coach.');
  const [, navigate] = useLocation();
  const { colleges } = useColleges();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const featured = colleges.filter((c) => c.tier === 'championship').slice(0, 4);
  const fullArticles = articles.filter((a) => !a.content.startsWith('Coming soon'));
  const [lead, ...rest] = fullArticles;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await captureEmail(email, 'newsletter');
    setSubscribed(true);
  };

  return (
    <>
      {/* ── Masthead band ── */}
      <header className="border-b border-line">
        <div className="max-w-7xl mx-auto px-5 py-8 md:py-12">
          <p className="kicker mb-3">College Rugby USA</p>
          <h1 className="font-heading text-[52px] md:text-[72px] lg:text-[88px] leading-[0.92] tracking-[-0.03em] text-ink max-w-4xl">
            Every top program in America. Mapped.
          </h1>
        </div>
      </header>

      {/* ── MAP-FIRST HERO: the product ── */}
      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-5 py-6 md:py-10">
          <div className="bg-white border border-line rounded-lg overflow-hidden">
            <Link href="/map" className="block group cursor-pointer">
              <USMap colleges={colleges} onSelect={() => navigate('/map')} height={520} interactive={false} />
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-t border-line">
              <div>
                <p className="text-[13px] text-muted">
                  <span className="font-semibold text-ink">{colleges.length} programs</span> across CRAA D1A and NCR D1 — click to explore
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/map" className="btn inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-md text-[13px] font-semibold">
                  Explore the map <ArrowRight size={14} />
                </Link>
                <Link href="/colleges" className="text-[13px] font-medium text-navy hover:text-navy-deep">
                  View as list
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Credential strip ── */}
      <div className="border-b border-line bg-white">
        <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[13px] text-muted">
            Built by <span className="text-ink font-medium">Hugh Johnston</span> — 2023 NCR D1 National Championship coach. Free for players, always.
          </p>
          <Link href="/about" className="text-[13px] font-medium text-navy hover:text-navy-deep">
            About Hugh
          </Link>
        </div>
      </div>

      {/* ── Championship contenders — large editorial rows ── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="kicker mb-3">2025–26 Season</p>
              <h2 className="font-heading text-[36px] md:text-[48px] text-ink leading-[1.05] tracking-[-0.02em]">Championship contenders</h2>
            </div>
            <Link href="/colleges" className="hidden sm:inline-flex items-center gap-2 text-[14px] font-semibold text-navy hover:text-navy-deep transition-colors">
              All 40 programs <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="border-y border-line">
          {featured.map((c, i) => (
            <Link key={c.id} href={`/colleges/${c.slug}`} className={`block group cursor-pointer ${i > 0 ? 'border-t border-line' : ''}`}>
              <div className="max-w-7xl mx-auto px-5 py-6 md:py-8 flex gap-6 md:gap-10 items-center">
                <div className="w-24 md:w-36 flex-shrink-0">
                  <div className="aspect-[4/3] rounded-md overflow-hidden bg-line flex items-center justify-center">
                    <span className="text-[11px] text-faint font-medium text-center px-2">{c.name}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="kicker mb-2">{c.affiliation} · {c.conference}</p>
                  <h3 className="font-heading text-[26px] md:text-[32px] leading-[1.1] tracking-[-0.01em] text-ink group-hover:text-navy transition-colors mb-1">{c.name}</h3>
                  <p className="text-[14px] md:text-[15px] text-muted">{c.location}{c.draftPicks >= 2 ? ` · ${c.draftPicks} MLR draft picks` : ''}</p>
                </div>
                <ArrowRight size={20} className="text-line group-hover:text-navy transition-colors flex-shrink-0 hidden md:block" />
              </div>
            </Link>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-5 pt-6 sm:hidden">
          <Link href="/colleges" className="inline-flex items-center gap-2 text-[14px] font-semibold text-navy">
            All 40 programs <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── How it works: editorial numbered list ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 py-16 md:py-24">
          <div className="max-w-2xl mb-12">
            <p className="kicker mb-3">The Pathway</p>
            <h2 className="font-heading text-[36px] md:text-[48px] text-ink leading-[1.05] tracking-[-0.02em] mb-5">From anywhere to a US squad</h2>
            <p className="font-heading text-[18px] md:text-[20px] text-muted leading-[1.55]">
              No agency required. This is the same process I used as a 17-year-old from Australia — and later ran from the other side as a head coach.
            </p>
          </div>
          <div className="border-t border-line">
            {[
              { n: '1', t: 'Find programs that fit', d: 'Browse the map and the tiers. Match your level honestly — game time at the right program beats a bench spot at a famous one.' },
              { n: '2', t: 'Email the coach yourself', d: 'Every profile has the coach\u2019s contact. A short, direct email with your position, size, and highlights is all it takes. Coaches answer players.' },
              { n: '3', t: 'Apply and get over there', d: 'The guides cover applications, visas, scholarships, and what to expect when you land. If you want hands-on help, that\u2019s what I do.' },
            ].map((s, i) => (
              <div key={s.n} className={`flex gap-6 md:gap-10 py-8 ${i > 0 ? 'border-t border-line' : ''}`}>
                <span className="font-heading text-[56px] md:text-[72px] text-navy leading-none w-16 md:w-24 flex-shrink-0">{s.n}</span>
                <div className="pt-2 md:pt-4">
                  <h3 className="font-heading text-[22px] md:text-[26px] text-ink mb-2 tracking-[-0.01em]">{s.t}</h3>
                  <p className="text-muted text-[15px] md:text-[16px] leading-relaxed max-w-xl">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reading: editorial list ── */}
      {lead && (
        <section className="border-t border-line">
          <div className="max-w-7xl mx-auto px-5 py-16 md:py-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="kicker mb-3">Honest Guides</p>
                <h2 className="font-heading text-[36px] md:text-[48px] text-ink leading-[1.05] tracking-[-0.02em]">How it really works</h2>
              </div>
              <Link href="/learn" className="hidden sm:inline-flex items-center gap-2 text-[14px] font-semibold text-navy hover:text-navy-deep transition-colors">
                All guides <ArrowRight size={15} />
              </Link>
            </div>

            <div className="border-t border-line">
              <Link href={`/learn/${lead.slug}`} className="block group cursor-pointer py-8 border-b border-line">
                <p className="kicker mb-3">{lead.category}</p>
                <h3 className="font-heading text-[28px] md:text-[36px] leading-[1.1] tracking-[-0.01em] text-ink group-hover:text-navy transition-colors mb-3 max-w-3xl">
                  {lead.title}
                </h3>
                <p className="font-heading text-[17px] md:text-[19px] text-muted leading-[1.55] mb-3 max-w-2xl">{lead.excerpt}</p>
                <span className="text-[13px] text-faint">{lead.readTime}</span>
              </Link>
              {rest.slice(0, 2).map((a) => (
                <Link key={a.id} href={`/learn/${a.slug}`} className="block group cursor-pointer py-6 border-b border-line">
                  <p className="kicker mb-2">{a.category}</p>
                  <h4 className="font-heading text-[22px] md:text-[26px] leading-snug text-ink group-hover:text-navy transition-colors mb-1">{a.title}</h4>
                  <span className="text-[13px] text-faint">{a.readTime}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter: dark band with gold CTA ── */}
      <section className="bg-dark">
        <div className="max-w-7xl mx-auto px-5 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="kicker mb-4 text-gold">Stay Connected</p>
            <h2 className="font-heading text-[32px] md:text-[44px] text-white leading-[1.1] tracking-[-0.02em] mb-5">The season is starting. Stay across it.</h2>
            <p className="text-white/50 text-[16px] leading-relaxed mb-8 max-w-lg">
              Program updates, recruitment windows, and new guides — a short email, only when there's something worth sending.
            </p>
            {subscribed ? (
              <p className="inline-flex items-center gap-2 text-[15px] text-white font-medium">
                <Check size={18} className="text-gold" /> You're on the list. Welcome aboard.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-4 py-3.5 rounded-md bg-white/10 border border-white/15 text-white text-[15px] outline-none placeholder:text-white/40 focus:border-white/40 transition-colors"
                />
                <button type="submit" className="btn bg-gold text-dark px-6 py-3.5 rounded-md text-[14px] font-bold whitespace-nowrap">
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
