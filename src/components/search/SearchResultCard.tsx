import type { College } from '@/data/colleges';
import CollegeCard from '@/components/CollegeCard';
import Pill from './Pill';
import { INTL_SHORT, type Result } from '@/lib/search/match';
import type { CollegeFacts } from '@/lib/search/facts';
import { costText } from '@/lib/search/cost';
import { isVeryHot, VERY_HOT_DETAIL, VERY_HOT_LABEL } from '@/lib/search/display';
import type { Filters } from '@/lib/search/filters';

export default function SearchResultCard({ college, facts, result, filters, selected, onToggle }: {
  college: College; facts: CollegeFacts; result: Result | null; filters: Filters; selected: boolean; onToggle: () => void;
}) {
  const cost = costText(facts, filters.residency, filters.home_state);
  const checks = result ? [...result.checks].sort((a, b) => ({ miss: 0, unknown: 1, match: 2 }[a.status] - { miss: 0, unknown: 1, match: 2 }[b.status])) : [];
  const has = (key: string) => checks.some((c) => c.key === key);
  const academy = facts.intl_admission_route === 'nomination_only' || facts.intl_admission_route === 'service_academy';
  return (
    <div className="flex flex-col">
      <CollegeCard college={college} variant="tool" />
      <div className="px-1 pt-2 space-y-1.5">
        {checks.length > 0 && <div className="flex flex-wrap gap-1">{checks.map((c, i) => <Pill key={c.key + i} check={c} />)}</div>}
        {filters.climate.includes('warm_winters') && isVeryHot(facts) && <p className="text-[12px] text-muted">{VERY_HOT_LABEL}: {VERY_HOT_DETAIL.charAt(0).toLowerCase() + VERY_HOT_DETAIL.slice(1)}</p>}
        <p className="text-[12px] text-ink leading-snug tabular-nums">
          <span className="font-medium">{cost.headline}</span>
          {!has('max_cost_usd_per_year') && <span className="block text-[11px] text-muted">{cost.askCoach ? 'Ask the coach what it costs.' : cost.sub}</span>}
        </p>
        {academy && !has('international') && <p className="text-[12px] text-muted">{INTL_SHORT}</p>}
        <label className="flex items-center gap-2.5 min-h-[44px] text-[13px] text-ink cursor-pointer select-none">
          <input type="checkbox" checked={selected} onChange={onToggle} className="w-5 h-5 accent-navy" /> Add to my shortlist
        </label>
      </div>
    </div>
  );
}
