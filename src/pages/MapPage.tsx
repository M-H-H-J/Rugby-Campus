import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import LeafletMap from '@/components/LeafletMap';

const navy = '#00458c';
const gold = '#ffb700';
const TABS = ['All', 'CRAA D1A', 'NCR D1'] as const;

export default function MapPage() {
  usePageMeta('Interactive College Map', 'Explore the top 40 US college rugby programs on an interactive map. Zoom to street level, see nearby towns, and open full program profiles.');
  const [, navigate] = useLocation();
  const { colleges } = useColleges();
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');

  const filtered = useMemo(
    () => (tab === 'All' ? colleges : colleges.filter((c) => c.affiliation === tab)),
    [colleges, tab]
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-3xl text-dark mb-2">Interactive college map</h1>
          <p className="text-gray-400 text-sm">Scroll to zoom right down to the town, drag to pan. Click any pin for the full profile.</p>
        </div>
        <div className="flex bg-gray-50 rounded-xl p-1 self-start">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${tab === t ? 'bg-white text-navy shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative" style={{ zIndex: 0 }}>
        <LeafletMap colleges={filtered} onSelect={(slug) => navigate(`/colleges/${slug}`)} height={580} />
        <div className="absolute bottom-6 left-4 bg-white rounded-xl shadow-md border border-gray-100 p-3" style={{ zIndex: 500 }}>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: gold }} /> Championship contender
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: navy }} /> Top-40 program
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-md border border-gray-100 px-4 py-2.5" style={{ zIndex: 500 }}>
          <span className="text-sm font-semibold text-navy">{filtered.length}</span>
          <span className="text-sm text-gray-400 ml-1.5">programs</span>
        </div>
      </div>

      <p className="text-center text-gray-300 text-xs mt-4">Map © OpenStreetMap contributors</p>
    </div>
  );
}
