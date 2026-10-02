import type { College } from '@/data/colleges';
import CollegeCard from '@/components/CollegeCard';
import Pill from './Pill';
import type { Result } from '@/lib/search/match';
import type { CollegeFacts } from '@/lib/search/facts';
import { costText } from '@/lib/search/cost';
import type { Filters } from '@/lib/search/filters';

export default function SearchResultCard({ college, facts, result, filters, selected, onToggle }: {
  college: College; facts: CollegeFacts; result: Result | null; filters: Filters; selected: boolean; onToggle: () => void;
}) {
  const cost = costText(facts, filters.residency, filters.home_state);
  const checks = result ? [...result.checks].sort((a, b) => ({ miss: 0, unknown: 1, match: 2 }[a.status] - { miss: 0, unknown: 1, match: 2 }[b.status])) : [];
  return (
    <div className={`flex flex-col ${result?.closest ? 'opacity-95' : ''}`}>
      <CollegeCard college={college} variant="tool" />
      <div className="px-1 pt-2 space-y-1.5">
        {result?.closest && <p className="text-[11px] font-medium text-amber-900">Closest match: didn't fit everything</p>}
        {checks.length > 0 && <div className="flex flex-wrap gap-1">{checks.map((c, i) => <Pill key={c.key + i} check={c} />)}</div>}
        <p className="text-[12px] text-ink leading-snug">
          <span className="font-medium">{cost.headline}</span>
          {!cost.askCoach && <span className="block text-[11px] text-muted">{cost.sub}</span>}
          {cost.askCoach && <span className="block text-[11px] text-muted">Ask the coach what it costs.</span>}
        </p>
        {facts.intl_warning && <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-2 py-1">{facts.intl_warning}</p>}
        <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none">
          <input type="checkbox" checked={selected} onChange={onToggle} className="accent-[#00458c]" /> Add to my shortlist
        </label>
      </div>
    </div>
  );
}
