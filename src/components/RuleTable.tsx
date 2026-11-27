import type { ReactNode } from 'react';

/** A rule-separated table (no filled cells or boxes). The first cell of each row is its header. Scrolls sideways on phones. */
export default function RuleTable({ header, rows, label }: { header: string[]; rows: ReactNode[][]; label: string }) {
  return (
    <div className="my-7 overflow-x-auto" tabIndex={0} role="region" aria-label={label}>
      <table className="w-full min-w-[540px] border-collapse text-left font-body text-[14px] leading-snug">
        <thead>
          <tr className="border-b border-ink">
            {header.map((h, j) => <th key={j} scope="col" className="py-2.5 pr-4 align-bottom text-[11px] font-semibold uppercase tracking-caps text-muted">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, j) => (
            <tr key={j} className="border-b border-line">
              {r.map((c, k) => k === 0
                ? <th key={k} scope="row" className="py-3 pr-4 align-top font-semibold text-ink">{c}</th>
                : <td key={k} className="py-3 pr-4 align-top text-ink/85">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
