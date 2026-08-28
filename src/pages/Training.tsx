import { useState } from 'react';
import { captureEmail } from '@/lib/supabase';
import { usePageMeta } from '@/lib/usePageMeta';
import { CONTACT_EMAIL } from '@/config';
import { Dumbbell, Zap, Heart, Lock, Check, ArrowRight, Mail, UserCheck } from 'lucide-react';

export default function Training() {
  usePageMeta('Rugby Training Programs', 'Free rugby strength & conditioning sample program, plus individualised coaching from a national championship-winning college coach.');
  const [email, setEmail] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    await captureEmail(email, 'training_program');
    setUnlocked(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-16">
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <h1 className="font-heading font-bold text-3xl text-dark mb-3">Rugby Training Programs</h1>
        <p className="text-gray-400 text-base leading-relaxed">
          Get college-ready with training programs built for aspiring rugby players. Start with a free sample program, or work with me directly for fully individualised coaching.
        </p>
      </div>

      {/* Program Categories */}
      <div className="grid md:grid-cols-3 gap-5 mb-16">
        {[
          { icon: Dumbbell, title: 'Strength & Conditioning', desc: 'Gym programs designed for rugby — build the power, endurance, and resilience you need to compete at the college level.', tags: ['Off-Season', 'Pre-Season', 'In-Season'] },
          { icon: Zap, title: 'Speed & Agility', desc: 'Sprint mechanics, change-of-direction drills, and acceleration work to help you get faster on the field.', tags: ['Speed', 'Agility', 'Footwork'] },
          { icon: Heart, title: 'Rugby Conditioning', desc: 'Sport-specific conditioning that mirrors the demands of a rugby match — repeated high-intensity efforts.', tags: ['Fitness', 'Game-Ready', 'Endurance'] },
        ].map((prog) => (
          <div key={prog.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all">
            <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center mb-4">
              <prog.icon size={22} className="text-navy" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-dark mb-2">{prog.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{prog.desc}</p>
            <div className="flex flex-wrap gap-2">
              {prog.tags.map((t) => (
                <span key={t} className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── FREE: Sample Program (email unlock) ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg uppercase tracking-wide">Free</span>
          <h2 className="font-heading font-bold text-xl text-dark">Sample Strength Program</h2>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 md:p-8 mb-8">
        <p className="text-gray-400 text-sm mb-6">A preview of the off-season strength block. Enter your email to unlock the full program.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Day 1 - free */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="font-heading font-semibold text-sm text-navy mb-3">Day 1 — Upper Body Push</h3>
            <ul className="space-y-2">
              {['Bench Press — 4x6 @ 80%', 'Overhead Press — 3x8', 'Incline DB Press — 3x10', 'Tricep Dips — 3x12', 'Face Pulls — 3x15'].map((ex, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" /> {ex}
                </li>
              ))}
            </ul>
          </div>

          {/* Day 2 - locked */}
          <div className="relative">
            <div className={`bg-white rounded-xl p-5 border border-gray-100 ${!unlocked ? 'blur-sm select-none' : ''}`}>
              <h3 className="font-heading font-semibold text-sm text-navy mb-3">Day 2 — Lower Body Strength</h3>
              <ul className="space-y-2">
                {['Back Squat — 4x5 @ 85%', 'Romanian Deadlift — 3x8', 'Walking Lunges — 3x12', 'Leg Press — 3x10', 'Nordic Curls — 3x6'].map((ex, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" /> {ex}
                  </li>
                ))}
              </ul>
            </div>
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-2">
                  <Lock size={14} className="text-navy" />
                  <span className="text-sm font-semibold text-dark">Enter email to unlock</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email unlock */}
        <div className="mt-6">
          {unlocked ? (
            <div className="bg-green-50 text-green-700 rounded-xl px-5 py-4 text-sm font-medium flex items-center gap-2">
              <Check size={18} /> Unlocked! The full program is on its way to your inbox.
            </div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={handleUnlock}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/30 transition-all"
              />
              <button type="submit" className="px-6 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-all whitespace-nowrap">
                Unlock Free Program
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── PAID: Work with Me ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-gold-dark bg-gold/15 px-2.5 py-1 rounded-lg uppercase tracking-wide">Premium</span>
          <h2 className="font-heading font-bold text-xl text-dark">Work with Me — Individualised Coaching</h2>
        </div>
      </div>

      <div className="bg-navy rounded-2xl p-8 md:p-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <UserCheck size={22} className="text-gold" />
            </div>
            <h3 className="font-heading font-bold text-xl text-white mb-3">Train directly with me</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              The free programs are a great start — but if you want to arrive at college genuinely ready to compete, I work with a limited number of athletes one-on-one. Fully individualised programming, built around your position, your goals, and your schedule, with ongoing check-ins to keep you accountable.
            </p>
            <ul className="space-y-2.5 mb-6">
              {[
                'A program built specifically for you, not a generic template',
                'Regular check-ins so you stay on track',
                'Position-specific strength, speed, and conditioning',
                'Guidance from someone who played and coached at the college level',
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check size={16} className="text-gold mt-0.5 flex-shrink-0" /> {point}
                </li>
              ))}
            </ul>
            <a href={`mailto:${CONTACT_EMAIL}?subject=Individualised%20Coaching`}
              className="inline-flex items-center gap-2 bg-gold text-navy px-6 py-3 rounded-xl text-sm font-bold hover:bg-gold/90 transition-all">
              <Mail size={16} /> Enquire About Coaching
            </a>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">How it works</div>
            <div className="space-y-4">
              {[
                { n: '1', t: 'Intro chat', d: 'We talk through your goals, level, and timeline.' },
                { n: '2', t: 'Your program', d: 'I build a plan tailored to you and your position.' },
                { n: '3', t: 'Ongoing support', d: 'Regular check-ins and adjustments as you progress.' },
              ].map((s) => (
                <div key={s.n} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gold/15 text-gold flex items-center justify-center text-xs font-bold flex-shrink-0">{s.n}</div>
                  <div>
                    <div className="text-white text-sm font-semibold">{s.t}</div>
                    <div className="text-white/45 text-xs leading-relaxed">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-400 text-sm mb-4">Not sure where to start? Explore programs first.</p>
        <a href="/map" className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
          Explore the College Map <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}
