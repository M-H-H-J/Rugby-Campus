import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import { getArticleBySlug, articles } from '@/data/articles';
import { captureEmail } from '@/lib/supabase';
import { usePageMeta } from '@/lib/usePageMeta';

// Simple markdown-ish renderer for our article content
function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-heading font-bold text-lg text-dark mt-8 mb-3">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-heading font-bold text-xl text-dark mt-10 mb-4">{line.slice(3)}</h2>);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="text-sm font-semibold text-dark mt-4 mb-2">{line.slice(2, -2)}</p>);
    } else if (line.startsWith('- ')) {
      // Collect consecutive list items
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} className="space-y-2 my-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-2 my-4 list-decimal list-inside">
          {items.map((item, j) => (
            <li key={j} className="text-sm text-gray-600 leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    } else {
      elements.push(<p key={i} className="text-sm text-gray-600 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />);
    }
    i++;
  }

  return elements;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-dark">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}



function ArticleMeta({ title, description }: { title: string; description: string }) {
  usePageMeta(title, description);
  return null;
}

function NotifyForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  if (done) return <p className="text-green-600 text-sm font-medium">You're on the list — we'll email you when it's live.</p>;
  return (
    <form className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto" onSubmit={async (e) => { e.preventDefault(); await captureEmail(email, 'article_notify'); setDone(true); }}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20" />
      <button type="submit" className="px-5 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 transition-all whitespace-nowrap">Notify Me</button>
    </form>
  );
}

export default function ArticlePage() {
  const [, params] = useRoute('/learn/:slug');
  const article = params?.slug ? getArticleBySlug(params.slug) : undefined;

  if (!article) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 text-center">
        <h1 className="font-heading font-bold text-2xl text-dark mb-4">Article Not Found</h1>
        <Link href="/learn" className="text-navy font-semibold text-sm hover:underline">← Back to all articles</Link>
      </div>
    );
  }

  const isComingSoon = article.content.startsWith('Coming soon');
  const otherArticles = articles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 md:py-12">
      <ArticleMeta title={article.title} description={article.metaDescription} />
      {/* Breadcrumb */}
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors mb-6">
        <ArrowLeft size={14} /> Back to all articles
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-navy bg-navy/5 px-2.5 py-1 rounded-lg">{article.category}</span>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={12} />
            <span>{article.readTime}</span>
          </div>
        </div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-dark leading-tight mb-4">{article.title}</h1>
        <p className="text-gray-500 text-base leading-relaxed">{article.excerpt}</p>
      </header>

      <hr className="border-gray-100 mb-8" />

      {/* Article Content */}
      {isComingSoon ? (
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="font-heading font-bold text-xl text-dark mb-3">Coming Soon</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            This article is currently being written. Sign up below to get notified when it's published.
          </p>
          <NotifyForm />
        </div>
      ) : (
        <article className="prose-custom">
          {renderContent(article.content)}
        </article>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 bg-navy rounded-2xl p-8 text-center">
        <h3 className="font-heading font-bold text-xl text-white mb-2">Ready to Explore Programs?</h3>
        <p className="text-white/50 text-sm mb-6">Browse our interactive map and find the college rugby program that's right for you.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/map">
            <button className="inline-flex items-center gap-2 bg-white text-navy px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all">Explore the Map</button>
          </Link>
          <Link href="/colleges">
            <button className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all">Browse Colleges</button>
          </Link>
        </div>
      </div>

      {/* More Articles */}
      {otherArticles.length > 0 && (
        <section className="mt-16 pt-12 border-t border-gray-100">
          <h2 className="font-heading font-bold text-xl text-dark mb-6">More Articles</h2>
          <div className="space-y-4">
            {otherArticles.map(a => (
              <Link key={a.id} href={`/learn/${a.slug}`}>
                <div className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-navy bg-navy/5 px-2 py-0.5 rounded">{a.category}</span>
                    <h3 className="font-heading font-semibold text-sm text-dark mt-1.5 group-hover:text-navy transition-colors">{a.title}</h3>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-navy transition-colors flex-shrink-0 ml-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
