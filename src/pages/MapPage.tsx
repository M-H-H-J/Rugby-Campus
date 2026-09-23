import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import LeafletMap from '@/components/LeafletMap';

const TABS = ['All', 'CRAA D1A', 'NCR D1'] as const;

export default function MapPage() {
  usePageMeta('Interactive College Map', 'Explore the top 40 US college rugby programs on an interactive map. Zoom to street level and open full program profiles.');
  const [, navigate] = useLocation();
  const { colleges } = useColleges();
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');

  const filtered = useMemo(
    () => (tab === 'All' ? colleges : colleges.filter((c) => c.affiliation === tab)),
    [colleges, tab]
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 md:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h1 className="font-heading text-[26px] md:text-[32px] leading-tight text-ink">Interactive map</h1>
          <p className="text-muted text-[13px] mt-1">Click a pin for the full profile</p>
        </div>
        <div className="flex gap-5 border-b border-line sm:border-0">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-navy text-ink' : 'border-transparent text-faint hover:text-muted'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-line overflow-hidden relative" style={{ zIndex: 0 }}>
        <LeafletMap colleges={filtered} onSelect={(slug) => navigate(`/colleges/${slug}`)} height={600} />
        <div className="absolute bottom-4 left-3 bg-white rounded-md border border-line px-3 py-2.5" style={{ zIndex: 500 }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span className="w-2 h-2 rounded-full bg-gold" /> Championship
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span className="w-2 h-2 rounded-full bg-navy" /> Top-40
            </div>
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-white rounded-md border border-line px-3 py-1.5" style={{ zIndex: 500 }}>
          <span className="text-[12px] font-semibold text-ink">{filtered.length}</span>
          <span className="text-[12px] text-faint ml-1">programs</span>
        </div>
      </div>

      <p className="text-[11px] text-faint mt-3">Map © OpenStreetMap contributors</p>
    </div>
  );
}
