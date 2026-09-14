import { useRoute, Link } from 'wouter';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta } from '@/lib/usePageMeta';
import { TIER_LABELS } from '@/data/colleges';
import CoachEmailUnlock from '@/components/CoachEmailUnlock';
import CollegeCard from '@/components/CollegeCard';

export default function CollegeDetail() {
  const [, params] = useRoute('/colleges/:slug');
  const { colleges } = useColleges();
  const college = colleges.find((c) => c.slug === params?.slug);

  usePageMeta(
    college ? `${college.name} Rugby` : 'College Not Found',
    college ? `${college.name} rugby — ${college.affiliation}, ${college.conference}. Coach contact, program details, and how to get recruited.` : undefined
  );

  if (!college) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 text-center">
        <h1 className="font-heading text-[28px] text-ink mb-4">College not found</h1>
        <Link href="/colleges" className="text-navy font-semibold text-[13px]">← All colleges</Link>
      </div>
    );
  }

  const others = colleges.filter((c) => c.id !== college.id && c.tier === college.tier).slice(0, 3);

  const programFacts: [string, string][] = [
    ['Affiliation', college.affiliation],
    ['Conference', college.conference],
    ['Tier', TIER_LABELS[college.tier]],
    ['Program type', college.programType],
    ['Squad size', college.playerCount > 0 ? `~${college.playerCount} players` : 'TBC'],
    ['MLR draft picks', college.draftPicks > 0 ? String(college.draftPicks) : '—'],
  ];
  const collegeFacts: [string, string][] = [
    ['Enrollment', `${college.enrollment.toLocaleString()} students`],
    ['Location', college.location],
    ['State', college.state],
    ['Region', college.region],
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 md:py-12 min-w-0">
      <Link href="/colleges" className="inline-flex items-center gap-1.5 text-[13px] text-faint hover:text-navy transition-colors mb-8">
        <ArrowLeft size={14} /> All colleges
      </Link>

      {/* Header: editorial, text-led */}
      <header className="mb-8 max-w-3xl">
        <p className="kicker mb-3">
          {college.affiliation} · {college.conference} · {TIER_LABELS[college.tier]}
        </p>
        <h1 className="font-heading text-[36px] md:text-[46px] leading-[1.05] text-ink mb-3">{college.name}</h1>
        <p className="text-muted text-[15px]">{college.location}</p>
      </header>

      <div className="rounded-lg overflow-hidden mb-12 relative" style={{ maxHeight: 380 }}>
        <img src={college.imageUrl} alt={`${college.name} campus`} className="w-full h-full object-cover" style={{ maxHeight: 380 }} />
        {college.badges.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/80 to-transparent pt-12 pb-4 px-5">
            <p className="text-white text-[13px] font-medium">{college.badges.join('  ·  ')}</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-12 min-w-0">
        <div className="lg:col-span-7 space-y-12 min-w-0">
          <section>
            <h2 className="font-heading text-[24px] text-ink mb-4">About the program</h2>
            <p className="text-[15px] text-ink/80 leading-[1.7]">{college.description}</p>
          </section>

          <section>
            <h2 className="font-heading text-[24px] text-ink mb-2">The rugby</h2>
            <dl>
              {programFacts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-3 border-b border-line text-[14px]">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium text-ink text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {college.achievements.length > 0 && (
              <ul className="mt-5 space-y-2">
                {college.achievements.map((a, i) => (
                  <li key={i} className="text-[14px] text-ink/80 leading-relaxed pl-4 relative">
                    <span className="absolute left-0 top-[9px] w-1.5 h-1.5 rounded-full bg-gold" />
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-heading text-[24px] text-ink mb-2">The college</h2>
            <dl>
              {collegeFacts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-3 border-b border-line text-[14px]">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium text-ink text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {college.popularMajors.length > 0 && (
              <p className="mt-4 text-[14px] text-muted leading-relaxed">
                <span className="text-ink font-medium">Popular majors: </span>
                {college.popularMajors.join(', ')}
              </p>
            )}
          </section>

          {college.monthlyTemps.length === 12 && (
            <section className="min-w-0">
              <h2 className="font-heading text-[24px] text-ink mb-1.5">Weather</h2>
              <p className="text-[14px] text-muted mb-5">{college.weatherSummary}</p>
              <div className="overflow-x-auto max-w-full overscroll-x-contain">
                <table className="w-full min-w-[32rem] text-[11px] sm:text-[12px] border-t border-line">
                  <thead>
                    <tr className="text-faint">
                      <th className="text-left font-medium py-2.5 pr-2 sticky left-0 bg-white z-[1]">Month</th>
                      {college.monthlyTemps.map((t) => <th key={t.month} className="font-medium py-2.5 px-1 text-center">{t.month}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-line">
                      <td className="text-muted py-2.5 pr-2 sticky left-0 bg-white z-[1]">High</td>
                      {college.monthlyTemps.map((t) => (
                        <td key={t.month} className="py-2.5 px-1 text-center">
                          <span className="text-ink font-semibold">{t.hC}°</span>
                          <span className="block text-faint text-[10px]">{t.hF}°F</span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-line">
                      <td className="text-muted py-2.5 pr-2 sticky left-0 bg-white z-[1]">Low</td>
                      {college.monthlyTemps.map((t) => (
                        <td key={t.month} className="py-2.5 px-1 text-center">
                          <span className="text-ink font-semibold">{t.lC}°</span>
                          <span className="block text-faint text-[10px]">{t.lF}°F</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-faint mt-2.5">Average high / low. °C shown large, °F below.</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-5 lg:pl-4">
          <div className="lg:sticky lg:top-24 space-y-5">
            <CoachEmailUnlock coachName={college.coachName} coachEmail={college.coachEmail} />
            <a href={college.website} target="_blank" rel="noopener noreferrer"
              className="btn flex items-center justify-center gap-2 w-full py-3 border border-line text-ink rounded-md text-[13px] font-semibold hover:border-navy/40">
              University website <ExternalLink size={13} />
            </a>
            <p className="text-[13px] text-muted leading-relaxed pt-2">
              Thinking about this program?{' '}
              <Link href="/learn/how-college-rugby-recruitment-works" className="text-navy font-medium hover:text-navy-deep">
                Read how recruitment works
              </Link>{' '}
              — or <Link href="/work-with-me" className="text-navy font-medium hover:text-navy-deep">work with me directly</Link>.
            </p>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-20 pt-12 border-t border-line">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading text-[24px] text-ink">More {TIER_LABELS[college.tier].toLowerCase()}s</h2>
            <Link href="/colleges" className="text-[13px] font-semibold text-navy hover:text-navy-deep mb-1">View all</Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
            {others.map((c) => <CollegeCard key={c.id} college={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
