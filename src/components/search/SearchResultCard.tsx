import type { College } from '@/data/colleges';
import CollegeCard from '@/components/CollegeCard';
import Pill from './Pill';
import type { Result } from '@/lib/search/match';
import type { CollegeFacts } from '@/lib/search/facts';
import { costText } from '@/lib/search/cost';
import { isVeryHot, VERY_HOT_LABEL } from '@/lib/search/display';
import type { Filters } from '@/lib/search/filters';

export default function SearchResultCard({ college, facts, result, filters, selected, onToggle }: {
  college: College; facts: CollegeFacts; result: Result | null; filters: Filters; selected: boolean; onToggle: () => void;
}) {
  const cost = costText(facts, filters.residency, filters.home_state);
  const checks = result ? [...result.checks].sort((a, b) => ({ miss: 0, unknown: 1, match: 2 }[a.status] - { miss: 0, unknown: 1, match: 2 }[b.status])) : [];
  return (
    <div className="flex flex-col">
      <CollegeCard college={college} variant="tool" />
      <div className="px-1 pt-2 space-y-1.5">
        {checks.length > 0 && <div className="flex flex-wrap gap-1">{checks.map((c, i) => <Pill key={c.key + i} check={c} />)}</div>}
        {filters.climate.includes('warm_winters') && isVeryHot(facts) && <p className="text-[12px] text-muted">{VERY_HOT_LABEL}</p>}
        <p className="text-[12px] text-ink leading-snug">
          <span className="font-medium">{cost.headline}</span>
          {!cost.askCoach && <span className="block text-[11px] text-muted">{cost.sub}</span>}
          {cost.askCoach && <span className="block text-[11px] text-muted">Ask the coach what it costs.</span>}
        </p>
        {facts.intl_warning && <p className="text-[12px] text-muted">⚠︎ {facts.intl_warning}</p>}
        <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none">
          <input type="checkbox" checked={selected} onChange={onToggle} className="accent-navy" /> Add to my shortlist
        </label>
      </div>
    </div>
  );
}
