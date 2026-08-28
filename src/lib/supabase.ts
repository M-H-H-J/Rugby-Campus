import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export type EmailSource = 'coach_unlock' | 'training_program' | 'newsletter' | 'article_notify';

/** Store a captured email. Falls back to console logging when Supabase isn't configured yet. */
export async function captureEmail(email: string, source: EmailSource): Promise<boolean> {
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
  const sb = getSupabase();
  if (!sb) {
    console.info('[RugbyCampus] contact (no DB configured):', msg);
    return true;
  }
  const { error } = await sb.from('contacts').insert(msg);
  if (error) { console.error('submitContact failed:', error.message); return false; }
  return true;
}
