import { usePageMeta } from '@/lib/usePageMeta';
import { articles } from '@/data/articles';
import ArticleCard from '@/components/ArticleCard';

export default function Learn() {
  usePageMeta('College Rugby Guides', 'Honest guides on US college rugby: how recruitment works, scholarships, rankings, and choosing the right program.');
  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-16">
      <div className="max-w-2xl mb-10">
        <h1 className="font-heading font-bold text-3xl text-dark mb-3">Learn About College Rugby</h1>
        <p className="text-gray-400 text-base leading-relaxed">
          Everything you need to know about playing rugby at a US college — from how recruitment works to scholarship opportunities and choosing the right program.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 bg-navy/5 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="font-heading font-bold text-xl text-dark mb-3">Have a Question We Haven't Covered?</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">We're constantly adding new guides and articles. Let us know what you want to learn about.</p>
        <a href="mailto:hello@rugbycampus.com" className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-all">
          Suggest a Topic
        </a>
      </div>
    </div>
  );
}
