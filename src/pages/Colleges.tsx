import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, Map as MapIcon } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import { TIER_LABELS, TIER_ORDER, TIER_SUBLINE, SEASON_LABEL, Tier, type College } from '@/data/colleges';
import TierDot from '@/components/TierDot';
import CollegeSearch from '@/components/search/CollegeSearch';

const AFFILIATION_TABS = ['All', 'CRAA D1A', 'NCR D1'] as const;

function TierHeading({ tier, count }: { tier: Tier; count: number }) {
  return (
    <div className="min-w-0">
      <h2 className="font-heading text-[26px] leading-tight text-ink flex items-start gap-2 min-w-0 break-words">
        <span className="mt-2 shrink-0"><TierDot tier={tier} size="md" /></span>
        <span className="min-w-0 break-words">{TIER_LABELS[tier]}</span>
      </h2>
      <p className="text-[13px] text-muted mt-2">{TIER_SUBLINE[tier]} <span className="text-faint">{count} programs</span></p>
    </div>
  );
}

function PhotoGrid({ items }: { items: College[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 min-w-0">
      {items.map((c) => (
        <Link key={c.slug} href={`/colleges/${c.slug}`} className="group">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-line mb-3">
            {c.imageUrl ? (
              <img src={c.imageUrl} alt={`${c.name} campus`} loading="lazy" className="card-img w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center px-3 text-[12px] text-faint">{c.name}</div>
            )}
          </div>
          <h3 className="font-heading text-[20px] leading-snug text-ink group-hover:text-navy">{c.name}</h3>
          <p className="text-[13px] text-muted mt-1">{c.location}</p>
          <p className="text-[12px] text-faint mt-1">{c.conference}</p>
        </Link>
      ))}
    </div>
  );
}

function ProgramList({ items }: { items: College[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-10 min-w-0">
      {items.map((c) => (
        <Link key={c.slug} href={`/colleges/${c.slug}`} className="block py-2.5 border-b border-line min-w-0">
          <span className="block text-[15px] text-ink font-medium break-words">{c.name}</span>
          <span className="text-[13px] text-muted">{c.location} · {c.conference}</span>
        </Link>
      ))}
    </div>
  );
}

export default function Colleges() {
  usePageMeta('College Rugby Programs', 'US college rugby programs across CRAA D1A and NCR D1, grouped into four tiers, with coach contacts, conferences, and campus details.');
  const { colleges } = useColleges();
  const [location] = useLocation();

  const initialQ = useMemo(() => {
    const m = window.location.search.match(/[?&]q=([^&]*)/);
    return m ? decodeURIComponent(m[1]) : '';
  }, [location]);

  const initialFind = useMemo(() => {
    const m = window.location.search.match(/[?&]find=([^&]*)/);
    try { return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')).slice(0, 300) : ''; } catch { return ''; }
  }, [location]);

  const [search, setSearch] = useState(initialQ);
  useEffect(() => { setSearch(initialQ); }, [initialQ]);

  const [tab, setTab] = useState<(typeof AFFILIATION_TABS)[number]>('All');
  const [tierFilter, setTierFilter] = useState<'all' | Tier>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Varsity' | 'Club'>('all');

  const filtered = useMemo(() => colleges.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.conference.toLowerCase().includes(q);
    const matchTab = tab === 'All' ||
      (tab === 'CRAA D1A' && c.affiliation.includes('CRAA')) ||
      (tab === 'NCR D1' && c.affiliation.includes('NCR'));
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <p className="text-[13px] text-muted">{SEASON_LABEL}</p>
        <Link href="/map" className="btn inline-flex items-center gap-1.5 self-start md:self-auto bg-white border border-line text-ink px-3 py-1.5 rounded-md text-[12px] font-medium hover:border-navy/30">
          <MapIcon size={14} /> Map
        </Link>
      </div>

      <CollegeSearch colleges={colleges} initialSentence={initialFind} />

      {/* Filter bar — dense tool chrome */}
      <div className="sticky top-14 z-30 bg-white -mx-4 px-4 border-b border-line mb-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2">
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
          <div className="flex flex-wrap items-center flex-1 min-w-0 gap-2">
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
        <>
          <p className="text-[15px] text-ink mb-2">All {colleges.length} compete at the top level of US college rugby.</p>
          {grouped.filter((g) => g.tier === 'championship').map(({ tier, items }) => (
            <section key={tier} className="mt-6 grid md:grid-cols-[14rem_1fr] gap-4 md:gap-10 border-t border-line pt-8 min-w-0">
              <TierHeading tier={tier} count={items.length} />
              <PhotoGrid items={items} />
            </section>
          ))}
          {grouped.some((g) => g.tier === 'championship') && grouped.some((g) => g.tier !== 'championship') && (
            <h2 className="font-heading text-[22px] text-ink mt-14 mb-2">More programs worth a look</h2>
          )}
          {grouped.filter((g) => g.tier !== 'championship').map(({ tier, items }) => (
            <section key={tier} className="mt-8 grid md:grid-cols-[14rem_1fr] gap-4 md:gap-10 border-t border-line pt-8 min-w-0">
              <TierHeading tier={tier} count={items.length} />
              <ProgramList items={items} />
            </section>
          ))}
        </>
      )}
    </div>
  );
}
