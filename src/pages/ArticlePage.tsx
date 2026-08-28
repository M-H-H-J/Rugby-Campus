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
      elements.push(<h3 key={i} className="font-heading text-[22px] text-ink mt-9 mb-3">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-heading text-[27px] text-ink mt-12 mb-4 leading-tight">{line.slice(3)}</h2>);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="font-heading text-[17.5px] font-semibold text-ink mt-5 mb-2">{line.slice(2, -2)}</p>);
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
            <li key={j} className="flex items-start gap-3 font-heading text-[17.5px] text-ink/85 leading-[1.7]">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-[11px] flex-shrink-0" />
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
            <li key={j} className="font-heading text-[17.5px] text-ink/85 leading-[1.7]">
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    } else {
      elements.push(<p key={i} className="font-heading text-[17.5px] text-ink/85 leading-[1.75] mb-5" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />);
    }
    i++;
  }

  return elements;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}



function ArticleMeta({ title, description }: { title: string; description: string }) {
  usePageMeta(title, description);
  return null;
}

function NotifyForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  if (done) return <p className="text-navy text-[14px] font-medium">You're on the list — we'll email you when it's live.</p>;
  return (
    <form className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto" onSubmit={async (e) => { e.preventDefault(); await captureEmail(email, 'article_notify'); setDone(true); }}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="flex-1 px-4 py-3 rounded-md border border-line text-[14px] outline-none focus:border-navy transition-colors" />
      <button type="submit" className="btn px-5 py-3 bg-navy text-white rounded-md text-[13px] font-semibold whitespace-nowrap">Notify me</button>
    </form>
  );
}

export default function ArticlePage() {
  const [, params] = useRoute('/learn/:slug');
  const article = params?.slug ? getArticleBySlug(params.slug) : undefined;

  if (!article) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 text-center">
        <h1 className="font-heading text-[28px] text-ink mb-4">Article not found</h1>
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
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-[13px] text-faint hover:text-navy transition-colors mb-8">
        <ArrowLeft size={14} /> Back to all articles
      </Link>

      {/* Article Header */}
      <header className="mb-10">
        <p className="kicker mb-3 text-gold-dark">{article.category} · {article.readTime}</p>
        <h1 className="font-heading text-[34px] md:text-[44px] text-ink leading-[1.08] mb-5">{article.title}</h1>
        <p className="font-heading text-[19px] text-muted leading-[1.6]">{article.excerpt}</p>
      </header>

      <hr className="border-line mb-10" />

      {/* Article Content */}
      {isComingSoon ? (
        <div className="border border-line rounded-lg p-10 text-center">
          <h2 className="font-heading text-[24px] text-ink mb-2">Still being written</h2>
          <p className="text-muted text-[14px] mb-7 max-w-md mx-auto leading-relaxed">
            Leave your email and it'll land in your inbox the day it's published.
          </p>
          <NotifyForm />
        </div>
      ) : (
        <article className="prose-custom">
          {renderContent(article.content)}
        </article>
      )}

      {/* Bottom CTA */}
      <div className="mt-14 pt-8 border-t border-line">
        <p className="font-heading text-[19px] text-ink mb-4">Ready to look at programs? Start with the map.</p>
        <Link href="/map">
          <button className="btn inline-flex items-center gap-2 bg-navy text-white px-5 py-3 rounded-md text-[13px] font-semibold">Open the interactive map <ArrowRight size={14} /></button>
        </Link>
      </div>

      {/* More Articles */}
      {otherArticles.length > 0 && (
        <section className="mt-16 pt-10 border-t border-line">
          <h2 className="font-heading text-[24px] text-ink mb-2">Keep reading</h2>
          <div>
            {otherArticles.map(a => (
              <Link key={a.id} href={`/learn/${a.slug}`}>
                <div className="group flex items-center justify-between py-5 border-b border-line cursor-pointer">
                  <div>
                    <p className="kicker text-gold-dark mb-1">{a.category}</p>
                    <h3 className="font-heading text-[18px] text-ink group-hover:text-navy transition-colors leading-snug">{a.title}</h3>
                  </div>
                  <ArrowRight size={16} className="text-faint group-hover:text-navy transition-colors flex-shrink-0 ml-6" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
