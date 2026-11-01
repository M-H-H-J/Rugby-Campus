import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export type EmailSource = 'coach_unlock' | 'training_program' | 'newsletter' | 'article_notify' | 'search_shortlist';

/** Store a captured email. Falls back to console logging when Supabase isn't configured yet. */
/** Fire-and-forget POST to one of our /api functions. Never throws, never awaited by the form. */
function ping(path: string, body: Record<string, unknown>): void {
  try { void fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, website: '' }), keepalive: true }).catch(() => {}); } catch { /* ignore */ }
}

export async function captureEmail(email: string, source: EmailSource, opts: { article?: string } = {}): Promise<boolean> {
  // search_shortlist gets its own email from /api/shortlist-email; every other box gets a short thank-you.
  if (source !== 'search_shortlist') ping('/api/welcome-email', { email, source, article: opts.article });
  const sb = getSupabase();
  if (!sb) {
    console.info(`[RugbyCampus] email captured (no DB configured): ${email} — ${source}`);
    return true;
  }
  const { error } = await sb.from('email_subscribers').insert({ email, source });
  if (error && !error.message.includes('duplicate')) {
    console.error('captureEmail failed:', error.message);
    return false;
  }
  return true;
}

export interface ContactMessage { name: string; email: string; type: string; message: string; }

export async function submitContact(msg: ContactMessage): Promise<boolean> {
  ping('/api/contact', { ...msg });
  const sb = getSupabase();
  if (!sb) {
    console.info('[RugbyCampus] contact (no DB configured):', msg);
    return true;
  }
  const { error } = await sb.from('contacts').insert(msg);
  if (error) { console.error('submitContact failed:', error.message); return false; }
  return true;
}


export interface CoachingEnquiry { firstName: string; lastName: string; age: string; location: string; position: string; email: string; whatsapp: string; website?: string }

/** Paid-coaching form. Emails Hugh via /api/coaching-enquiry and saves a copy to the existing contacts table (type 'coaching'). True if either worked. */
export async function submitCoachingEnquiry(q: CoachingEnquiry): Promise<boolean> {
  const mailed = fetch('/api/coaching-enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })
    .then(async (r) => r.ok && (await r.json().catch(() => ({}))).notified === true)
    .catch(() => false);
  const sb = getSupabase();
  const saved = sb && !q.website
    ? sb.from('contacts').insert({
      name: `${q.firstName} ${q.lastName}`, email: q.email, type: 'coaching',
      message: `Age: ${q.age}\nWhere they live: ${q.location}\nPosition: ${q.position}\nWhatsApp: ${q.whatsapp}`,
    }).then(({ error }) => !error, () => false)
    : Promise.resolve(false);
  const [a, b] = await Promise.all([mailed, saved]);
  return a || b;
}
