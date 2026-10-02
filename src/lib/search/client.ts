import { cleanSentence, parseFilters, type Filters } from './filters';

export interface ParseResult { ok: boolean; filters: Filters | null; reason?: string; message?: string }

/** Calls the Vercel function. Any failure just means "use the filter chips"; it never throws. */
export async function parseSentence(sentence: string): Promise<ParseResult> {
  const text = cleanSentence(sentence);
  if (text.length < 3) return { ok: false, filters: null, reason: 'bad_input', message: 'Type a short sentence about what you want in a college.' };
  try {
    const r = await fetch('/api/search-parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sentence: text }), credentials: 'same-origin' });
    let j: { ok?: boolean; filters?: unknown; reason?: string; message?: string } = {};
    try { j = await r.json(); } catch { /* not JSON (e.g. local dev without the function) */ }
    if (j.ok) return { ok: true, filters: parseFilters(j.filters) };
    return { ok: false, filters: null, reason: j.reason ?? 'unavailable', message: j.message ?? 'Sentence search is not available right now. Use the filters below.' };
  } catch {
    return { ok: false, filters: null, reason: 'unavailable', message: 'Sentence search is not available right now. Use the filters below.' };
  }
}

export async function sendShortlist(email: string, slugs: string[], sentence: string, website = ''): Promise<{ ok: boolean; emailed?: boolean; message?: string }> {
  try {
    const r = await fetch('/api/shortlist-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, slugs, sentence, website }) });
    const j = await r.json().catch(() => ({}));
    return { ok: !!j.ok, emailed: !!j.emailed, message: j.message };
  } catch { return { ok: false, message: 'Could not reach the server. Please try again.' }; }
}
