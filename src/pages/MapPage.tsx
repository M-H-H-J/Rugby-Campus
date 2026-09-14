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
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
        <div>
          <p className="kicker mb-2">The map</p>
          <h1 className="font-heading text-[34px] md:text-[40px] leading-tight text-ink mb-2">Where the rugby is</h1>
          <p className="text-muted text-[14px]">Zoom right down to the town. Click a pin for the full profile.</p>
        </div>
        <div className="flex gap-6 border-b border-line sm:border-0">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-2.5 text-[13.5px] font-medium border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-navy text-ink' : 'border-transparent text-faint hover:text-muted'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-line overflow-hidden relative max-w-full" style={{ zIndex: 0 }}>
        <LeafletMap colleges={filtered} onSelect={(slug) => navigate(`/colleges/${slug}`)} height="min(580px, 70vh)" />
        <div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:bottom-6 sm:left-4 bg-white rounded-md border border-line px-3 py-2.5 sm:px-4 sm:py-3 max-w-[calc(100%-1.5rem)] sm:max-w-none" style={{ zIndex: 500 }}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" /> Championship contender
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <span className="w-2 h-2 rounded-full bg-navy flex-shrink-0" /> Top-40 program
            </div>
          </div>
        </div>
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white rounded-md border border-line px-3 py-2" style={{ zIndex: 500 }}>
          <span className="text-[13px] font-semibold text-ink">{filtered.length}</span>
          <span className="text-[13px] text-faint ml-1.5">programs</span>
        </div>
      </div>

      <p className="text-[12px] text-faint mt-4">Map © OpenStreetMap contributors</p>
    </div>
  );
}
