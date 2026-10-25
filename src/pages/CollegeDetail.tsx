import { useRoute, Link } from 'wouter';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { useColleges } from '@/lib/useColleges';
import { usePageMeta, useNoindex } from '@/lib/usePageMeta';
import { CONTACT_EMAIL } from '@/config';
import { TIER_LABELS } from '@/data/colleges';
import TierDot from '@/components/TierDot';
import { climateFromTemps, mlrSummary, weatherSentence } from '@/lib/search/display';
import CoachEmailUnlock from '@/components/CoachEmailUnlock';
import CollegeFactsSection from '@/components/search/CollegeFactsSection';

export default function CollegeDetail() {
  const [, params] = useRoute('/colleges/:slug');
  const { colleges } = useColleges();
  const college = colleges.find((c) => c.slug === params?.slug);

  usePageMeta(
    college ? `${college.name} Rugby` : 'College Not Found',
    college ? `${college.name} rugby — ${college.affiliation}, ${college.conference}. Coach contact, program details, and how to get recruited.` : undefined
  );
  // Unknown or retired slug: keep this "not found" page out of search engines.
  useNoindex(!college);

  if (!college) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 text-center">
        <h1 className="font-heading text-[28px] text-ink mb-4">College not found</h1>
        <Link href="/colleges" className="text-navy font-semibold text-[13px]">← All colleges</Link>
      </div>
    );
  }

  const others = colleges.filter((c) => c.slug !== college.slug && c.tier === college.tier).slice(0, 3);
  const mlr = mlrSummary(college);

  const programFacts: [string, string][] = [
    ['Affiliation', college.affiliation],
    ['Conference', college.conference],
    ['Tier', TIER_LABELS[college.tier]],
    ['Program type', college.programType],
    ['Squad size', college.playerCount > 0 ? `~${college.playerCount} players` : 'TBC'],
    ['Drafted (2020–26)', mlr.draftedText],
    ['Played at least one MLR match', mlr.playedText],
    ...(mlr.unconfirmed > 0 ? [['Not confirmed either way', mlr.unconfirmedText] as [string, string]] : []),
  ];
  const collegeFacts: [string, string][] = [
    ['Location', college.location],
    ['State', college.state],
    ['Region', college.region],
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 md:py-12">
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

      <figure className="mb-10 -mx-5 md:mx-0">
        <div className="overflow-hidden relative bg-line md:rounded-lg">
          {college.imageUrl ? (
            <img key={college.slug} src={college.imageUrl} alt={`${college.name} campus`} className="w-full h-[240px] md:h-[420px] object-cover" />
          ) : (
            <div className="w-full h-[220px] flex items-center justify-center">
              <span className="text-[13px] text-faint">{college.name}</span>
            </div>
          )}
          {college.badges.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/80 to-transparent pt-12 pb-4 px-5">
              <p className="text-white text-[13px] font-medium">{college.badges.join('  ·  ')}</p>
            </div>
          )}
        </div>
        {college.imageCredit && (
          <figcaption className="text-[11px] text-faint mt-2">
            {college.imageSourcePage ? (
              <a href={college.imageSourcePage} target="_blank" rel="noopener noreferrer" className="hover:text-muted transition-colors">
                {college.imageCredit}
              </a>
            ) : (
              college.imageCredit
            )}
          </figcaption>
        )}
      </figure>

      <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
        <div className="lg:col-span-3 space-y-12">
          <section>
            <p className="text-[17px] text-ink leading-[1.7]">{college.description}</p>
          </section>

          {college.achievements.length > 0 && (
            <section>
              <h2 className="font-heading text-[28px] text-ink mb-2">Honors</h2>
              <ul className="border-t border-ink">
                {college.achievements.map((a, i) => (
                  <li key={i} className="py-3 border-b border-line text-[15px] text-ink">{a}</li>
                ))}
              </ul>
            </section>
          )}

          {college.popularMajors.length > 0 && (
            <p className="text-[15px] text-muted leading-relaxed">
              <span className="text-ink font-medium">Popular majors: </span>
              {college.popularMajors.join(', ')}
            </p>
          )}

          <CollegeFactsSection slug={college.slug} />

          {college.monthlyTemps.length === 12 && (
            <section>
              <h2 className="font-heading text-[28px] text-ink mb-1.5">Weather</h2>
              <p className="text-[14px] text-muted mb-5">{weatherSentence(climateFromTemps(college.monthlyTemps) ?? { winter_avg_computed_f: null, summer_high_f: null })}</p>
              <div className="overflow-x-auto -mx-1 px-1">
                <table className="w-full text-[12px] border-t border-line">
                  <thead>
                    <tr className="text-faint">
                      <th className="text-left font-medium py-2.5 pr-3">Month</th>
                      {college.monthlyTemps.map((t) => <th key={t.month} className="font-medium py-2.5 px-1.5 text-center">{t.month}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-line">
                      <td className="text-muted py-2.5 pr-3">High</td>
                      {college.monthlyTemps.map((t) => (
                        <td key={t.month} className="py-2.5 px-1.5 text-center">
                          <span className="text-ink font-semibold">{t.hC}°</span>
                          <span className="block text-faint text-[10px]">{t.hF}°F</span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-line">
                      <td className="text-muted py-2.5 pr-3">Low</td>
                      {college.monthlyTemps.map((t) => (
                        <td key={t.month} className="py-2.5 px-1.5 text-center">
                          <span className="text-ink font-semibold">{t.lC}°</span>
                          <span className="block text-faint text-[10px]">{t.lF}°F</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-faint mt-2.5">Average high / low. °C shown large, °F below. NOAA 1991–2020 normals, nearest full weather station.</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <h2 className="font-heading text-[22px] text-ink mb-3">At a glance</h2>
            <dl className="border-t border-ink">
              {programFacts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2.5 border-b border-line text-[13px]">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium text-ink text-right">
                    {label === 'Tier' ? <span className="inline-flex items-center gap-1.5"><TierDot tier={college.tier} size="sm" />{value}</span> : value}
                  </dd>
                </div>
              ))}
              {collegeFacts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2.5 border-b border-line text-[13px]">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium text-ink text-right">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[12px] text-faint leading-relaxed">
              Program type is our best reading of each school's own pages and could be wrong.{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Correction: ${college.name}`)}&body=${encodeURIComponent(`I spotted something on https://rugbycampus.org/colleges/${college.slug}:\n\n`)}`}
                className="text-navy font-medium"
              >
                Tell us
              </a>
              .
            </p>
            {mlr.drafted > 0 && (
              <div className="mt-3 space-y-2 text-[12px] text-muted leading-relaxed">
                {mlr.breakdown && <p>{mlr.breakdown}</p>}
                {college.mlrNote && <p>{college.mlrNote}</p>}
                <p>{mlr.explainer}</p>
                <p className="text-faint">{mlr.sources}</p>
              </div>
            )}
            <div className="mt-6">
              <CoachEmailUnlock coachName={college.coachName} coachEmail={college.coachEmail} />
            </div>
            {college.recruitmentFormUrl && (
              <p className="mt-2 text-[13px]">
                <a href={college.recruitmentFormUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy font-medium">
                  Recruitment form <ExternalLink size={13} />
                </a>
              </p>
            )}
            <p className="mt-5 text-[13px]">
              <a href={college.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy font-medium">
                University website <ExternalLink size={13} />
              </a>
            </p>
            {college.rugbyProgramUrl && (
              <p className="mt-2 text-[13px]">
                <a href={college.rugbyProgramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy font-medium">
                  Rugby program <ExternalLink size={13} />
                </a>
              </p>
            )}
            <p className="mt-4 text-[13px]">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Correction: ${college.name}`)}&body=${encodeURIComponent(`I spotted something on https://rugbycampus.org/colleges/${college.slug}:\n\n`)}`}
                className="text-navy font-medium"
              >
                Spot something wrong? Tell us
              </a>
            </p>
            <p className="text-[13px] text-muted leading-relaxed pt-2">
              Thinking about this program?{' '}
              <Link href="/learn/best-rugby-colleges-usa" className="text-navy font-medium hover:text-navy-deep">
                Read the guide
              </Link>{' '}
              or <Link href="/map" className="text-navy font-medium hover:text-navy-deep">explore the map</Link>.
            </p>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-20 pt-12 border-t border-line">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading text-[24px] text-ink">More programs in the “{TIER_LABELS[college.tier]}” tier</h2>
            <Link href="/colleges" className="text-[13px] font-semibold text-navy hover:text-navy-deep mb-1">View all</Link>
          </div>
          <ul className="border-t border-ink">
            {others.map((c) => (
              <li key={c.slug} className="border-b border-line">
                <Link href={`/colleges/${c.slug}`} className="flex justify-between gap-4 py-3 text-[15px] hover:text-navy">
                  <span className="text-ink">{c.name}</span>
                  <span className="text-muted text-[13px]">{c.location}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
