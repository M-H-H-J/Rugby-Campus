import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { College } from '@/data/colleges';
import { EXAMPLE_PROMPTS, emptyFilters, hasAnyFilter, type Filters } from '@/lib/search/filters';
import { describeFilters, search as runSearch, type Result } from '@/lib/search/match';
import { parseSentence } from '@/lib/search/client';
import { useFacts } from '@/lib/search/useFacts';
import FilterPanel from './FilterPanel';
import SearchResultCard from './SearchResultCard';
import ShortlistEmail from './ShortlistEmail';

const PAGE = 12;

export default function CollegeSearch({ colleges, initialSentence = '' }: { colleges: College[]; initialSentence?: string }) {
  const facts = useFacts();
  const [sentence, setSentence] = useState(initialSentence);
  const [lastSentence, setLastSentence] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: 'info' | 'warn'; text: string } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const ran = useRef(false);

  const bySlug = useMemo(() => new Map(colleges.map((c) => [c.slug, c])), [colleges]);

  const run = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setBusy(true); setNote(null); setShowAll(false);
    const r = await parseSentence(text);
    setBusy(false); setLastSentence(text);
    if (r.ok && r.filters) {
      setFilters(r.filters); setPicked([]);
      if (!hasAnyFilter(r.filters)) setNote({ kind: 'info', text: "We couldn't turn that into filters. Pick some below, or try wording like \"warm, engineering, under $60k\"." });
    } else {
      setNote({ kind: 'warn', text: r.message ?? 'Sentence search is not available right now. Use the filters below.' });
      setPanelOpen(true);
    }
  }, []);

  useEffect(() => { if (initialSentence && !ran.current) { ran.current = true; void run(initialSentence); } }, [initialSentence, run]);

  const outcome = useMemo(() => (facts ? runSearch(facts, filters) : null), [facts, filters]);
  const chips = describeFilters(filters);
  const active = !!outcome?.active;

  const dropChip = (key: string) => {
    const f = { ...filters } as Record<string, unknown>;
    if (key === 'where') { f.states = []; f.regions = []; }
    else f[key] = Array.isArray(f[key]) ? [] : null;
    setFilters(f as unknown as Filters);
  };
  const toggleUnique = (slug: string) => setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug].slice(0, 12)));

  const list: Result[] = outcome?.results ?? [];
  const fits = outcome?.fitsAll ?? [];
  const close = outcome?.close ?? [];
  const shownFits = active ? (showAll ? fits : fits.slice(0, PAGE)) : [];
  const shownClose = active ? (showAll ? close : close.slice(0, Math.max(0, PAGE - shownFits.length))) : [];

  const cards = (rows: Result[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {rows.map((r) => {
        const c = bySlug.get(r.slug); const f = facts?.[r.slug];
        if (!c || !f) return null;
        return <SearchResultCard key={r.slug} college={c} facts={f} result={r} filters={filters} selected={picked.includes(r.slug)} onToggle={() => toggleUnique(r.slug)} />;
      })}
    </div>
  );

  return (
    <section aria-label="Find colleges for you" className="mb-8">
      <h1 className="font-heading text-[36px] md:text-[48px] leading-[1.05] text-ink mb-2">What kind of college are you after?</h1>
      <p className="text-[15px] text-muted mb-5">Tell us in your own words. We'll find the programs that fit.</p>
      <form onSubmit={(e) => { e.preventDefault(); void run(sentence); }} className="flex flex-col sm:flex-row sm:items-end gap-3">
        <input value={sentence} onChange={(e) => setSentence(e.target.value.slice(0, 300))} maxLength={300} aria-label="Describe your ideal college"
          placeholder="Engineering, good rugby, mild winters" className="flex-1 min-w-0 bg-transparent border-b-2 border-ink py-2 font-heading text-[18px] sm:text-[22px] md:text-[26px] outline-none placeholder:text-faint" />
        <button disabled={busy || sentence.trim().length < 3} className="btn bg-gold text-dark px-5 py-2.5 rounded-md text-[14px] font-bold disabled:opacity-60">{busy ? 'Reading…' : 'Find colleges'}</button>
      </form>
      <p className="mt-4 text-[13px] text-muted">
        Try:{' '}
        {EXAMPLE_PROMPTS.map((p, i) => (
          <span key={p}>
            {i > 0 && <span className="text-faint"> · </span>}
            <button type="button" onClick={() => { setSentence(p); void run(p); }} className="underline decoration-dotted underline-offset-4 hover:text-ink">{p}</button>
          </span>
        ))}
      </p>
      <p className="text-[12px] text-muted mt-3">We keep the words you type, without your name or email, to improve this tool. Please don't include personal details.</p>
      {note && <p role="status" className="mt-3 text-[13px] text-ink">{note.text}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        {lastSentence && chips.length > 0 && <span className="text-[12px] text-muted">How we read your sentence:</span>}
        {chips.map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1 text-[13px] text-ink">
            {c.label}
            <button type="button" onClick={() => dropChip(c.key)} aria-label={`Remove ${c.label}`} className="text-faint hover:text-ink"><X size={12} /></button>
          </span>
        ))}
        {active && <button type="button" onClick={() => { setFilters(emptyFilters()); setPicked([]); setNote(null); }} className="text-[13px] text-navy font-medium">Clear</button>}
        <button type="button" onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen} className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-navy font-medium">
          <SlidersHorizontal size={14} /> {panelOpen ? 'Hide filters' : 'Pick filters yourself'}
        </button>
      </div>
      {lastSentence && filters.unparsed.length > 0 && <p className="mt-2 text-[12px] text-muted">We couldn't use: {filters.unparsed.map((u) => `"${u}"`).join(', ')}.</p>}
      {panelOpen && <div className="mt-4 rounded-lg bg-navy/[0.04] border border-line p-4 md:p-5"><FilterPanel filters={filters} onChange={setFilters} /></div>}

      {active && outcome && (
        <div className="mt-8" aria-live="polite">
          {outcome.fitsAllCount === 0 && <p className="text-[15px] text-ink mb-4">Nothing fits every one of your picks. These are the closest.</p>}
          {shownFits.length > 0 && (
            <>
              <h2 className="font-heading text-[22px] text-ink mb-4">Fits everything you picked ({outcome.fitsAllCount})</h2>
              {cards(shownFits)}
            </>
          )}
          {shownClose.length > 0 && (
            <>
              <h2 className={`font-heading text-[22px] text-ink mb-4 ${shownFits.length ? 'mt-8' : ''}`}>Close, but not everything ({close.length})</h2>
              {cards(shownClose)}
            </>
          )}
          {!showAll && list.length > PAGE && <button type="button" onClick={() => setShowAll(true)} className="mt-4 text-[13px] font-semibold text-navy">Show all {list.length}</button>}
          <p className="mt-4 text-[12px] text-muted">✓ fits · ✗ doesn't fit · ? we couldn't verify it, so it stays in.</p>
          <p className="mt-2 text-[11px] text-faint max-w-2xl">Costs are yearly, before scholarships. Rugby aid varies by school and is often limited or none, so ask the coach what's available. Data from US government sources and school pages, checked October 2026. Always confirm with the college.</p>
          <ShortlistEmail slugs={picked.length ? picked : list.filter((r) => !r.closest).slice(0, 6).map((r) => r.slug)} sentence={lastSentence} />
        </div>
      )}
    </section>
  );
}
