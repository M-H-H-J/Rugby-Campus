import { Link } from 'wouter';
import { Check } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';
import ContactForm from '@/components/ContactForm';

export default function WorkWithMe() {
  usePageMeta('Work with Hugh — College Rugby Placement', 'Personal help getting placed at the right US college rugby program — program shortlist, coach outreach, applications and preparation, from a player, captain and championship-winning coach.');

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-16">
      {/* Offer */}
      <header className="max-w-3xl mb-14">
        <p className="kicker mb-3">Work with me</p>
        <h1 className="font-heading text-[38px] md:text-[50px] leading-[1.05] text-ink mb-6">
          Get placed at the right US college rugby program. Not just any program.
        </h1>
        <p className="font-heading text-[19px] text-muted leading-[1.6] mb-6">
          Agencies charge US$7,000–11,500 to build a profile and push you toward whichever college says yes. I do it differently — because I've been the recruit, the captain, and the coach on the other side of the email.
        </p>
        <p className="text-[15px] text-ink/80 leading-relaxed max-w-2xl">
          The difference isn't the price. It's that an agency has to place you <em>somewhere</em> to earn its fee. I only care whether it's the right place — the program where you'll actually get game time, develop, and come home with a degree you're proud of.
        </p>
      </header>

      {/* What you get */}
      <section className="grid lg:grid-cols-12 gap-12 mb-16">
        <div className="lg:col-span-7">
          <h2 className="font-heading text-[28px] text-ink mb-6">What working together looks like</h2>
          {[
            ['Honest assessment', 'Where you realistically sit — D1A contender, NCR D1 starter, or a program a tier down where you\u2019ll play every week. Nobody else will tell you this straight.'],
            ['Your shortlist', 'Five to eight programs matched to your position, level, academics and budget. Not forty. Not "whoever replies."'],
            ['Coach outreach that gets answered', 'I know what coaches actually read. We build your highlight reel, your one-page profile and the email that gets a reply — and I\u2019ll make introductions where I can.'],
            ['Applications, visas, scholarships', 'The admin that trips up international families. I\u2019ve done it as the 17-year-old and I\u2019ve watched it from the coaching office.'],
            ['Arrive ready', 'Position-specific preparation so you turn up at the level, not six months behind it. The physical gap between club rugby and a US college squad is real.'],
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
            <p className="kicker mb-2">Why me</p>
            <ul className="space-y-3 mb-6">
              {[
                'Recruited to Notre Dame College from Australia at 17',
                'Captained the side in Rugby East (D1A, then NCR D1)',
                'PR7s and club rugby in Austin, Texas',
                'Head coach — 2023 NCR D1 National Champions',
                'Independent: no college pays me to steer you anywhere',
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[14px] text-ink/85">
                  <Check size={15} className="text-navy mt-[3px] flex-shrink-0" /> {p}
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-line">
              <p className="text-[13px] text-muted leading-relaxed mb-5">I take on a limited number of players each intake. Pricing is discussed on the intro call — it's a fraction of what agencies charge.</p>
              <a href="#enquire" className="btn block text-center border border-navy text-navy px-5 py-3 rounded-md text-[13px] font-bold hover:bg-navy hover:text-white transition-colors">Start with a free intro call</a>
            </div>
          </div>
        </aside>
      </section>

      {/* Do it yourself note — builds trust */}
      <section className="border-y border-line py-10 mb-16">
        <div className="max-w-2xl">
          <h2 className="font-heading text-[24px] text-ink mb-3">You can also do this yourself. Genuinely.</h2>
          <p className="text-[15px] text-ink/80 leading-relaxed mb-4">
            Every coach email on this site is free. Plenty of players message a coach directly, get a reply, and sort the rest out with their parents. If that's you, brilliant — start with the{' '}
            <Link href="/learn/how-college-rugby-recruitment-works" className="text-navy font-medium">recruitment guide</Link> and the{' '}
            <Link href="/colleges" className="text-navy font-medium">40 programs</Link>.
          </p>
          <p className="text-[15px] text-ink/80 leading-relaxed">
            Working with me is for families who want the shortlist done properly, the doors opened, and someone who'll say "not that one" when it matters.
          </p>
        </div>
      </section>

      {/* Enquire */}
      <section id="enquire" className="scroll-mt-24 bg-dark rounded-lg p-8 md:p-12 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <p className="kicker mb-3 text-gold">Free intro call</p>
          <h2 className="font-heading text-[28px] text-white leading-tight mb-4">Tell me where you're at</h2>
          <p className="text-white/55 text-[14.5px] leading-relaxed">
            Position, age, where you play now, and what you're hoping for. Parents welcome to write in. I reply personally, usually within two days, and the first conversation costs nothing.
          </p>
        </div>
        <div className="lg:col-span-7">
          <ContactForm type="placement" dark submitLabel="Request an intro call" messagePlaceholder="Position, age, current club/school, and what you're aiming for…" />
        </div>
      </section>
    </div>
  );
}
