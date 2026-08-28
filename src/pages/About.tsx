import { Link } from 'wouter';
import { usePageMeta } from '@/lib/usePageMeta';
import { CONTACT_EMAIL } from '@/config';
import { MapPin, Trophy, Mail, ArrowRight } from 'lucide-react';

export default function About() {
  usePageMeta('About Hugh & Rugby Campus', "Built by Hugh Johnston — Notre Dame College captain and 2023 NCR D1 National Championship-winning head coach. Why Rugby Campus exists.");
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <span className="inline-block text-xs font-semibold text-navy bg-navy/5 px-3 py-1 rounded-lg uppercase tracking-wide mb-4">
          About
        </span>
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-dark mb-4 leading-tight">
          Hi, I'm Hugh — and this is why I built Rugby Campus
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          A free resource for rugby players who want to find their place in the U.S. college game — built by someone who's actually lived it.
        </p>
      </div>

      {/* Story */}
      <section className="mb-12">
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            I'm an international student from Australia. In Fall 2019, at just 17 years old, I joined Notre Dame College's rugby program in Ohio — walking straight into a D1A side competing in Rugby East against the likes of Army, Navy, and Penn State. It was a baptism of fire, and I loved every minute of it.
          </p>
          <p>
            A lot changed over my time there. I was lucky enough to captain the side in both my Junior and Senior years, as the program shifted from D1A to NCR D1 while staying in Rugby East. My years in the USA shaped me as a player and a person.
          </p>
          <p>
            After I finished, I went on to play PR7s and rugby in Austin, Texas. Then in Fall 2023, I returned to Notre Dame College — this time as Head Coach. That season, we won the NCR D1 National Championship, beating St. Bonaventure in the final down in Houston. It was a pretty special way to cap off my time in the U.S. college rugby scene.
          </p>
          <p>
            Sadly, Notre Dame College has since closed its doors as an institution. But the experience, the people, and the lessons stayed with me.
          </p>
          <p>
            Since coming home, I've had so many players, parents, and coaches reach out asking what it was really like over there — where the best places to go are, how the system works, how to get recruited. I realised there wasn't a single good resource out there built specifically for rugby. So I built one. That's Rugby Campus.
          </p>
        </div>
      </section>

      {/* Quick credentials */}
      <section className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: MapPin, label: 'Played & Captained', value: 'Notre Dame College, Rugby East' },
          { icon: Trophy, label: 'Coached to a Title', value: '2023 NCR D1 National Champions' },
          { icon: MapPin, label: 'Also Played', value: 'PR7s & club rugby in Austin, TX' },
        ].map((c) => (
          <div key={c.label} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <c.icon size={20} className="text-navy mb-3" />
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{c.label}</div>
            <div className="text-sm font-semibold text-dark leading-snug">{c.value}</div>
          </div>
        ))}
      </section>

      {/* What Rugby Campus is */}
      <section className="mb-12">
        <h2 className="font-heading font-bold text-xl text-dark mb-4">What Rugby Campus Is</h2>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            Rugby Campus is a free tool to help aspiring players discover college rugby programs across the United States — an interactive map, detailed college profiles, coach contacts, and honest guides on how the whole process actually works.
          </p>
          <p>
            Whether you want to chase a D1A scholarship or find a smaller program where you'll get game time and a great degree, my goal is to give you the information I wish I'd had when I was 17 and figuring this all out from the other side of the world.
          </p>
        </div>
      </section>

      {/* Work with me */}
      <section id="work-with-me" className="mb-12 scroll-mt-24">
        <div className="bg-navy rounded-2xl p-8 md:p-10">
          <h2 className="font-heading font-bold text-xl text-white mb-3">Work with Me</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-lg">
            I work directly with players and coaches who want hands-on help with the U.S. college rugby journey. If you want someone in your corner who's been through it as a player, a captain, and a championship-winning coach — let's talk.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="font-heading font-semibold text-sm text-white mb-2">For Players</h3>
              <p className="text-white/45 text-xs leading-relaxed">
                Personalised guidance on which programs to target, how to approach coaches, and individualised training so you arrive ready to compete.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="font-heading font-semibold text-sm text-white mb-2">For Coaches</h3>
              <p className="text-white/45 text-xs leading-relaxed">
                Want your program in front of the right international recruits? Let's talk about getting your club featured on Rugby Campus.
              </p>
            </div>
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 bg-gold text-navy px-6 py-3 rounded-xl text-sm font-bold hover:bg-gold/90 transition-all">
            <Mail size={16} /> Get in Touch
          </a>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center py-4">
        <p className="text-gray-400 text-sm mb-4">Ready to start exploring?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/map">
            <button className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-all">
              <MapPin size={16} /> Explore the Map
            </button>
          </Link>
          <Link href="/learn">
            <button className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
              Read Our Guides <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
