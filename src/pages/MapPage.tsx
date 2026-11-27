import { useState, useMemo, useEffect } from 'react';
import { readParam, writeParams } from '@/lib/search/urlState';
import { useLocation, Link } from 'wouter';
import { List } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import LeafletMap from '@/components/LeafletMap';
import { TIER_LABELS, TIER_ORDER } from '@/data/colleges';
import TierDot from '@/components/TierDot';
import TierNote from '@/components/TierNote';

const TABS = ['All', 'CRAA D1A', 'NCR D1'] as const;

export default function MapPage() {
  const [, navigate] = useLocation();
  const { colleges } = useColleges();
  usePageMeta('Interactive US College Rugby Map', `${colleges.length} US college rugby programs on an interactive map. Zoom to the town, click a pin for the full profile, coach contact and campus details.`);
  const [tab, setTab] = useState<(typeof TABS)[number]>(() => ((TABS as readonly string[]).includes(readParam('tab')) ? readParam('tab') as (typeof TABS)[number] : 'All'));
  useEffect(() => { writeParams({ tab: tab === 'All' ? null : tab }); }, [tab]);

  const filtered = useMemo(
    () => (tab === 'All' ? colleges : colleges.filter((c) =>
      (tab === 'CRAA D1A' && c.affiliation.includes('CRAA')) ||
      (tab === 'NCR D1' && c.affiliation.includes('NCR'))
    )),
    [colleges, tab]
  );

  return (
    <div>
      {/* Tight header bar */}
      <div className="border-b border-line bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2 md:py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 min-w-0">
            <div className="min-w-0">
              <h1 className="font-heading text-[20px] md:text-[24px] text-ink">Map</h1>
              <p className="hidden sm:block text-[12px] text-muted">These are programs worth a look, not every college with a team.</p>
            </div>
            <div className="flex gap-1 order-last sm:order-none w-full sm:w-auto" role="group" aria-label="Competition">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
                  className={`press px-2 min-h-[44px] text-[13px] font-medium border-b-2 whitespace-nowrap ${
                    tab === t ? 'border-navy text-ink' : 'border-transparent text-muted hover:text-ink'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-muted whitespace-nowrap tabular-nums"><span className="font-semibold text-ink">{filtered.length}</span> programs</span>
            <Link href="/colleges" className="btn inline-flex items-center gap-1.5 bg-white border border-line text-ink px-3 py-1.5 min-h-[44px] rounded-md text-[12px] font-medium hover:border-navy/30">
              <List size={14} /> List
            </Link>
          </div>
        </div>
      </div>

      {/* Map with explicit height. isolate keeps Leaflet's z-indexes below the fixed nav and mobile menu. */}
      <div className="relative isolate z-0">
        <LeafletMap colleges={filtered} onSelect={(slug) => navigate(`/colleges/${slug}`)} height="calc(100vh - 150px)" />
        <div className="absolute bottom-4 left-4 bg-white rounded-md border border-line px-3 py-2 max-w-[280px]" style={{ zIndex: 500 }}>
          <div className="space-y-1">
            {TIER_ORDER.map((tier) => (
              <div key={tier} className="flex items-center gap-2 text-[11px] text-muted">
                <TierDot tier={tier} /> {TIER_LABELS[tier]}{tier === 'championship' ? ' (strongest)' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-2 border-t border-line">
        <TierNote className="max-w-7xl mx-auto" />
      </div>

    </div>
  );
}
