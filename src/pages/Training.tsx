import { useState } from 'react';
import { Check, Mail } from 'lucide-react';
import { captureEmail } from '@/lib/supabase';
import { usePageMeta } from '@/lib/usePageMeta';

export default function Training() {
  usePageMeta('Rugby Training', 'A free sample strength block, plus paid individualised coaching for players preparing for US college rugby.');
  const [email, setEmail] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    await captureEmail(email, 'training_program');
    setUnlocked(true);
  };

  const day = (title: string, exercises: string[]) => (
    <div>
      <h3 className="font-heading text-[20px] text-ink mb-2">{title}</h3>
      <ul className="border-t border-line">
        {exercises.map((ex) => {
          const g = parseInt(ex, 10);
          const token = ex.match(/^\d+[A-Z]?/)?.[0] ?? '';
          const rest = token ? ex.slice(token.length).replace(/^\s/, '') : ex;
          return (
            <li key={ex} className={`py-2 border-b border-line text-[14px] text-ink px-2 ${g % 2 === 1 ? 'bg-navy/[0.06]' : 'bg-white'}`}>
              {token ? <span className="inline-block w-8 font-semibold">{token}</span> : null}
              {rest}
            </li>
          );
        })}
      </ul>
    </div>
  );

  const locked = (title: string, exercises: string[]) => (
    unlocked ? day(title, exercises) : (
      <div className="border-t border-line pt-3">
        <h3 className="font-heading text-[20px] text-ink">{title}</h3>
        <p className="mt-2 text-[13px] text-muted">Unlock with your email</p>
      </div>
    )
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      <header className="mb-14 max-w-2xl">
        <p className="kicker mb-2">Training</p>
        <h1 className="font-heading text-[34px] md:text-[40px] leading-tight text-ink mb-4">Arrive ready to compete</h1>
        <p className="text-muted text-[15px] leading-relaxed">
          US college rugby can be physical. Below is a free four-day strength sample — your email unlocks days two through four.
        </p>
      </header>

      {/* Free sample — Day 1 only on the right */}
      <section className="grid lg:grid-cols-12 gap-10 mb-10">
        <div className="lg:col-span-4">
          <p className="kicker mb-2">Free sample</p>
          <h2 className="font-heading text-[26px] text-ink leading-tight mb-3">Off-season strength block</h2>
          <p className="text-muted text-[14px] leading-relaxed mb-6">
            Four days from an off-season strength block — upper/lower split. Day one is open; your email unlocks days two through four.
          </p>
          {unlocked ? (
            <p className="inline-flex items-center gap-2 text-[14px] text-navy font-medium">
              <Check size={16} /> Unlocked. Days 2–4 are open below.
            </p>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-3 max-w-xs">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email" required
                className="w-full px-4 py-3 rounded-md border border-line text-[14px] outline-none focus:border-navy transition-colors"
              />
              <button type="submit" className="btn w-full py-3 bg-navy text-white rounded-md text-[13px] font-semibold">
                Unlock days 2–4
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-8 lg:pl-8 lg:border-l lg:border-line">
          {day('Day 1 — Upper', [
            '1A Rotational med ball throw — 3×4 each side',
            '1B Clap push-ups — 3×4',
            '2A DB incline bench — 4×6',
            '2B DB seal row — 3×6',
            '3A Underhand lat pulldown — 4×8',
            '3B Weighted push-ups — 3×10',
            '3C Cable crunch — 3×10',
            '4A Single-leg kneeling DB shoulder press — 3×8 each side',
            '4B Weighted ITY — 3×5 each side',
            '4C Cable curl + cable extension — 3×12 each side',
            '5 Neck isometrics — 3×10 seconds each side',
          ])}
        </div>
      </section>

      {/* Coaching — paid service, inline after Day 1 */}
      <section className="bg-dark rounded-lg overflow-hidden mb-10">
        <div className="grid lg:grid-cols-12 gap-10 p-6 md:p-10">
          <div className="lg:col-span-7">
            <p className="kicker mb-3 text-white/70">Paid coaching</p>
            <h2 className="font-heading text-[28px] md:text-[32px] text-white leading-tight mb-4">
              Paid one-on-one coaching for college rugby
            </h2>
            <p className="text-white/55 text-[14.5px] leading-relaxed mb-6 max-w-lg">
              I take on a small number of athletes one-on-one. This is paid coaching. Your program is built around your position, what you want out of the season, and your rugby season timeline — with regular check-ins and adjustments. It's not just gym work: it covers conditioning on and off your feet, and speed work. Email to enquire about fit and pricing.
            </p>
            <ul className="space-y-2.5 mb-8">
              {[
                'Programming built for you, not a template',
                'Strength, conditioning (on and off feet) and speed work for your position',
                'Regular check-ins and adjustments as needed',
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-white/75">
                  <Check size={15} className="text-white/70 mt-[3px] flex-shrink-0" /> {p}
                </li>
              ))}
            </ul>
            <a href="mailto:training@rugbycampus.org?subject=Coaching%20enquiry" className="btn inline-flex items-center gap-2 bg-gold text-dark px-6 py-3 rounded-md text-[13px] font-bold">
              <Mail size={15} /> Enquire about coaching
            </a>
          </div>
          <div className="lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-10">
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-caps mb-6">How it works</p>
            {[
              { n: '1', t: 'Intro chat', d: 'Your goals, your level, your season. No obligation.' },
              { n: '2', t: 'Your program', d: 'Built for your position and what you want.' },
              { n: '3', t: 'Ongoing support', d: 'Check-ins and adjustments as needed.' },
            ].map((s, i) => (
              <div key={s.n} className={`flex gap-5 py-4 ${i > 0 ? 'border-t border-white/10' : ''}`}>
                <span className="font-heading text-[26px] text-white/80 leading-none">{s.n}</span>
                <div>
                  <p className="text-white text-[14px] font-semibold mb-1">{s.t}</p>
                  <p className="text-white/45 text-[13px] leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-8">
          {locked('Day 2 — Lower', [
            '1A Trap bar speed shrugs — 3×6',
            '1B Seated box jumps — 3×4',
            '1C Lateral bounds — 3×3 each side',
            '2A Barbell back squat — 4×6',
            '2B Banded terminal knee extension — 3×12 each side',
            '3A Barbell single-leg hip thrust — 3×6 each side',
            '3B Nordics — 3×4',
            '3C Seated calf raise — 3×12',
            '4A Banded marches — 2×12 each side',
            '4B Leg extensions — 2×(10 each side + 10)',
          ])}
          {locked('Day 3 — Upper', [
            '1A Med ball bench throw — 3×6',
            '1B Pallof rotation — 3×12 each side',
            '2A Barbell bench press — 4×6',
            '2B Single-arm DB row — 4×6 each side',
            '3A Weighted pull-ups — 4×8',
            '3B Half-kneeling landmine press — 3×8 each side',
            '3C DB farmer’s carry — 3×40 m',
            '4A DB lateral raise — 3×12–15',
            '4B Skullcrushers — 2×12',
          ])}
          {locked('Day 4 — Lower', [
            '1A Hang high pull — 3×5',
            '1B Double broad jumps — 3×2',
            '1C Pogos — 2×10',
            '2A Trap bar deadlift — 4×5',
            '2B Copenhagen holds — 3×30 seconds each side',
            '3A Barbell Romanian deadlift — 3×8',
            '3B Stability ball hamstring curl — 3×12',
            '4A Goblet side lunge — 3×8 each side',
            '4B Calf raise + tib raise — 3×20 each side',
          ])}
      </section>
    </div>
  );
}
