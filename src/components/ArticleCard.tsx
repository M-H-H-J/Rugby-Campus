import { Link } from 'wouter';
import type { Article } from '@/data/articles';

export default function ArticleCard({ article }: { article: Article }) {
  const hasContent = article.content && !article.content.startsWith('Coming soon');

  return (
    <Link href={`/learn/${article.slug}`}>
      <article className="group cursor-pointer">
        <p className="kicker mb-2.5 text-gold-dark">
          {article.category}
          {!hasContent && <span className="text-faint font-normal normal-case tracking-normal"> · coming soon</span>}
        </p>
        <h3 className="font-heading text-[21px] leading-snug text-ink group-hover:text-navy transition-colors mb-2">
          {article.title}
        </h3>
        <p className="text-muted text-[14px] leading-relaxed mb-2.5 line-clamp-2">{article.excerpt}</p>
        <span className="text-[13px] text-faint">{article.readTime}</span>
      </article>
    </Link>
  );
}
