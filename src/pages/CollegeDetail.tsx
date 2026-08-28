import { useRoute, Link } from 'wouter';
import { MapPin, Users, ExternalLink, ArrowLeft, Trophy, Building, Shirt, GraduationCap } from 'lucide-react';
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
    college ? `${college.name} rugby program — ${college.affiliation}, ${college.conference} conference. Coach contact, campus details, weather, and how to get recruited.` : undefined
  );

  if (!college) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 text-center">
        <h1 className="font-heading font-bold text-2xl text-dark mb-4">College not found</h1>
        <Link href="/colleges" className="text-navy font-semibold text-sm hover:underline">← Back to all colleges</Link>
      </div>
    );
  }

  const others = colleges.filter((c) => c.id !== college.id && c.tier === college.tier).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 md:py-12">
      <Link href="/colleges" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors mb-6">
        <ArrowLeft size={14} /> All colleges
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 300 }}>
        <img src={college.imageUrl} alt={`${college.name} campus`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-white/95 text-dark px-3 py-1 rounded-lg text-xs font-bold">{college.affiliation}</span>
            <span className="bg-white/20 backdrop-blur-sm text-white border border-white/20 px-3 py-1 rounded-lg text-xs font-semibold">{TIER_LABELS[college.tier]}</span>
            {college.badges.map((b) => (
              <span key={b} className="inline-flex items-center gap-1 bg-gold text-navy px-3 py-1 rounded-lg text-xs font-bold">
                <Trophy size={11} /> {b}
              </span>
            ))}
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-white mb-1">{college.name}</h1>
          <div className="flex items-center gap-1.5 text-white/70 text-sm">
            <MapPin size={14} /><span>{college.location}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="font-heading font-bold text-lg text-dark mb-3">About the program</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{college.description}</p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-lg text-dark mb-4">Rugby program</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Trophy, label: 'Affiliation', value: college.affiliation },
                { icon: Building, label: 'Conference', value: college.conference },
                { icon: Shirt, label: 'Program type', value: college.programType },
                { icon: Users, label: 'Squad size', value: college.playerCount > 0 ? `~${college.playerCount} players` : 'TBC' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon size={14} className="text-navy" />
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-dark">{item.value}</span>
                </div>
              ))}
            </div>
            {college.draftPicks > 0 && (
              <div className="mt-4 flex items-start gap-3 bg-gold/8 border border-gold/20 rounded-xl p-4">
                <Trophy size={16} className="text-gold-dark mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong className="text-dark">{college.draftPicks} MLR College Draft {college.draftPicks === 1 ? 'pick' : 'picks'}</strong>
                  <span className="text-gray-500"> — a track record of producing professional-level players.</span>
                </p>
              </div>
            )}
          </section>

          {college.achievements.length > 0 && (
            <section>
              <h2 className="font-heading font-bold text-lg text-dark mb-3">Recent achievements</h2>
              <ul className="space-y-2">
                {college.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />{a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-heading font-bold text-lg text-dark mb-4">The college</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap size={14} className="text-navy" />
                  <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Enrollment</span>
                </div>
                <span className="text-sm font-semibold text-dark">{college.enrollment.toLocaleString()} students</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-navy" />
                  <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Location</span>
                </div>
                <span className="text-sm font-semibold text-dark">{college.location}</span>
              </div>
            </div>
            {college.popularMajors.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2.5">Popular majors</p>
                <div className="flex flex-wrap gap-2">
                  {college.popularMajors.map((m) => (
                    <span key={m} className="bg-navy/5 text-navy px-3 py-1.5 rounded-lg text-xs font-medium">{m}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Weather */}
          {college.monthlyTemps.length === 12 && (
            <section>
              <h2 className="font-heading font-bold text-lg text-dark mb-1">Weather</h2>
              <p className="text-sm text-gray-500 mb-4">{college.weatherSummary}</p>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400">
                        <th className="text-left font-medium px-3 py-2.5">Month</th>
                        {college.monthlyTemps.map((t) => <th key={t.month} className="font-medium px-2 py-2.5 text-center">{t.month}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-100">
                        <td className="text-left text-gray-500 font-medium px-3 py-2.5">High</td>
                        {college.monthlyTemps.map((t) => (
                          <td key={t.month} className="px-2 py-2.5 text-center">
                            <div className="text-dark font-semibold">{t.hC}°</div>
                            <div className="text-gray-300 text-[10px]">{t.hF}°F</div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="text-left text-gray-500 font-medium px-3 py-2.5">Low</td>
                        {college.monthlyTemps.map((t) => (
                          <td key={t.month} className="px-2 py-2.5 text-center">
                            <div className="text-dark font-semibold">{t.lC}°</div>
                            <div className="text-gray-300 text-[10px]">{t.lF}°F</div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-[11px] text-gray-300 mt-2">Average high / low. °C shown large, °F below.</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CoachEmailUnlock coachName={college.coachName} coachEmail={college.coachEmail} />
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="font-heading font-semibold text-sm text-dark mb-4">Quick facts</h3>
            <dl className="space-y-3">
              {[
                ['Affiliation', college.affiliation],
                ['Conference', college.conference],
                ['Tier', TIER_LABELS[college.tier]],
                ['Program', college.programType],
                ['Enrollment', college.enrollment.toLocaleString()],
                ['State', college.state],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm gap-4">
                  <dt className="text-gray-400 flex-shrink-0">{label}</dt>
                  <dd className="font-medium text-dark text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <a href={college.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-all">
            University website <ExternalLink size={14} />
          </a>
          <div className="bg-navy/5 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-600 mb-2">Interested in this program?</p>
            <Link href="/learn/how-college-rugby-recruitment-works" className="text-navy text-sm font-semibold hover:underline">
              Learn how recruitment works →
            </Link>
          </div>
        </div>
      </div>

      {/* More in tier */}
      {others.length > 0 && (
        <section className="mt-16 pt-12 border-t border-gray-100">
          <div className="flex items-center justify-between mb-7">
            <h2 className="font-heading font-bold text-xl text-dark">More {TIER_LABELS[college.tier].toLowerCase()}s</h2>
            <Link href="/colleges" className="text-sm font-semibold text-navy hover:text-navy/80">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {others.map((c) => <CollegeCard key={c.id} college={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
