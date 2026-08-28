import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'wouter';
import type { Article } from '@/data/articles';

export default function ArticleCard({ article }: { article: Article }) {
  const hasContent = article.content && !article.content.startsWith('Coming soon');

  return (
    <Link href={`/learn/${article.slug}`}>
      <article className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300 cursor-pointer">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-navy bg-navy/5 px-2.5 py-1 rounded-lg">{article.category}</span>
          {!hasContent && <span className="text-xs font-medium text-gold-dark bg-gold/10 px-2.5 py-1 rounded-lg">Coming Soon</span>}
        </div>
        <h3 className="font-heading font-semibold text-lg text-dark leading-snug mb-2 group-hover:text-navy transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={12} />
            <span>{article.readTime}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy group-hover:gap-2 transition-all">
            Read {hasContent ? 'Article' : 'Soon'} <ArrowRight size={12} />
          </span>
        </div>
      </article>
    </Link>
  );
}
