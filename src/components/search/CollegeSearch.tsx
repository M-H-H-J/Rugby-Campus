import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { College } from '@/data/colleges';
import { EXAMPLE_PROMPTS, HARD_KEYS, emptyFilters, hasAnyFilter, type Filters } from '@/lib/search/filters';
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
  const hasHard = HARD_KEYS.some((k) => { const v = filters[k as keyof Filters]; return Array.isArray(v) ? v.length > 0 : v != null; });

  const dropChip = (key: string) => {
    const f = { ...filters } as Record<string, unknown>;
    f[key] = Array.isArray(f[key]) ? [] : null;
    setFilters(f as unknown as Filters);
  };
  const toggleUnique = (slug: string) => setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug].slice(0, 12)));

  const list: Result[] = outcome?.results ?? [];
  const shown = active ? (showAll ? list : list.slice(0, PAGE)) : [];

  return (
    <section aria-label="Find colleges for you" className="mb-8">
      <div className="bg-white border border-line rounded-lg p-4 md:p-5">
        <h2 className="font-heading text-[20px] md:text-[22px] text-ink mb-1">Describe what you want in a college</h2>
        <p className="text-[13px] text-muted mb-3">Type it like you'd say it. We turn it into filters, then show colleges from our own checked data. Nothing is made up.</p>
        <form onSubmit={(e) => { e.preventDefault(); void run(sentence); }} className="flex gap-2">
          <div className="flex items-center flex-1 bg-white border border-line rounded-md px-3 focus-within:border-navy">
            <Search size={15} className="text-faint shrink-0" />
            <input value={sentence} onChange={(e) => setSentence(e.target.value.slice(0, 300))} maxLength={300} aria-label="Describe your ideal college"
              placeholder="e.g. decent rugby, study maths, not freezing" className="flex-1 min-w-0 bg-transparent px-2 py-2.5 text-[14px] outline-none placeholder:text-faint" />
          </div>
          <button disabled={busy || sentence.trim().length < 3} className="btn bg-navy text-white px-4 rounded-md text-[13px] font-semibold disabled:opacity-60">{busy ? 'Reading…' : 'Search'}</button>
        </form>
        <div className="flex flex-wrap gap-1.5 mt-2.5" aria-label="Example searches">
          {EXAMPLE_PROMPTS.map((p) => (
            <button key={p} type="button" onClick={() => { setSentence(p); void run(p); }} className="text-[12px] text-muted border border-line rounded-full px-2.5 py-1 hover:border-navy/40 hover:text-ink bg-white">{p}</button>
          ))}
        </div>
        <p className="text-[11px] text-faint mt-2.5">We save what you type (never your name, email or IP address) to make search better. Please don't put personal details in the box.</p>
        {note && <p role="status" className={`mt-3 text-[13px] rounded-md px-3 py-2 border ${note.kind === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-gray-50 border-line text-muted'}`}>{note.text}</p>}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {lastSentence && chips.length > 0 && <span className="text-[12px] text-muted">How we read your sentence:</span>}
        {chips.map((c) => (
          <span key={c.key} className={`inline-flex items-center gap-1 text-[12px] rounded-full px-2.5 py-1 border ${c.hard ? 'bg-navy/5 border-navy/30 text-navy' : 'bg-white border-line text-ink'}`} title={c.hard ? 'Must-have: can remove colleges' : 'Nice-to-have: only changes the order'}>
            {c.label}
            <button type="button" onClick={() => dropChip(c.key)} aria-label={`Remove ${c.label}`} className="text-faint hover:text-ink"><X size={11} /></button>
          </span>
        ))}
        {active && <button type="button" onClick={() => { setFilters(emptyFilters()); setPicked([]); setNote(null); }} className="text-[12px] text-navy font-semibold">Clear</button>}
        <button type="button" onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen} className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-ink border border-line rounded-md px-2.5 py-1 bg-white hover:border-navy/40">
          <SlidersHorizontal size={12} /> {panelOpen ? 'Hide filters' : 'Pick filters yourself'}
        </button>
      </div>
      {lastSentence && filters.unparsed.length > 0 && <p className="mt-2 text-[12px] text-muted">We couldn't use: {filters.unparsed.map((u) => `"${u}"`).join(', ')}.</p>}
      {panelOpen && <div className="mt-3"><FilterPanel filters={filters} onChange={setFilters} /></div>}

      {active && outcome && (
        <div className="mt-5" aria-live="polite">
          {outcome.message && <p className="text-[13px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">{outcome.message}</p>}
          {!outcome.usedClosest && <p className="text-[12px] text-faint mb-3">{hasHard ? `${outcome.exactCount} ${outcome.exactCount === 1 ? 'college fits' : 'colleges fit'} your must-haves.` : `No must-haves picked, so all ${outcome.exactCount} programs are shown, best matches first.`} <span className="text-muted">✓ fits · ✗ doesn't fit · ? we couldn't verify it, so it stays in.</span></p>}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shown.map((r) => {
              const c = bySlug.get(r.slug); const f = facts?.[r.slug];
              if (!c || !f) return null;
              return <SearchResultCard key={r.slug} college={c} facts={f} result={r} filters={filters} selected={picked.includes(r.slug)} onToggle={() => toggleUnique(r.slug)} />;
            })}
          </div>
          {!showAll && list.length > PAGE && <button type="button" onClick={() => setShowAll(true)} className="mt-4 text-[13px] font-semibold text-navy">Show all {list.length}</button>}
          <p className="mt-4 text-[11px] text-faint max-w-2xl">Costs are yearly, before scholarships. Rugby recruits usually receive some aid, so ask the coach what's available. Data from US government sources and school pages, checked October 2026. Always confirm with the college.</p>
          <ShortlistEmail slugs={picked.length ? picked : list.filter((r) => !r.closest).slice(0, 6).map((r) => r.slug)} sentence={lastSentence} />
        </div>
      )}
    </section>
  );
}
