import { useState } from 'react';
import { Lock, Check, Mail } from 'lucide-react';
import { captureEmail } from '@/lib/supabase';
import { usePageMeta } from '@/lib/usePageMeta';
import { CONTACT_EMAIL } from '@/config';

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
      <h3 className="font-body font-semibold text-[14px] text-ink mb-3">{title}</h3>
      <ul className="space-y-2">
        {exercises.map((ex, i) => (
          <li key={i} className="text-[14px] text-ink/80 flex items-baseline gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 translate-y-[-2px]" /> {ex}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      <header className="mb-14 max-w-2xl">
        <p className="kicker mb-2">Training</p>
        <h1 className="font-heading text-[34px] md:text-[40px] leading-tight text-ink mb-4">Arrive ready to compete</h1>
        <p className="text-muted text-[15px] leading-relaxed">
          US college rugby can be physical. Start with the free sample block below — or enquire about paid coaching if you want a program built around you.
        </p>
      </header>

      {/* Free sample */}
      <section className="grid lg:grid-cols-12 gap-10 mb-20">
        <div className="lg:col-span-4">
          <p className="kicker mb-2">Free sample</p>
          <h2 className="font-heading text-[26px] text-ink leading-tight mb-3">Off-season strength block</h2>
          <p className="text-muted text-[14px] leading-relaxed mb-6">
            Two days from an off-season strength block. Day one is open — your email unlocks the rest, and the full block lands in your inbox. One unlock for this page.
          </p>
          {unlocked ? (
            <p className="inline-flex items-center gap-2 text-[14px] text-navy font-medium">
              <Check size={16} /> Unlocked — the full program is on its way.
            </p>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-3 max-w-xs">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email" required
                className="w-full px-4 py-3 rounded-md border border-line text-[14px] outline-none focus:border-navy transition-colors"
              />
              <button type="submit" className="btn w-full py-3 bg-navy text-white rounded-md text-[13px] font-semibold">
                Unlock the full program
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-8 grid sm:grid-cols-2 gap-8 lg:pl-8 lg:border-l lg:border-line">
          {day('Day 1 — Upper body push', ['Bench press — 4×6 @ 80%', 'Overhead press — 3×8', 'Incline DB press — 3×10', 'Tricep dips — 3×12', 'Face pulls — 3×15'])}
          <div className="relative">
            <div className={!unlocked ? 'blur-[5px] select-none' : ''}>
              {day('Day 2 — Lower body strength', ['Back squat — 4×5 @ 85%', 'Romanian deadlift — 3×8', 'Walking lunges — 3×12', 'Leg press — 3×10', 'Nordic curls — 3×6'])}
            </div>
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center gap-2 bg-white border border-line rounded-md px-4 py-2.5 text-[13px] font-medium text-ink">
                  <Lock size={13} className="text-navy" /> Unlocks with your email
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Coaching — paid service */}
      <section className="bg-dark rounded-lg overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-10 p-8 md:p-12">
          <div className="lg:col-span-7">
            <p className="kicker mb-3 text-gold">Paid coaching</p>
            <h2 className="font-heading text-[28px] md:text-[32px] text-white leading-tight mb-4">
              Paid one-on-one coaching for college rugby prep
            </h2>
            <p className="text-white/55 text-[14.5px] leading-relaxed mb-6 max-w-lg">
              I take on a small number of athletes one-on-one. This is paid coaching. Your program is built around your position, what you want out of the season, and your rugby season timeline — with regular check-ins and adjustments. Email to enquire about fit and pricing.
            </p>
            <ul className="space-y-2.5 mb-8">
              {[
                'Programming built for you, not a template',
                'Position-specific strength, speed, and conditioning',
                'Regular check-ins and adjustments as needed',
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-white/75">
                  <Check size={15} className="text-gold mt-[3px] flex-shrink-0" /> {p}
                </li>
              ))}
            </ul>
            <a href={`mailto:${CONTACT_EMAIL}?subject=Coaching%20enquiry`} className="btn inline-flex items-center gap-2 bg-gold text-dark px-6 py-3 rounded-md text-[13px] font-bold">
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
                <span className="font-heading text-[26px] text-gold leading-none">{s.n}</span>
                <div>
                  <p className="text-white text-[14px] font-semibold mb-1">{s.t}</p>
                  <p className="text-white/45 text-[13px] leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
