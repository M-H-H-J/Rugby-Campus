import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';
import { CONTACT_EMAIL } from '@/config';

export default function About() {
  usePageMeta('About Rugby Campus', 'Why Rugby Campus exists — a free guide to US college rugby programs, levels, and recruitment, built after going through the pathway.');
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      <header className="mb-10">
        <p className="kicker mb-3">About</p>
        <h1 className="font-heading text-[36px] md:text-[46px] text-ink leading-[1.06] mb-5">
          The resource I needed at 17.
        </h1>
        <p className="font-heading text-[19px] text-muted leading-[1.6]">
          Rugby Campus is a free guide to US college rugby — programs, levels, and how recruitment actually works.
        </p>
      </header>

      <hr className="border-line mb-10" />

      <section className="mb-14">
        <div className="space-y-5 font-heading text-[17.5px] text-ink/85 leading-[1.75]">
          <p>
            Coming out of high school, I wanted to do something different: go to the US and play rugby. I went through an agency. They gave me recommendations. I could check <a href="https://www.niche.com" target="_blank" rel="noopener noreferrer" className="text-navy hover:text-navy-deep">Niche</a> for academics and acceptance rates. What I could not see was how good any of those programs actually were at rugby. Coaches sold the dream — every conversation made it sound like the best place to be.
          </p>
          <p>
            What I needed was a clear list of colleges — where they were, what level they played, how the system worked. I had no idea what Goff Rugby Report was. I did not understand NCR versus D1A. I was just trying to get over to study and play.
          </p>
          <p>
            I'm Hugh Johnston — an Australian who joined Notre Dame College's rugby program in Ohio in Fall 2019, at 17. That freshman year I was injured, but I was part of a team that played Rugby East against sides like Army, Navy, and Penn State. I captained later as the program moved from D1A to NCR D1, then played PR7s and club rugby in Austin. In Fall 2023 I came back as head coach; that season we won the NCR D1 National Championship.
          </p>
          <p>
            Notre Dame College has since closed. The experience, the people, and the lessons stayed.
          </p>
          <p>
            When I was a coach, I did not sell the dream the way I had been sold it. We were a no-name college without the best facilities, but we had a strong culture. If you were coming for Instagram shots, it was not the place. If you wanted to play a high level of footy, it was. That honesty is the gap this site tries to fill.
          </p>
          <p>
            Questions about a program, or something not right on the site? Email me. The best screening is still talking to coaches yourself — and visiting if you can. I never visited before I committed, and it still matters because you are moving there to live.
          </p>
          <p>
            If you go through an agency, that is fine — use this site as well. Agencies vary; use both.
          </p>
        </div>
      </section>

      {/* Credentials — rule rows, not boxes */}
      <section className="mb-14">
        <p className="kicker mb-4">The short version</p>
        <dl>
          {[
            ['Player & captain', 'Notre Dame College — D1A, then NCR D1'],
            ['After college', 'PR7s and club rugby in Austin, Texas'],
            ['Coach', 'Notre Dame College Head Coach, 2023'],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-6 py-4 border-b border-line">
              <dt className="text-[13px] text-faint sm:pt-0.5">{label}</dt>
              <dd className="text-[14.5px] font-medium text-ink sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Questions — soft contact */}
      <section className="mb-14 py-6 border-y border-line">
        <p className="text-[15px] text-ink/85 leading-relaxed">
          Questions about a program? Something not right on the site?{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy font-medium hover:text-navy-deep transition-colors">
            Email me
          </a>{' '}
          — I reply personally.
        </p>
      </section>

      <div className="flex items-center justify-between py-6 border-t border-line">
        <p className="text-muted text-[14px]">Ready to look around?</p>
        <Link href="/map" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:text-navy-deep transition-colors">
          Open the map <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
