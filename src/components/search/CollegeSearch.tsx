import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { College } from '@/data/colleges';
import { EXAMPLE_PROMPTS, emptyFilters, hasAnyFilter, parseFilters, type Filters } from '@/lib/search/filters';
import { describeFilters, search as runSearch, type Result } from '@/lib/search/match';
import { parseSentence } from '@/lib/search/client';
import { useFacts } from '@/lib/search/useFacts';
import { loadShortlist, readParam, saveShortlist, writeParams } from '@/lib/search/urlState';
import FilterPanel from './FilterPanel';
import SearchResultCard from './SearchResultCard';
import ShortlistEmail from './ShortlistEmail';
import PrivacyNote from '@/components/PrivacyNote';

const PAGE = 12;

function filtersFromUrl(): Filters | null {
  const raw = readParam('f');
  if (!raw) return null;
  try { return parseFilters(JSON.parse(raw)); } catch { return null; }
}

export default function CollegeSearch({ colleges, initialSentence = '', onActiveChange }: { colleges: College[]; initialSentence?: string; onActiveChange?: (active: boolean) => void }) {
  const facts = useFacts();
  const urlFilters = useRef(filtersFromUrl());
  const [sentence, setSentence] = useState(initialSentence);
  const [lastSentence, setLastSentence] = useState(urlFilters.current ? initialSentence : '');
  const [filters, setFilters] = useState<Filters>(urlFilters.current ?? emptyFilters());
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: 'info' | 'warn'; text: string } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [picked, setPicked] = useState<string[]>(() => loadShortlist());
  const ran = useRef(false);

  const bySlug = useMemo(() => new Map(colleges.map((c) => [c.slug, c])), [colleges]);

  const run = useCallback(async (text: string) => {
    if (text.trim().length < 3) { setNote({ kind: 'info', text: 'Type a few words about the college you want, for example "warm, engineering, under $60k".' }); return; }
    setBusy(true); setNote(null); setShowAll(false);
    const r = await parseSentence(text);
    setBusy(false); setLastSentence(text);
    if (r.ok && r.filters) {
      setFilters(r.filters);
      if (!hasAnyFilter(r.filters) && r.filters.residency == null) {
        setNote({ kind: 'info', text: "We couldn't turn that into filters. Pick some below, or try wording like \"warm, engineering, under $60k\"." });
        setPanelOpen(true);
      }
    } else {
      setNote({ kind: 'warn', text: r.message ?? 'Sentence search is not available right now. Use the filters below.' });
      setPanelOpen(true);
    }
  }, []);

  // A shared link with ?f= already has the filters, so it doesn't spend a model call.
  useEffect(() => {
    if (initialSentence && !ran.current && !urlFilters.current) { ran.current = true; void run(initialSentence); }
  }, [initialSentence, run]);

  useEffect(() => { saveShortlist(picked); }, [picked]);

  const outcome = useMemo(() => (facts ? runSearch(facts, filters) : null), [facts, filters]);
  const chips = describeFilters(filters);
  const active = !!outcome?.active;

  useEffect(() => {
    writeParams({ find: active ? lastSentence : null, f: active ? JSON.stringify(filters) : null });
  }, [active, filters, lastSentence]);
  useEffect(() => { onActiveChange?.(active); }, [active, onActiveChange]);

  const dropChip = (key: string) => {
    const f = { ...filters } as Record<string, unknown>;
    if (key === 'where') { f.states = []; f.regions = []; }
    else if (key === 'residency') { f.residency = null; f.home_state = null; }
    else f[key] = Array.isArray(f[key]) ? [] : null;
    setFilters(f as unknown as Filters);
  };
  const clearAll = () => { setFilters(emptyFilters()); setSentence(''); setLastSentence(''); setNote(null); };
  const togglePick = (slug: string) => setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug].slice(0, 12)));

  const list: Result[] = outcome?.results ?? [];
  const fits = outcome?.fitsAll ?? [];
  const close = outcome?.close ?? [];
  const shownFits = active ? (showAll ? fits : fits.slice(0, PAGE)) : [];
  const shownClose = active ? (showAll ? close : close.slice(0, Math.max(0, PAGE - shownFits.length))) : [];

  const cards = (rows: Result[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {rows.map((r) => {
        const c = bySlug.get(r.slug); const f = facts?.[r.slug];
        if (!c || !f) return null;
        return <SearchResultCard key={r.slug} college={c} facts={f} result={r} filters={filters} selected={picked.includes(r.slug)} onToggle={() => togglePick(r.slug)} />;
      })}
    </div>
  );

  return (
    <section aria-label="Find colleges for you" className="mb-8">
      <h2 className="font-heading text-[22px] md:text-[24px] leading-[1.1] text-ink mb-2">What kind of college are you after?</h2>
      <p className="text-[15px] text-muted mb-5">Tell us in your own words. We'll find the programs that fit.</p>
      <form onSubmit={(e) => { e.preventDefault(); void run(sentence); }} className="flex flex-col sm:flex-row sm:items-end gap-3">
        <input value={sentence} onChange={(e) => setSentence(e.target.value.slice(0, 300))} maxLength={300} aria-label="Describe your ideal college"
          placeholder="Engineering, good rugby, mild winters" className="flex-1 min-w-0 bg-transparent border-b-2 border-ink py-2 font-heading text-[18px] sm:text-[22px] md:text-[26px] outline-none placeholder:text-faint" />
        <button disabled={busy} className="btn bg-gold text-dark px-5 py-2.5 min-h-[44px] rounded-md text-[14px] font-bold">{busy ? 'Reading…' : 'Find colleges'}</button>
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
      <PrivacyNote className="mt-3">We keep the words you type, without your name or email, to improve this tool. Please don't include personal details.</PrivacyNote>
      {note && <p role="status" className="mt-3 text-[13px] text-ink">{note.text}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        {lastSentence && chips.length > 0 && <span className="text-[12px] text-muted">How we read your sentence:</span>}
        {chips.map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1 text-[13px] text-ink">
            {c.label}
            <button type="button" onClick={() => dropChip(c.key)} aria-label={`Remove ${c.label}`} className="text-muted hover:text-ink p-1"><X size={12} /></button>
          </span>
        ))}
        {active && <button type="button" onClick={clearAll} className="text-[13px] text-navy font-medium">Clear</button>}
        <button type="button" onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen} className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-navy font-medium min-h-[44px]">
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
              <h3 className="font-heading text-[22px] text-ink mb-4">Fits everything you picked ({outcome.fitsAllCount})</h3>
              {cards(shownFits)}
            </>
          )}
          {shownClose.length > 0 && (
            <>
              <h3 className={`font-heading text-[22px] text-ink mb-1 ${shownFits.length ? 'mt-10' : ''}`}>Other programs, best fit first ({close.length})</h3>
              <p className="text-[13px] text-muted mb-4">Each one misses something you picked, or has an answer we couldn't verify.</p>
              {cards(shownClose)}
            </>
          )}
          {!showAll && list.length > PAGE && <button type="button" onClick={() => setShowAll(true)} className="mt-6 min-h-[44px] text-[13px] font-semibold text-navy">Show all {list.length}</button>}
          <p className="mt-4 text-[12px] text-muted">✓ fits · ✗ doesn't fit · ? we couldn't verify it. Nothing is removed from the list.</p>
          <p className="mt-2 text-[11px] text-faint max-w-2xl">Costs are yearly, before scholarships. Rugby aid varies by school and is often limited or none, so ask the coach what's available. Data from US government sources and school pages, checked October 2026. Always confirm with the college.</p>
        </div>
      )}

      {(active || picked.length > 0) && (
        <section className="mt-8 border-t border-line pt-5 max-w-xl" aria-label="Your shortlist">
          <h3 className="font-heading text-[18px] text-ink mb-2">Your shortlist ({picked.length})</h3>
          {picked.length === 0 ? (
            <p className="text-[13px] text-muted">Tick "Add to my shortlist" on any college to build your list. It stays on this device.</p>
          ) : (
            <ul className="border-t border-line mb-2">
              {picked.map((slug) => (
                <li key={slug} className="flex items-center justify-between gap-3 border-b border-line text-[14px] text-ink">
                  <a href={`/colleges/${slug}`} className="py-2 hover:text-navy">{bySlug.get(slug)?.name ?? slug}</a>
                  <button type="button" onClick={() => togglePick(slug)} aria-label={`Remove ${bySlug.get(slug)?.name ?? slug} from shortlist`} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-ink"><X size={14} /></button>
                </li>
              ))}
            </ul>
          )}
          <ShortlistEmail slugs={picked} sentence={lastSentence} />
        </section>
      )}
    </section>
  );
}
