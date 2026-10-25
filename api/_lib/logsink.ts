// Anonymous search log. No IP, no cookie id, no name/email (text is scrubbed before it gets here).
// SEARCH_LOG_SINK=console (default, shows in Vercel logs)  |  supabase (needs the search_logs table + SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)  |  off
export interface SearchLog { t: string; text: string; filters: unknown; ok: boolean; reason?: string; model: string; tokens_in: number; tokens_out: number; cost_usd: number; ms: number }

export async function writeSearchLog(rec: SearchLog): Promise<void> {
  const sink = (process.env.SEARCH_LOG_SINK || 'console').toLowerCase();
  if (sink === 'off') return;
  try {
    if (sink === 'supabase' && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await fetch(process.env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/search_logs', {
        method: 'POST', signal: AbortSignal.timeout(3000),
        headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ sentence: rec.text, filters: rec.filters, ok: rec.ok, reason: rec.reason ?? null, model: rec.model, tokens_in: rec.tokens_in, tokens_out: rec.tokens_out, cost_usd: rec.cost_usd, ms: rec.ms }),
      });
      return;
    }
    console.log('SEARCH_LOG ' + JSON.stringify(rec));
  } catch { /* logging must never break search */ }
}
