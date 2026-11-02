/**
 * "Featured" label for any paid listing. Not used yet: no featured listing exists.
 * When one does, show this next to its name everywhere it appears (cards, map popup, college page).
 */
export default function FeaturedBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center rounded border border-gold-dark/40 bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-caps text-gold-dark ${className}`}>
      Featured
    </span>
  );
}
