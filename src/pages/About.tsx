import { Link } from 'wouter';
import { Mail, ArrowRight } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';

export default function About() {
  usePageMeta('About Hugh & Rugby Campus', 'Built by Hugh Johnston — Notre Dame College captain and 2023 NCR D1 National Championship-winning head coach. Why Rugby Campus exists.');
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      <header className="mb-10">
        <p className="kicker mb-3">About</p>
        <h1 className="font-heading text-[36px] md:text-[46px] text-ink leading-[1.06] mb-5">
          I'm Hugh. I built the resource I needed at 17.
        </h1>
        <p className="font-heading text-[19px] text-muted leading-[1.6]">
          Rugby Campus is a free guide to US college rugby — from someone who's been the recruit, the captain, and the championship-winning coach.
        </p>
      </header>

      <hr className="border-line mb-10" />

      <section className="mb-14">
        <div className="space-y-5 font-heading text-[17.5px] text-ink/85 leading-[1.75]">
          <p>
            I'm an Australian who joined Notre Dame College's rugby program in Ohio in Fall 2019, at 17 years old. I walked straight into a D1A side competing in Rugby East against Army, Navy, and Penn State. It was a baptism of fire, and I loved every minute of it.
          </p>
          <p>
            A lot changed over my time there. I captained the side in my Junior and Senior years as the program shifted from D1A to NCR D1. After finishing, I played PR7s and club rugby in Austin, Texas — then came back to Notre Dame College in Fall 2023 as Head Coach. That season we won the NCR D1 National Championship, beating St. Bonaventure in the final in Houston.
          </p>
          <p>
            Notre Dame College has since closed its doors. But the experience, the people, and the lessons stayed with me.
          </p>
          <p>
            Since coming home, players, parents, and coaches keep asking me the same questions — what's it really like, where should I go, how do I get recruited. There was no good resource built specifically for rugby. So I built one.
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

      {/* Work with me */}
      <section id="work-with-me" className="mb-14 scroll-mt-24 bg-dark rounded-lg p-8 md:p-10">
        <p className="kicker mb-3 text-gold">Work with me</p>
        <h2 className="font-heading text-[26px] md:text-[30px] text-white leading-tight mb-4">
          Someone in your corner who's actually done it
        </h2>
        <p className="text-white/55 text-[14.5px] leading-relaxed mb-7 max-w-lg">
          For players and parents who want hands-on help with the US pathway — choosing programs, approaching coaches, and arriving ready to compete. And for coaches who want their program in front of the right international recruits.
        </p>
        <Link href="/work-with-me" className="btn inline-flex items-center gap-2 bg-gold text-dark px-6 py-3 rounded-md text-[13px] font-bold">
          <Mail size={15} /> See how it works
        </Link>
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
