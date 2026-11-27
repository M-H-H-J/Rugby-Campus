import type { College } from '@/data/colleges';
import factsFile from '@/data/collegeSearchFacts.json';
import type { CollegeFacts, FactsFile } from '@/lib/search/facts';
import { costText } from '@/lib/search/cost';
import { INTL_SHORT } from '@/lib/search/match';

const FACTS = (factsFile as unknown as FactsFile).colleges;

function costLine(f: CollegeFacts | undefined): string | null {
  if (!f) return null;
  const cost = costText(f);
  return cost.askCoach ? null : cost.headline;
}

function admitLine(f: CollegeFacts | undefined): string | null {
  const rate = f?.acceptance_rate;
  return rate == null ? null : `${Math.round(rate)}% admitted`;
}

function internationalLine(f: CollegeFacts | undefined): string | null {
  const route = f?.intl_admission_route;
  return route === 'nomination_only' || route === 'service_academy' ? INTL_SHORT.replace('Internationals: only', 'Only') : null;
}

/** Key facts at the top of a profile. A fact we haven't confirmed is left out, not shown as a placeholder.
 *  The coach is shown once, in the coach block straight after these rows. */
export function profileFactRows(college: College): [string, string][] {
  const f = FACTS[college.slug] as CollegeFacts | undefined;
  const kind = college.programType === 'Varsity' || college.programType === 'Club' ? college.programType : null;
  const rows: [string, string | null][] = [
    ['Season', college.season?.trim() || null],
    ['Varsity or club', kind],
    ['International players', internationalLine(f)],
    ['Cost', costLine(f)],
    ['How hard to get in', admitLine(f)],
  ];
  return rows.filter((r): r is [string, string] => !!r[1]);
}

export default function ProfileFacts({ college }: { college: College }) {
  const rows = profileFactRows(college);
  return (
    <section aria-label="Key facts">
      {rows.length > 0 && (
        <dl className="border-t border-ink tabular-nums">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-6 py-2.5 border-b border-line text-[14px] min-w-0">
              <dt className="text-muted shrink-0">{label}</dt>
              <dd className="font-medium text-ink sm:text-right break-words">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-3 text-[13px] text-muted leading-relaxed">Email coaches in the off-season. University application deadlines are separate.</p>
    </section>
  );
}
