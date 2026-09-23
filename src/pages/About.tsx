import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';
import { CONTACT_EMAIL } from '@/config';

export default function About() {
  usePageMeta('About Rugby Campus', 'Why Rugby Campus exists — built by Hugh Johnston after going through the US college rugby pathway as a recruit and later as a coach.');
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      <header className="mb-10">
        <p className="kicker mb-3">About</p>
        <h1 className="font-heading text-[36px] md:text-[46px] text-ink leading-[1.06] mb-5">
          Why this site exists
        </h1>
        <p className="font-heading text-[19px] text-muted leading-[1.6]">
          Rugby Campus is a free guide to US college rugby — from someone who\u2019s seen both sides of the recruitment process.
        </p>
      </header>

      <hr className="border-line mb-10" />

      <section className="mb-14">
        <div className="space-y-5 font-heading text-[17.5px] text-ink/85 leading-[1.75]">
          <p>
            Coming out of high school, I wanted to do something different: go to the US and play rugby. I went through an agency. They gave me recommendations. I could check Niche for academics and acceptance rates. What I could not see was how good any of those programs actually were at rugby. Coaches sold the dream. Every conversation sounded like the best facilities, the best setup, the best everything.
          </p>
          <p>
            What I needed was a clear list of colleges — where they were, what level they played, how the system worked. I had no idea what Goff Rugby Report was. I did not understand NCR versus D1A. I was just trying to get over and play.
          </p>
          <p>
            I\u2019m Hugh Johnston — an Australian who joined Notre Dame College\u2019s rugby program in Ohio in Fall 2019, at 17. I played in Rugby East against Army, Navy, and Penn State, captained the side as the program shifted from D1A to NCR D1, then played PR7s and club rugby in Austin, Texas. In Fall 2023 I came back to Notre Dame College as Head Coach. That season we won the 2023 NCR D1 National Championship.
          </p>
          <p>
            Notre Dame College has since closed. The experience, the people, and the lessons stayed.
          </p>
          <p>
            When I was a coach, I did not sell the dream the way I had been sold it. We did not have the best facilities. We did have a strong culture. If you were coming for Instagram shots, it was not the place. If you wanted to play a high level of footy, it was. That honesty is the gap this site tries to fill — so you can check what programs actually look like before you commit.
          </p>
          <p>
            Since coming home, players and parents keep asking the same questions. I used to send them an Excel of colleges after long conversations. This site is that list, properly built. If you go through an agency, that is fine — use this as a tool as well. Agencies vary: some are well connected, others less so. Use both.
          </p>
        </div>
      </section>

      {/* Credentials — rule rows, not boxes */}
      <section className="mb-14">
        <p className="kicker mb-4">The short version</p>
        <dl>
          {[
            ['Player & captain', 'Notre Dame College — Rugby East, D1A then NCR D1'],
            ['After college', 'PR7s and club rugby in Austin, Texas'],
            ['Coach', 'Notre Dame College Head Coach, 2023 — NCR D1 National Championship'],
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
