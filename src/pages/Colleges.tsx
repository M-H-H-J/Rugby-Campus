import { lazy, Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, Map as MapIcon } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import { TIER_LABELS, TIER_ORDER, TIER_SUBLINE, SEASON_LABEL, TIER_GUIDE_NOTE, Tier, type College } from '@/data/colleges';
import { sortColleges } from '@/lib/collegeOrder';
import { hasExactAlias, matchesCollegeQuery } from '@/lib/collegeAliases';
import { readParam, writeParams } from '@/lib/search/urlState';
import TierDot from '@/components/TierDot';
import CampusPhoto from '@/components/CampusPhoto';

// The search box and its data load after the page has appeared.
const CollegeSearch = lazy(() => import('@/components/search/CollegeSearch'));

const AFFILIATION_TABS = ['All', 'CRAA D1A', 'NCR D1'] as const;
type TypeFilter = 'all' | 'Varsity' | 'Club' | 'unconfirmed';
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const isKnownType = (t: string) => t === 'Varsity' || t === 'Club';

function TierHeading({ tier, count }: { tier: Tier; count: number }) {
  return (
    <div className="min-w-0">
      <h2 className="font-heading text-[26px] leading-tight text-ink flex items-start gap-2 min-w-0 break-words">
        {/* Same height as the first line of the heading, so the dot sits at the middle of the word even if the label wraps */}
        <span className="flex items-center h-[32px] shrink-0"><TierDot tier={tier} size="md" /></span>
        <span className="min-w-0 break-words">{TIER_LABELS[tier]}</span>
      </h2>
      <p className="text-[13px] text-muted mt-2">{TIER_SUBLINE[tier]} <span className="text-faint tabular-nums">{plural(count, 'program', 'programs')}</span></p>
    </div>
  );
}

function PhotoGrid({ items }: { items: College[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 min-w-0">
      {items.map((c) => (
        <Link key={c.slug} href={`/colleges/${c.slug}`} className="group">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-line mb-3">
            {c.imageUrl && <CampusPhoto src={c.imageUrl} alt={`${c.name} campus`} size="card" width={800} height={600} className="card-img w-full h-full object-cover" />}
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

const asTab = (v: string) => (AFFILIATION_TABS as readonly string[]).includes(v) ? (v as (typeof AFFILIATION_TABS)[number]) : 'All';
const asTier = (v: string): 'all' | Tier => ((TIER_ORDER as string[]).includes(v) ? (v as Tier) : 'all');
const asType = (v: string): TypeFilter => (['Varsity', 'Club', 'unconfirmed'].includes(v) ? (v as TypeFilter) : 'all');

export default function Colleges() {
  usePageMeta('Best College Rugby Programs in America', `Best college rugby programs in America for ${SEASON_LABEL.split(' ·')[0].replace(' season', '')}, grouped into Tier 1 to Tier 4 across CRAA D1A and NCR D1, with coach contacts and campus facts.`);
  const { colleges } = useColleges();
  const [location] = useLocation();

  const initialFind = useMemo(() => readParam('find').slice(0, 300), [location]);

  const [search, setSearch] = useState(() => readParam('q'));
  const [tab, setTab] = useState(() => asTab(readParam('tab')));
  const [tierFilter, setTierFilter] = useState<'all' | Tier>(() => asTier(readParam('tier')));
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(() => asType(readParam('type')));
  const [searchActive, setSearchActive] = useState(false);
  const [showListAnyway, setShowListAnyway] = useState(false);
  const onActiveChange = useCallback((a: boolean) => { setSearchActive(a); if (!a) setShowListAnyway(false); }, []);

  useEffect(() => {
    writeParams({ q: search.trim() || null, tab: tab === 'All' ? null : tab, tier: tierFilter === 'all' ? null : tierFilter, type: typeFilter === 'all' ? null : typeFilter });
  }, [search, tab, tierFilter, typeFilter]);

  const exactAlias = useMemo(() => hasExactAlias(colleges, search), [colleges, search]);
  const baseFiltered = useMemo(() => colleges.filter((c) => {
    const matchQ = matchesCollegeQuery(c, search, exactAlias);
    const matchTab = tab === 'All' ||
      (tab === 'CRAA D1A' && c.affiliation.includes('CRAA')) ||
      (tab === 'NCR D1' && c.affiliation.includes('NCR'));
    const matchTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchQ && matchTab && matchTier;
  }), [colleges, search, exactAlias, tab, tierFilter]);
  const filtered = useMemo(() => baseFiltered.filter((c) =>
    typeFilter === 'all' || (typeFilter === 'unconfirmed' ? !isKnownType(c.programType) : c.programType === typeFilter)
  ), [baseFiltered, typeFilter]);
  const hiddenUnconfirmed = typeFilter === 'Varsity' || typeFilter === 'Club' ? baseFiltered.filter((c) => !isKnownType(c.programType)).length : 0;

  const grouped = useMemo(() => TIER_ORDER
    .map((t) => ({ tier: t, items: sortColleges(filtered.filter((c) => c.tier === t)) }))
    .filter((g) => g.items.length > 0), [filtered]);

  const filtersOn = !!search.trim() || tab !== 'All' || tierFilter !== 'all' || typeFilter !== 'all';
  const clearAll = () => { setSearch(''); setTab('All'); setTierFilter('all'); setTypeFilter('all'); };
  const hideList = searchActive && !showListAnyway;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Heading row */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="font-heading text-[30px] md:text-[38px] leading-[1.05] text-ink">College rugby programs</h1>
          <p className="mt-2 text-[14px] text-ink/80">{TIER_GUIDE_NOTE} Tier 1 is the strongest group.</p>
          <p className="mt-1 text-[12px] text-faint">{SEASON_LABEL}</p>
        </div>
        <Link href="/map" className="btn inline-flex items-center gap-1.5 shrink-0 bg-white border border-line text-ink px-3 py-1.5 min-h-[44px] rounded-md text-[12px] font-medium hover:border-navy/30">
          <MapIcon size={14} /> Map
        </Link>
      </div>

      <Suspense fallback={<div className="min-h-[300px] md:min-h-[230px]" aria-hidden />}>
        <CollegeSearch colleges={colleges} initialSentence={initialFind} onActiveChange={onActiveChange} />
      </Suspense>

      {hideList ? (
        <p className="border-t border-line pt-5 text-[14px] text-muted">
          Showing your search results above.{' '}
          <button type="button" onClick={() => setShowListAnyway(true)} className="text-navy font-semibold">Show the full list of {colleges.length} programs</button>
        </p>
      ) : (
      <>
      {/* Filter bar: sticky only from the small breakpoint up, so it doesn't cover a phone screen */}
      <div className="sm:sticky sm:top-14 z-30 bg-white -mx-4 px-4 border-b border-line mb-5">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-4 gap-y-2 py-2">
          <div className="flex gap-1 -mb-px" role="group" aria-label="Competition">
            {AFFILIATION_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
                className={`press px-2 min-h-[44px] text-[13px] font-medium border-b-2 whitespace-nowrap ${
                  tab === t ? 'border-navy text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center w-full sm:w-auto sm:max-w-[220px] bg-white border border-line rounded-md px-2 focus-within:border-navy transition-colors">
            <Search size={12} className="text-faint flex-shrink-0" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search college name"
              placeholder="Search college name"
              className="flex-1 min-w-0 bg-transparent px-1.5 py-2.5 sm:py-1.5 text-[16px] sm:text-[12px] outline-none placeholder:text-faint"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)} aria-label="Filter by tier"
              className="bg-white border border-line rounded-md px-2 py-2.5 sm:py-1.5 text-[16px] sm:text-[12px] text-muted outline-none cursor-pointer hover:border-navy/40">
              <option value="all">All tiers</option>
              {TIER_ORDER.map((t) => <option key={t} value={t}>{TIER_LABELS[t]}{t === 'championship' ? ' (strongest)' : ''}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)} aria-label="Filter by varsity or club"
              className="bg-white border border-line rounded-md px-2 py-2.5 sm:py-1.5 text-[16px] sm:text-[12px] text-muted outline-none cursor-pointer hover:border-navy/40">
              <option value="all">All types</option>
              <option value="Varsity">Varsity</option>
              <option value="Club">Club</option>
              <option value="unconfirmed">Type not confirmed</option>
            </select>
          </div>
          <span className="text-[12px] text-muted sm:ml-auto" aria-live="polite">{plural(filtered.length, 'result', 'results')}</span>
        </div>
      </div>

      {hiddenUnconfirmed > 0 && (
        <p className="text-[13px] text-muted mb-4">
          {plural(hiddenUnconfirmed, 'program has', 'programs have')} no confirmed varsity or club status, so {hiddenUnconfirmed === 1 ? "it isn't" : "they aren't"} shown.{' '}
          <button type="button" onClick={() => setTypeFilter('unconfirmed')} className="text-navy font-semibold">Show {hiddenUnconfirmed === 1 ? 'it' : 'them'}</button>
        </p>
      )}

      {grouped.length === 0 ? (
        <div className="py-16">
          <p className="text-ink text-[15px] mb-1">No programs match{search.trim() ? ` "${search.trim()}"` : ' those filters'}.</p>
          <p className="text-muted text-[14px] mb-3">Try a shorter name, such as "Navy" or "Penn State", or clear the filters.</p>
          <button onClick={clearAll} className="text-navy text-[13px] font-semibold hover:text-navy-deep min-h-[44px]">Clear all</button>
        </div>
      ) : (
        <>
          <p className="text-[15px] text-ink mb-1">
            {filtersOn ? `${filtered.length} of ${colleges.length} Division I programs.` : `${colleges.length} Division I programs. Same division, very different standard.`}
          </p>
          <p className="text-[14px] text-muted mb-2">This list is men's rugby. Women's programs aren't up yet.</p>
          {grouped.filter((g) => g.tier === 'championship').map(({ tier, items }) => (
            <section key={tier} className="mt-8 grid md:grid-cols-[14rem_1fr] gap-4 md:gap-10 border-t border-line pt-8 min-w-0">
              <TierHeading tier={tier} count={items.length} />
              <PhotoGrid items={items} />
            </section>
          ))}
          {grouped.filter((g) => g.tier !== 'championship').map(({ tier, items }) => (
            <section key={tier} className="mt-8 grid md:grid-cols-[14rem_1fr] gap-4 md:gap-10 border-t border-line pt-8 min-w-0">
              <TierHeading tier={tier} count={items.length} />
              <ProgramList items={items} />
            </section>
          ))}
        </>
      )}
      </>
      )}
    </div>
  );
}
