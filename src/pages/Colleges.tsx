import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, SlidersHorizontal, Map as MapIcon } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import { TIER_LABELS, SEASON_LABEL, Tier } from '@/data/colleges';
import CollegeCard from '@/components/CollegeCard';
import { Link } from 'wouter';

const AFFILIATION_TABS = ['All', 'CRAA D1A', 'NCR D1'] as const;
const TIER_ORDER: Tier[] = ['championship', 'playoff', 'competitive'];

export default function Colleges() {
  usePageMeta('College Rugby Programs', 'Browse the top 40 college rugby programs in the USA — CRAA D1A and NCR D1 — with tiers, coach contacts, conferences, and campus details.');
  const { colleges } = useColleges();
  const [location] = useLocation();

  // Read ?q= from the hero search
  const initialQ = useMemo(() => {
    const qs = window.location.search;
    const m = qs.match(/[?&]q=([^&]*)/);
    return m ? decodeURIComponent(m[1]) : '';
  }, [location]);

  const [search, setSearch] = useState(initialQ);
  useEffect(() => { setSearch(initialQ); }, [initialQ]);

  const [tab, setTab] = useState<(typeof AFFILIATION_TABS)[number]>('All');
  const [tierFilter, setTierFilter] = useState<'all' | Tier>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Varsity' | 'Club'>('all');

  const filtered = useMemo(() => colleges.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.conference.toLowerCase().includes(q);
    const matchTab = tab === 'All' || c.affiliation === tab;
    const matchTier = tierFilter === 'all' || c.tier === tierFilter;
    const matchType = typeFilter === 'all' || c.programType === typeFilter;
    return matchQ && matchTab && matchTier && matchType;
  }), [colleges, search, tab, tierFilter, typeFilter]);

  const grouped = useMemo(() => TIER_ORDER
    .map((t) => ({ tier: t, items: filtered.filter((c) => c.tier === t) }))
    .filter((g) => g.items.length > 0), [filtered]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
        <div>
          <h1 className="font-heading font-bold text-3xl text-dark mb-2">College rugby programs</h1>
          <p className="text-gray-400 text-sm">The top 40 men's programs in the USA. <span className="text-gray-300">{SEASON_LABEL}.</span></p>
        </div>
        <Link href="/map" className="inline-flex items-center gap-2 self-start md:self-auto border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
          <MapIcon size={15} /> Map view
        </Link>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md -mx-5 px-5 py-3 border-b border-gray-100 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Affiliation tabs */}
          <div className="flex bg-gray-50 rounded-xl p-1 self-start">
            {AFFILIATION_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${tab === t ? 'bg-white text-navy shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center flex-1 max-w-md bg-gray-50 rounded-xl px-3.5">
            <Search size={15} className="text-gray-300" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, city, state, or conference…"
              className="flex-1 bg-transparent px-2.5 py-2.5 text-sm outline-none placeholder:text-gray-300"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-300 hidden lg:block" />
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
              className="bg-gray-50 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-600 outline-none cursor-pointer">
              <option value="all">All tiers</option>
              {TIER_ORDER.map((t) => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="bg-gray-50 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-600 outline-none cursor-pointer">
              <option value="all">Club & Varsity</option>
              <option value="Varsity">Varsity</option>
              <option value="Club">Club</option>
            </select>
          </div>

          {/* Women's framework toggle (disabled — flip on when data lands) */}
          <div className="flex items-center gap-2 lg:ml-auto" title="Women's programs are coming soon">
            <span className="text-[12px] font-medium text-gray-300 select-none">Men's</span>
            <button disabled aria-label="Switch to women's programs (coming soon)"
              className="relative w-9 h-5 rounded-full bg-gray-100 cursor-not-allowed">
              <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
            <span className="text-[12px] font-medium text-gray-300 select-none">Women's <span className="text-gold-dark bg-gold/10 px-1.5 py-0.5 rounded ml-0.5 text-[10px] font-semibold">Soon</span></span>
          </div>
        </div>
      </div>

      {/* Results */}
      <p className="text-[13px] text-gray-400 mb-8">
        Showing <strong className="text-gray-600">{filtered.length}</strong> of {colleges.length} programs
      </p>

      {grouped.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm mb-2">No programs match those filters.</p>
          <button onClick={() => { setSearch(''); setTab('All'); setTierFilter('all'); setTypeFilter('all'); }}
            className="text-navy text-sm font-semibold hover:underline">Clear all filters</button>
        </div>
      ) : (
        grouped.map(({ tier, items }) => (
          <section key={tier} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="font-heading font-bold text-lg text-dark">{TIER_LABELS[tier]}</h2>
              <span className="text-xs text-gray-300 font-medium">{items.length} programs</span>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {items.map((c) => <CollegeCard key={c.id} college={c} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
