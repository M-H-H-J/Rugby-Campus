import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, MapPin, ArrowRight, Trophy, Mail, Check } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import { articles } from '@/data/articles';
import CollegeCard from '@/components/CollegeCard';
import ArticleCard from '@/components/ArticleCard';
import USMap from '@/components/USMap';
import { captureEmail } from '@/lib/supabase';

export default function Home() {
  usePageMeta('', 'Discover the best college rugby programs in the USA. Interactive map, coach contacts, and honest guides — built by a national championship-winning coach.');
  const [, navigate] = useLocation();
  const { colleges } = useColleges();
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const featured = colleges.filter((c) => c.tier === 'championship').slice(0, 3);

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
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-5 pt-14 md:pt-20 pb-12 text-center">
        <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-dark leading-[1.08] mb-5 max-w-3xl mx-auto">
          Find your rugby<br /><span className="text-navy">college in the USA</span>
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          40 top programs mapped, compared, and explained — with coach contacts and honest guides on how recruitment really works.
        </p>

        {/* Pill search */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
          <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg shadow-gray-200/60 pl-5 pr-1.5 py-1.5 focus-within:border-navy/40 focus-within:ring-4 focus-within:ring-navy/5 transition-all">
            <Search size={18} className="text-gray-300 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleges, cities, or states…"
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent placeholder:text-gray-300"
            />
            <button type="submit" className="bg-navy text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-navy/90 transition-colors">
              Search
            </button>
          </div>
        </form>

        {/* Trust strip */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-[13px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <Trophy size={14} className="text-gold" /> Built by a 2023 NCR D1 National Championship–winning coach
          </span>
          <span className="hidden sm:block w-px h-4 bg-gray-200" />
          <span>Free for players. Always.</span>
        </div>
      </section>

      {/* ── Map preview ── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-12 md:py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl text-dark">Explore the map</h2>
              <p className="text-gray-400 text-sm mt-1">All {colleges.length} programs, coast to coast</p>
            </div>
            <Link href="/map" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-navy/80">
              Interactive map <ArrowRight size={14} />
            </Link>
          </div>
          <Link href="/map">
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white cursor-pointer shadow-sm hover:shadow-xl hover:shadow-gray-200/70 transition-shadow">
              <USMap colleges={colleges} onSelect={() => navigate('/map')} height={400} interactive={false} />
            </div>
          </Link>
          <div className="mt-4 sm:hidden text-center">
            <Link href="/map" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
              Open interactive map <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Championship contenders ── */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="font-heading font-bold text-xl text-dark">Championship contenders</h2>
            <p className="text-gray-400 text-sm mt-1">The programs that played for titles in 2025–26</p>
          </div>
          <Link href="/colleges" className="text-sm font-semibold text-navy hover:text-navy/80">View all 40 →</Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featured.map((c) => <CollegeCard key={c.id} college={c} />)}
        </div>
      </section>

      {/* ── Pathway ── */}
      <section className="bg-navy">
        <div className="max-w-6xl mx-auto px-5 py-14 md:py-16 text-center">
          <h2 className="font-heading font-bold text-2xl text-white mb-2">Your pathway to college rugby</h2>
          <p className="text-white/40 text-sm mb-12">From anywhere in the world, in three steps.</p>
          <div className="grid sm:grid-cols-3 gap-10 max-w-3xl mx-auto">
            {[
              { n: '01', t: 'Explore programs', d: 'Browse the map and find colleges that match your level, location, and goals.' },
              { n: '02', t: 'Contact coaches', d: 'Get coach emails and reach out directly. No middleman, no fees.' },
              { n: '03', t: 'Apply & play', d: 'Use the guides to navigate applications and get recruited.' },
            ].map((s) => (
              <div key={s.n}>
                <div className="w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center mx-auto mb-4 text-gold font-bold text-sm">{s.n}</div>
                <h3 className="font-heading font-semibold text-white text-base mb-2">{s.t}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Articles ── */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="font-heading font-bold text-xl text-dark">Learn how it really works</h2>
            <p className="text-gray-400 text-sm mt-1">Honest guides from someone who's lived it</p>
          </div>
          <Link href="/learn" className="text-sm font-semibold text-navy hover:text-navy/80">All guides →</Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {articles.filter((a) => !a.content.startsWith('Coming soon')).slice(0, 3).map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-14 text-center">
          <h2 className="font-heading font-bold text-2xl text-dark mb-2">Stay in the loop</h2>
          <p className="text-gray-400 text-sm mb-7 max-w-md mx-auto">Program updates, recruitment tips, and new guides — straight to your inbox.</p>
          {subscribed ? (
            <p className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-5 py-3.5 text-sm font-medium">
              <Check size={16} /> You're subscribed — welcome aboard.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2.5 max-w-md mx-auto">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-navy/40 focus:ring-4 focus:ring-navy/5 transition-all"
              />
              <button type="submit" className="inline-flex items-center gap-2 bg-navy text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-navy/90 whitespace-nowrap transition-colors">
                <Mail size={15} /> Subscribe
              </button>
            </form>
          )}
          <p className="text-gray-300 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </>
  );
}
