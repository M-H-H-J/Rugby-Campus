import { useEffect, useState } from 'react';
import { loadFacts, type CollegeFacts } from '@/lib/search/facts';
import { costText } from '@/lib/search/cost';
import { CAMPUS_FEEL_LABEL, SAFETY_TEXT, SAFETY_URL, SIZE_LABEL, VERY_HOT_LABEL, airportRows, climateText, isVeryHot, rugbyAidText, sizeBand } from '@/lib/search/display';

const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'source'; } };

/** Adds the search-backed facts (cost, majors, campus, climate) to a college page. Renders nothing until data loads. */
export default function CollegeFactsSection({ slug }: { slug: string }) {
  const [f, setF] = useState<CollegeFacts | null>(null);
  useEffect(() => { let off = false; loadFacts().then((x) => { if (!off) setF(x.colleges[slug] ?? null); }).catch(() => undefined); return () => { off = true; }; }, [slug]);
  if (!f) return null;
  const cost = costText(f);
  const climate = climateText(f);
  const band = sizeBand(f.enrollment_undergrad);
  const rows: [string, string][] = [];
  if (f.campus_feel) rows.push(['Campus feel', CAMPUS_FEEL_LABEL[f.campus_feel]]);
  if (band) rows.push(['Size', `${SIZE_LABEL[band]}${f.enrollment_undergrad ? ` · ${f.enrollment_undergrad.toLocaleString()} undergraduates (IPEDS)` : ''}`]);
  rows.push(...airportRows(f));
  rows.push(['Rugby aid', rugbyAidText(f)]);
  if (f.big_sport_tag) rows.push(['Athletics', f.big_sport_tag]);
  const srcs = Object.entries(f.prov).filter(([k]) => ['cost', 'majors_cip2', 'climate_tag', 'size_band'].includes(k));
  return (
    <section aria-label="Cost, majors and campus facts">
      <h2 className="font-heading text-[24px] text-ink mb-2">Cost, study and campus</h2>
      <dl>
        <div className="flex justify-between gap-6 py-3 border-b border-line text-[14px]">
          <dt className="text-muted">Cost per year</dt>
          <dd className="font-medium text-ink text-right">{cost.headline}<span className="block text-[12px] font-normal text-muted">{cost.askCoach ? 'Ask the coach what it costs.' : cost.sub}</span></dd>
        </div>
        {rows.map(([l, v]) => (
          <div key={l} className="flex justify-between gap-6 py-3 border-b border-line text-[14px]"><dt className="text-muted">{l}</dt><dd className="font-medium text-ink text-right">{v}</dd></div>
        ))}
        {climate && (
          <div className="flex justify-between gap-6 py-3 border-b border-line text-[14px]">
            <dt className="text-muted">Climate</dt>
            <dd className="font-medium text-ink text-right">{climate}{isVeryHot(f) && <span className="block text-[12px] font-normal text-muted">{VERY_HOT_LABEL}</span>}</dd>
          </div>
        )}
        <div className="flex justify-between gap-6 py-3 border-b border-line text-[14px]">
          <dt className="text-muted">Campus safety</dt>
          <dd className="font-medium text-ink text-right">{SAFETY_TEXT} <a href={SAFETY_URL} target="_blank" rel="noopener noreferrer" className="underline">Official report</a></dd>
        </div>
      </dl>
      {f.intl_warning && <p className="mt-3 text-[13px] text-muted">⚠︎ {f.intl_warning}</p>}
      {f.majors_top && f.majors_top.length > 0 && (
        <p className="mt-4 text-[14px] text-muted leading-relaxed"><span className="text-ink font-medium">Biggest fields of study (share of degrees): </span>{f.majors_top.join(', ')}</p>
      )}
      {f.majors_programs && f.majors_programs.length > 0 && (
        <p className="mt-2 text-[14px] text-muted leading-relaxed"><span className="text-ink font-medium">Largest programs: </span>{f.majors_programs.slice(0, 6).map(([n]) => n).join(', ')}</p>
      )}
      <p className="mt-3 text-[11px] text-faint leading-relaxed">
        Sources:{' '}
        {srcs.map(([k, p], i) => <span key={k}>{i > 0 && ', '}<a href={p.u} target="_blank" rel="noopener noreferrer" className="underline hover:text-muted">{hostOf(p.u)}</a> ({p.d})</span>)}
        . Checked October 2026. Always confirm with the college.
      </p>
    </section>
  );
}
