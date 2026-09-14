import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, Map as MapIcon } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import { TIER_LABELS, SEASON_LABEL, Tier } from '@/data/colleges';
import CollegeCard from '@/components/CollegeCard';

const AFFILIATION_TABS = ['All', 'CRAA D1A', 'NCR D1'] as const;
const TIER_ORDER: Tier[] = ['championship', 'playoff', 'competitive'];

export default function Colleges() {
  usePageMeta('College Rugby Programs', 'The top 40 college rugby programs in the USA — CRAA D1A and NCR D1 — tiered on results, with coach contacts, conferences, and campus details.');
  const { colleges } = useColleges();
  const [location] = useLocation();

  const initialQ = useMemo(() => {
    const m = window.location.search.match(/[?&]q=([^&]*)/);
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
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="kicker mb-2">{SEASON_LABEL}</p>
          <h1 className="font-heading text-[34px] md:text-[40px] leading-tight text-ink">The 40 best college rugby programs in America</h1>
        </div>
        <Link href="/map" className="btn inline-flex items-center gap-2 self-start md:self-auto border border-line text-ink px-4 py-2.5 rounded-md text-[13px] font-semibold hover:border-navy/40">
          <MapIcon size={15} /> Map view
        </Link>
      </div>

      {/* Filter bar — underline tabs, plain controls */}
      <div className="sticky top-16 z-30 bg-white -mx-5 px-5 border-b border-line mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-x-8 gap-y-3 pb-0">
          <div className="flex gap-6 -mb-px">
            {AFFILIATION_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-3 pt-2 text-[13.5px] font-medium border-b-2 transition-colors ${
                  tab === t ? 'border-navy text-ink' : 'border-transparent text-faint hover:text-muted'
                }`}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center flex-1 gap-4 pb-3 lg:pb-2.5">
            <div className="flex items-center flex-1 max-w-xs border border-line rounded-md px-3 focus-within:border-navy transition-colors">
              <Search size={14} className="text-faint flex-shrink-0" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search programs"
                className="flex-1 min-w-0 bg-transparent px-2.5 py-2 text-[13px] outline-none placeholder:text-faint"
              />
            </div>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
              className="bg-transparent border border-line rounded-md px-2.5 py-2 text-[13px] text-muted outline-none cursor-pointer hover:border-navy/40 transition-colors">
              <option value="all">All tiers</option>
              {TIER_ORDER.map((t) => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="bg-transparent border border-line rounded-md px-2.5 py-2 text-[13px] text-muted outline-none cursor-pointer hover:border-navy/40 transition-colors">
              <option value="all">Club & varsity</option>
              <option value="Varsity">Varsity</option>
              <option value="Club">Club</option>
            </select>

            <div className="hidden lg:flex items-center gap-2 ml-auto" title="Women's programs coming soon">
              <span className="text-[12px] text-faint select-none">Men's</span>
              <button disabled aria-label="Women's programs coming soon"
                className="relative w-8 h-[18px] rounded-full bg-line cursor-not-allowed">
                <span className="absolute left-0.5 top-0.5 w-[14px] h-[14px] rounded-full bg-white shadow-sm" />
              </button>
              <span className="text-[12px] text-faint select-none">Women's soon</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[13px] text-faint mb-10">
        {filtered.length} of {colleges.length} programs
      </p>

      {grouped.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted text-[14px] mb-3">No programs match those filters.</p>
          <button onClick={() => { setSearch(''); setTab('All'); setTierFilter('all'); setTypeFilter('all'); }}
            className="text-navy text-[13px] font-semibold hover:text-navy-deep">Clear all filters</button>
        </div>
      ) : (
        grouped.map(({ tier, items }, gi) => (
          <section key={tier} className={gi > 0 ? 'mt-16 pt-12 border-t border-line' : ''}>
            <div className="flex items-baseline gap-3 mb-8">
              <h2 className="font-heading text-[24px] text-ink">{TIER_LABELS[tier]}s</h2>
              <span className="text-[13px] text-faint">{items.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
              {items.map((c) => <CollegeCard key={c.id} college={c} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
