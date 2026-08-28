import { usePageMeta } from '@/lib/usePageMeta';
import { articles } from '@/data/articles';
import ArticleCard from '@/components/ArticleCard';

export default function Learn() {
  usePageMeta('College Rugby Guides', 'Honest guides on US college rugby: how recruitment works, scholarships, rankings, and choosing the right program.');
  const full = articles.filter((a) => !a.content.startsWith('Coming soon'));
  const stubs = articles.filter((a) => a.content.startsWith('Coming soon'));

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      <header className="mb-12 max-w-2xl">
        <p className="kicker mb-2">Guides</p>
        <h1 className="font-heading text-[34px] md:text-[40px] leading-tight text-ink mb-4">How US college rugby really works</h1>
        <p className="text-muted text-[15px] leading-relaxed">
          No agency spin. These are the straight answers I give players and parents who ask me what it's actually like — written from the inside.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 mb-16">
        {full.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>

      {stubs.length > 0 && (
        <section className="pt-10 border-t border-line">
          <p className="kicker mb-6">In the works</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {stubs.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}
