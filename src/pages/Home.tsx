import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Check } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import { articles } from '@/data/articles';
import USMap from '@/components/USMap';
import { captureEmail } from '@/lib/supabase';
import { pickTopPrograms } from '@/lib/topPrograms';
import HughPhoto from '@/components/HughPhoto';
import { HUGH_PHOTOS } from '@/lib/hughPhotos';

export default function Home() {
  usePageMeta('', "Every top college rugby program in America, mapped, tiered and explained. Free. Coach contacts and recruitment guides from someone who's been on both sides of recruitment.");
  const [, navigate] = useLocation();
  const { colleges } = useColleges();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [find, setFind] = useState('');

  const featured = pickTopPrograms(colleges);
  const fullArticles = articles.filter((a) => !a.content.startsWith('Coming soon'));
  const [lead, ...rest] = fullArticles;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    await captureEmail(email, 'newsletter');
    setSubscribed(true);
  };

  const [hero, ...restFeatured] = featured;
  const steps = [
    { n: '1', t: 'Find programs that fit', d: 'Browse the map and explore by tier, conference and location. There are so many programs out there, so make sure you find the right one for you.' },
    { n: '2', t: 'Build your highlight reel', d: 'Put together a short highlight reel and a one-page profile of who you are as a player.' },
    { n: '3', t: 'Email the coach', d: "Most profiles list a head coach contact. Where we couldn't confirm one, we say so. Where a program has its own recruitment form, use that first. Then send a short email with a link to your reel. That is enough to start the conversation." },
  ];

  return (
    <>
      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-5 py-8 md:py-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <h1 className="font-heading text-[44px] md:text-[64px] leading-[0.95] tracking-[-0.03em] text-ink">
              Every top program in America. Mapped.
            </h1>
            <p className="mt-5 text-[14px] text-muted">
              Built by <Link href="/about" className="text-navy font-medium underline underline-offset-2">Hugh Johnston</Link>, 2023 NCR D1 national championship coach.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); if (find.trim().length >= 3) navigate('/colleges?find=' + encodeURIComponent(find.trim().slice(0, 300))); }} className="mt-7 flex flex-col sm:flex-row sm:items-end gap-3">
              <label htmlFor="home-find" className="sr-only">Describe your ideal college</label>
              <input id="home-find" value={find} onChange={(e) => setFind(e.target.value)} maxLength={300} placeholder="Engineering, good rugby, mild winters"
                className="flex-1 min-w-0 bg-transparent border-b-2 border-ink py-2 font-heading text-[18px] sm:text-[22px] outline-none placeholder:text-faint" />
              <button className="btn bg-navy text-white px-4 py-2.5 rounded-md text-[13px] font-semibold">Find colleges</button>
            </form>
            <p className="mt-6 text-[13px] text-muted">{colleges.length} programs across CRAA D1A and NCR D1.</p>
          </div>
          <div>
            <Link href="/map" className="block">
              <USMap colleges={colleges} onSelect={() => navigate('/map')} height={420} interactive={false} />
            </Link>
            <Link href="/map" className="btn mt-4 inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-md text-[13px] font-semibold">
              Explore the map <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Who built this: Hugh with the Notre Dame College team */}
      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-5 py-10 md:py-14 grid md:grid-cols-12 gap-6 md:gap-12 items-center">
          <figure className="md:col-span-6 lg:col-span-5">
            <div className="rounded-lg overflow-hidden bg-line">
              <HughPhoto photo="westPoint" sizes="(min-width: 1024px) 520px, (min-width: 768px) 50vw, 100vw" />
            </div>
            <figcaption className="mt-2 text-[12.5px] text-faint">{HUGH_PHOTOS.westPoint.caption}</figcaption>
          </figure>
          <div className="md:col-span-6 lg:col-span-7">
            <p className="kicker mb-3">Built by a coach</p>
            <p className="font-heading text-[24px] md:text-[30px] leading-snug text-ink max-w-xl">
              I played at Notre Dame College, then coached the team to the 2023 NCR D1 national championship.
            </p>
            <Link href="/about" className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-navy">
              Why I built this <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading text-[36px] md:text-[48px] text-ink leading-[1.05]">Top programs</h2>
            <Link href="/colleges" className="inline-flex items-center gap-2 text-[14px] font-semibold text-navy">
              All {colleges.length} programs <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {hero && (
              <Link href={`/colleges/${hero.slug}`} className="group">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-line mb-4">
                  {hero.imageUrl ? (
                    <img src={hero.imageUrl} alt={`${hero.name} campus`} className="card-img w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[13px] text-faint">{hero.name}</div>
                  )}
                </div>
                <h3 className="font-heading text-[32px] leading-tight text-ink group-hover:text-navy">{hero.name}</h3>
                <p className="text-[15px] text-muted mt-1">{hero.location}</p>
              </Link>
            )}
            <div className="border-t border-ink">
              {restFeatured.map((c) => (
                <Link key={c.slug} href={`/colleges/${c.slug}`} className="block py-4 border-b border-line group">
                  <h3 className="font-heading text-[22px] text-ink group-hover:text-navy">{c.name}</h3>
                  <p className="text-[14px] text-muted">{c.location}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-7xl mx-auto px-5 py-16 md:py-24">
          <h2 className="font-heading text-[36px] md:text-[48px] text-ink leading-[1.05] mb-4">From anywhere to a US college</h2>
          <p className="font-heading text-[18px] md:text-[20px] text-muted leading-[1.55] max-w-2xl mb-12">
            I've seen this from both sides, as a recruit trying to get in and as a coach recruiting players.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-heading text-[72px] md:text-[96px] leading-none text-navy">{s.n}</span>
                <h3 className="font-heading text-[22px] text-ink mt-2 mb-2">{s.t}</h3>
                <p className="text-muted text-[15px] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 pt-6 border-t border-line text-muted text-[15px] leading-relaxed max-w-xl">
            If the coach responds, moving forward usually means interviews, academics, and visas. When a program wants you, coaches typically help with the next steps to get you there.
          </p>
        </div>
      </section>

      {/* ── Reading: editorial list ── */}
      {lead && (
        <section className="border-t border-line">
          <div className="max-w-7xl mx-auto px-5 py-16 md:py-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-heading text-[36px] md:text-[48px] text-ink leading-[1.05] tracking-[-0.02em]">Guides</h2>
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
            <p className="kicker mb-4 !text-white/80">New guides by email</p>
            <h2 className="font-heading text-[32px] md:text-[44px] text-white leading-[1.1] tracking-[-0.02em] mb-5">The season has started. Get new guides.</h2>
            <p className="text-white/50 text-[16px] leading-relaxed mb-8 max-w-lg">
              Program updates, recruitment windows and new guides. A short email, only when there's something worth sending.
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
