// POST /api/found-us { rid, channel, context, detail?, website (honeypot) }
// The optional "How did you find us?" answer from a sign-up confirmation. Anonymous: no email, name, IP or cookie id is
// stored. The same rid updates its own row, so the optional AI follow-up never doubles a count.
// Sink: the found_us_responses table (supabase/manual/2026-11-27-wave2-found-us.sql) when SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are set, otherwise Vercel logs. If the table isn't there yet, it logs instead. Never fails the visitor.
import { readBody, send, type Req, type Res, rejectRequest } from './_lib/http.js';
import { overLimit } from './_lib/limits.js';
import { stripPII } from '../src/lib/search/filters.js';

export const CHANNELS = ['ai_assistant', 'google', 'reddit', 'coach_teammate', 'instagram_youtube', 'other'] as const;
export const CONTEXTS = ['coach_unlock', 'training_program', 'newsletter', 'article_notify'] as const;
export const DETAIL_MAX = 300;
const RID_RE = /^[a-f0-9]{24}$/;

export function cleanDetail(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  // eslint-disable-next-line no-control-regex
  const text = stripPII(v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, DETAIL_MAX).trim();
  return text || null;
}

export default async function handler(req: Req, res: Res) {
  if (rejectRequest(req, res)) return;
  const b = readBody(req);
  if (typeof b.website === 'string' && b.website.trim()) return send(res, 200, { ok: true, saved: false });
  const rid = typeof b.rid === 'string' ? b.rid : '';
  const channel = CHANNELS.find((c) => c === b.channel);
  const context = CONTEXTS.find((c) => c === b.context);
  if (!RID_RE.test(rid) || !channel || !context) return send(res, 400, { ok: false });
  if (await overLimit(req, 'fu', 20)) return send(res, 429, { ok: false });
  // Only the AI answer has a free-text follow-up.
  const row = { rid, channel, context, ...(channel === 'ai_assistant' ? { ai_detail: cleanDetail(b.detail) } : {}) };

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let saved = false;
  if (url && key) {
    const r = await fetch(url.replace(/\/$/, '') + '/rest/v1/found_us_responses?on_conflict=rid', {
      method: 'POST', signal: AbortSignal.timeout(3000),
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(row),
    }).catch(() => null);
    saved = !!r && r.ok;
    // 404 / 42P01: the SQL file hasn't been run yet.
    if (!saved) console.error('FOUND_US supabase ' + (r ? r.status : 'network'));
  }
  if (!saved) console.log('FOUND_US ' + JSON.stringify({ t: new Date().toISOString(), ...row }));
  return send(res, 200, { ok: true, saved });
}
