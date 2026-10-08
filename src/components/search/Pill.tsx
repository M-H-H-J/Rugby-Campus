import type { Check } from '@/lib/search/match';

const STYLE = {
  match: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  miss: 'bg-amber-50 text-amber-900 border-amber-200',
  unknown: 'bg-gray-100 text-gray-600 border-gray-200',
} as const;
const MARK = { match: '✓', miss: '✗', unknown: '?' } as const;

export default function Pill({ check }: { check: Check }) {
  return (
    <span title={check.detail ?? ''} className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-[11px] leading-tight ${STYLE[check.status]}`}>
      <span aria-hidden>{MARK[check.status]}</span>
      <span className="sr-only">{check.status === 'match' ? 'Fits: ' : check.status === 'miss' ? 'Does not fit: ' : 'Unverified: '}</span>
      {check.label}
    </span>
  );
}
