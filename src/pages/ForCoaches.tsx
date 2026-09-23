import { Check } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';
import ContactForm from '@/components/ContactForm';

export default function ForCoaches() {
  usePageMeta('For College Coaches — Feature Your Program', 'Put your college rugby program in front of international recruits. Verify your profile, feature your program, and receive direct enquiries from qualified players.');

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-16">
      <header className="max-w-3xl mb-14">
        <p className="kicker mb-3">For college coaches</p>
        <h1 className="font-heading text-[38px] md:text-[48px] leading-[1.05] text-ink mb-6">
          Put your program in front of the players you actually want
        </h1>
        <p className="font-heading text-[19px] text-muted leading-[1.6]">
          Rugby Campus is where international players and their parents research US college rugby. Your program is already on the map. Here's how to make sure it's right — and how to stand out.
        </p>
      </header>

      <section className="grid lg:grid-cols-12 gap-12 mb-16">
        <div className="lg:col-span-7">
          <h2 className="font-heading text-[26px] text-ink mb-6">Three ways to work with Rugby Campus</h2>
          {[
            ['Verify your profile — free', 'Check your coach details, conference, squad size and description. Send corrections and they go live within a day. This costs nothing and it\u2019s the single most useful thing you can do.'],
            ['Featured program', 'Highlighted placement across the map, the colleges index and relevant guides, plus a richer profile: photos, a video, what you look for in a recruit, and a direct enquiry button that lands in your inbox. Annual.'],
            ['Recruit pipeline', 'I speak with international players and families every week. When one fits your program, I make the introduction — warm, pre-qualified, with a highlight reel. No fee to the player.'],
          ].map(([t, d], i) => (
            <div key={t} className={`flex gap-5 py-5 ${i > 0 ? 'border-t border-line' : ''}`}>
              <span className="font-heading text-[30px] text-navy leading-none w-9 flex-shrink-0">{i + 1}</span>
              <div>
                <h3 className="font-body font-semibold text-[15px] text-ink mb-1.5">{t}</h3>
                <p className="text-muted text-[14px] leading-relaxed max-w-xl">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 bg-white border border-line rounded-lg p-7">
            <p className="kicker mb-3">Who's looking</p>
            <ul className="space-y-3">
              {[
                'International players — Australia, NZ, UK, Ireland, South Africa, Pacific Islands',
                'Parents doing the research before any agency gets involved',
                'US high-school players comparing programs beyond their region',
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[14px] text-ink/85">
                  <Check size={15} className="text-navy mt-[3px] flex-shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section id="enquire" className="scroll-mt-24 bg-dark rounded-lg p-8 md:p-12 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <p className="kicker mb-3 text-gold">Get in touch</p>
          <h2 className="font-heading text-[28px] text-white leading-tight mb-4">Verify, feature, or just say hello</h2>
          <p className="text-white/55 text-[14.5px] leading-relaxed">
            Tell me which program you coach and what you'd like — corrections, a featured listing, or recruits. I'll come back to you personally.
          </p>
        </div>
        <div className="lg:col-span-7">
          <ContactForm type="featured_program" dark submitLabel="Send" messagePlaceholder="Program, your role, and what you'd like to do…" />
        </div>
      </section>
    </div>
  );
}
