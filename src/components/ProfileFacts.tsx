import type { College } from '@/data/colleges';
import factsFile from '@/data/collegeSearchFacts.json';
import type { CollegeFacts, FactsFile } from '@/lib/search/facts';
import { costText } from '@/lib/search/cost';

const FACTS = (factsFile as unknown as FactsFile).colleges;

/** Service academies require U.S. citizenship. Don't guess this for anyone else. */
const NO_INTERNATIONALS = new Set([
  'united-states-naval-academy',
  'united-states-military-academy-army',
  'united-states-air-force-academy',
]);

function costLine(slug: string): string {
  const f = FACTS[slug] as CollegeFacts | undefined;
  if (!f) return 'Not confirmed';
  const cost = costText(f);
  if (f.cost_basis === 'service_academy') return cost.headline;
  if (cost.askCoach) return 'Not confirmed';
  return cost.headline;
}

function admitLine(slug: string): string {
  const rate = (FACTS[slug] as CollegeFacts | undefined)?.acceptance_rate;
  if (rate == null) return 'Not confirmed';
  return `${rate}% admitted`;
}

/** The same six rows on every profile. A blank is "Not confirmed". */
export default function ProfileFacts({ college }: { college: College }) {
  const kind = college.programType === 'Varsity' || college.programType === 'Club' ? college.programType : 'Not confirmed';
  const rows: [string, string][] = [
    ['Season', college.season?.trim() || 'Not confirmed'],
    ['Varsity or club', kind],
    ['International players', NO_INTERNATIONALS.has(college.slug) ? 'No' : 'Not confirmed'],
    ['Cost', costLine(college.slug)],
    ['How hard to get in', admitLine(college.slug)],
    ['Coach', college.coachName?.trim() || 'TBC'],
  ];
  return (
    <section aria-label="Key facts">
      <dl className="border-t border-ink">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-6 py-2.5 border-b border-line text-[14px] min-w-0">
            <dt className="text-muted shrink-0">{label}</dt>
            <dd className="font-medium text-ink sm:text-right break-words">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[13px] text-muted leading-relaxed">Email coaches in the off-season. University application deadlines are separate.</p>
    </section>
  );
}
