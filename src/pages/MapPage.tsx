import { useState, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { List } from 'lucide-react';
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
    () => (tab === 'All' ? colleges : colleges.filter((c) => c.affiliation === tab || c.affiliation === 'Both')),
    [colleges, tab]
  );

  return (
    <div>
      {/* Tight header bar */}
      <div className="border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h1 className="font-heading text-[20px] md:text-[24px] text-ink">Map</h1>
            <div className="flex gap-4">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`text-[13px] font-medium pb-0.5 border-b-2 transition-colors ${
                    tab === t ? 'border-navy text-ink' : 'border-transparent text-faint hover:text-muted'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-muted"><span className="font-semibold text-ink">{filtered.length}</span> programs</span>
            <Link href="/colleges" className="btn inline-flex items-center gap-1.5 bg-white border border-line text-ink px-3 py-1.5 rounded-md text-[12px] font-medium hover:border-navy/30">
              <List size={14} /> List
            </Link>
          </div>
        </div>
      </div>

      {/* Map with explicit height */}
      <div className="relative">
        <LeafletMap colleges={filtered} onSelect={(slug) => navigate(`/colleges/${slug}`)} height="calc(100vh - 120px)" />
        <div className="absolute bottom-4 left-4 bg-white rounded-md border border-line px-3 py-2" style={{ zIndex: 500 }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span className="w-2 h-2 rounded-full bg-gold" /> Top tier
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span className="w-2 h-2 rounded-full bg-navy" /> Top 40
            </div>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="border-t border-line bg-paper px-4 py-2">
        <p className="text-[11px] text-faint">Map © OpenStreetMap contributors</p>
      </div>
    </div>
  );
}
