import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';
import { CONTACT_EMAIL } from '@/config';

export default function About() {
  usePageMeta('About Hugh & Rugby Campus', 'Built by Hugh Johnston — Notre Dame College captain and 2023 NCR D1 National Championship-winning head coach. Why Rugby Campus exists.');
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      <header className="mb-10">
        <p className="kicker mb-3">About</p>
        <h1 className="font-heading text-[36px] md:text-[46px] text-ink leading-[1.06] mb-5">
          Hugh Johnston
        </h1>
        <p className="font-heading text-[19px] text-muted leading-[1.6]">
          Rugby Campus is a free guide to US college rugby — from someone who\u2019s seen recruitment from both sides.
        </p>
      </header>

      <hr className="border-line mb-10" />

      <section className="mb-14">
        <div className="space-y-5 font-heading text-[17.5px] text-ink/85 leading-[1.75]">
          <p>
            I\u2019m an Australian who was lucky enough to be recruited to Notre Dame College\u2019s rugby program in Ohio in 2019, at 17. I joined a D1A side competing in Rugby East against Army, Navy, and Penn State. I used an agency to get there — I didn\u2019t know program strength, didn\u2019t know coaches, and the agency helped open the door.
          </p>
          <p>
            I captained the side in my Junior and Senior years as the program shifted from D1A to NCR D1. After finishing, I played PR7s and club rugby in Austin, Texas — then came back to Notre Dame College in Fall 2023 as Head Coach. That season we won the NCR D1 National Championship, beating St. Bonaventure in the final in Houston.
          </p>
          <p>
            Notre Dame College has since closed its doors. But the experience, the people, and the lessons stayed with me.
          </p>
          <p>
            Since coming home, players, parents, and coaches keep asking me the same questions — what\u2019s it really like, where should I go, how do I get recruited. There was no good resource built specifically for rugby. So I built one. Whether you use an agency, go direct, or do a mix of both — this site is here to help.
          </p>
        </div>
      </section>

      {/* Credentials — rule rows, not boxes */}
      <section className="mb-14">
        <p className="kicker mb-4">The short version</p>
        <dl>
          {[
            ['Played & captained', 'Notre Dame College — Rugby East, D1A then NCR D1'],
            ['After college', 'PR7s and club rugby in Austin, Texas'],
            ['Coached', 'NDC Head Coach — 2023 NCR D1 National Champions'],
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
