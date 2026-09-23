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
    const matchTab = tab === 'All' || c.affiliation === tab || c.affiliation === 'Both';
    const matchTier = tierFilter === 'all' || c.tier === tierFilter;
    const matchType = typeFilter === 'all' || c.programType === typeFilter;
    return matchQ && matchTab && matchTier && matchType;
  }), [colleges, search, tab, tierFilter, typeFilter]);

  const grouped = useMemo(() => TIER_ORDER
    .map((t) => ({ tier: t, items: filtered.filter((c) => c.tier === t) }))
    .filter((g) => g.items.length > 0), [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-baseline gap-3">
          <h1 className="font-heading text-[22px] md:text-[26px] text-ink">Programs</h1>
          <span className="text-[13px] text-faint">{SEASON_LABEL}</span>
        </div>
        <Link href="/map" className="btn inline-flex items-center gap-1.5 self-start md:self-auto bg-white border border-line text-ink px-3 py-1.5 rounded-md text-[12px] font-medium hover:border-navy/30">
          <MapIcon size={14} /> Map
        </Link>
      </div>

      {/* Filter bar — dense tool chrome */}
      <div className="sticky top-14 z-30 bg-paper -mx-4 px-4 border-b border-line mb-5">
        <div className="flex items-center gap-4 py-2">
          <div className="flex gap-4 -mb-px">
            {AFFILIATION_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-2 text-[12px] font-medium border-b-2 transition-colors ${
                  tab === t ? 'border-navy text-ink' : 'border-transparent text-faint hover:text-muted'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center flex-1 gap-2">
            <div className="flex items-center max-w-[180px] bg-white border border-line rounded-md px-2 focus-within:border-navy transition-colors">
              <Search size={12} className="text-faint flex-shrink-0" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="flex-1 min-w-0 bg-transparent px-1.5 py-1 text-[12px] outline-none placeholder:text-faint"
              />
            </div>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
              className="bg-white border border-line rounded-md px-2 py-1 text-[12px] text-muted outline-none cursor-pointer hover:border-navy/40">
              <option value="all">All tiers</option>
              {TIER_ORDER.map((t) => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="bg-white border border-line rounded-md px-2 py-1 text-[12px] text-muted outline-none cursor-pointer hover:border-navy/40">
              <option value="all">All types</option>
              <option value="Varsity">Varsity</option>
              <option value="Club">Club</option>
            </select>
            <span className="text-[11px] text-faint ml-auto hidden sm:block">{filtered.length} results</span>
          </div>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-[14px] mb-3">No programs match those filters.</p>
          <button onClick={() => { setSearch(''); setTab('All'); setTierFilter('all'); setTypeFilter('all'); }}
            className="text-navy text-[13px] font-semibold hover:text-navy-deep">Clear all</button>
        </div>
      ) : (
        grouped.map(({ tier, items }, gi) => (
          <section key={tier} className={gi > 0 ? 'mt-8 pt-6 border-t border-line' : ''}>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="kicker">{TIER_LABELS[tier]}s</p>
              <span className="text-[11px] text-faint">{items.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {items.map((c) => <CollegeCard key={c.id} college={c} variant="tool" />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
