import { Link } from 'wouter';
import { usePageMeta } from '@/lib/usePageMeta';
import { articles } from '@/data/articles';

export default function Learn() {
  usePageMeta('College Rugby Guides', 'Guides on how US college rugby works — structure, programs, rankings, and what to know before you commit.');
  const full = articles.filter((a) => !a.content.startsWith('Coming soon'));
  const stubs = articles.filter((a) => a.content.startsWith('Coming soon'));

  return (
    <div className="max-w-4xl mx-auto px-5 py-12 md:py-20">
      <header className="mb-12 pb-8 border-b border-line">
        <p className="kicker mb-4">Guides</p>
        <h1 className="font-heading text-[38px] md:text-[48px] leading-[1.05] tracking-[-0.02em] text-ink mb-5">How US college rugby works</h1>
        <p className="font-heading text-[18px] md:text-[20px] text-muted leading-[1.55] max-w-2xl">
          Practical guides on structure, programs, rankings, and what to know before you commit.
        </p>
      </header>

      <div className="space-y-0">
        {full.map((a, i) => (
          <Link key={a.id} href={`/learn/${a.slug}`} className={`block group cursor-pointer py-7 ${i > 0 ? 'border-t border-line' : ''}`}>
            <p className="kicker mb-3">{a.category}</p>
            <h2 className="font-heading text-[24px] md:text-[28px] leading-[1.15] text-ink group-hover:text-navy transition-colors mb-3">{a.title}</h2>
            <p className="font-heading text-[16px] text-muted leading-[1.6] mb-3 max-w-2xl">{a.excerpt}</p>
            <span className="text-[13px] text-faint">{a.readTime}</span>
          </Link>
        ))}
      </div>

      {stubs.length > 0 && (
        <section className="mt-12 pt-10 border-t border-line">
          <p className="kicker mb-8">In the Works</p>
          <div className="space-y-0">
            {stubs.map((a, i) => (
              <Link key={a.id} href={`/learn/${a.slug}`} className={`block group cursor-pointer py-6 ${i > 0 ? 'border-t border-line' : ''}`}>
                <p className="kicker mb-2 text-faint">{a.category} · coming soon</p>
                <h3 className="font-heading text-[20px] leading-[1.2] text-ink/70 mb-2">{a.title}</h3>
                <p className="text-[14px] text-muted leading-relaxed max-w-xl">{a.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
