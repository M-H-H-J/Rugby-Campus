/**
 * Optional "How did you find us?" answer, asked only after a sign-up or unlock has already worked.
 * Anonymous: no email, name or IP goes with it. api/found-us.ts stores it; see supabase/manual/2026-11-27-wave2-found-us.sql.
 */
export const FOUND_US_CHANNELS = [
  { id: 'ai_assistant', label: 'AI assistant' },
  { id: 'google', label: 'Google' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'coach_teammate', label: 'Coach / teammate' },
  { id: 'instagram_youtube', label: 'Instagram / YouTube' },
  { id: 'other', label: 'Other' },
] as const;
export type FoundUsChannel = (typeof FOUND_US_CHANNELS)[number]['id'];
export const FOUND_US_CHANNEL_IDS: readonly string[] = FOUND_US_CHANNELS.map((c) => c.id);

/** The sign-up box the answer came from (the same names as EmailSource). */
export const FOUND_US_CONTEXTS = ['coach_unlock', 'training_program', 'newsletter', 'article_notify'] as const;
export type FoundUsContext = (typeof FOUND_US_CONTEXTS)[number];

export const FOUND_US_DETAIL_MAX = 300;

const KEY = 'rc_found_us';
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
const local = (): StorageLike | undefined => { try { return typeof localStorage !== 'undefined' ? localStorage : undefined; } catch { return undefined; } };

/** Asked once per browser: answered or dismissed, it doesn't come back. */
export function foundUsDone(s: StorageLike | undefined = local()): boolean {
  try { return !!s?.getItem(KEY); } catch { return false; }
}
export function markFoundUsDone(s: StorageLike | undefined = local()): void {
  try { s?.setItem(KEY, '1'); } catch { /* private mode: it may ask again next visit */ }
}

/** One id per answer, so the optional AI follow-up updates the same row instead of adding a second. */
export function newAnswerId(): string {
  const bytes = new Uint8Array(12);
  try { crypto.getRandomValues(bytes); } catch { for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256); }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export interface FoundUsAnswer { rid: string; channel: FoundUsChannel; context: FoundUsContext; detail?: string }

/** Never throws and never blocks anything: the visitor has already got what they signed up for. */
export async function sendFoundUs(a: FoundUsAnswer): Promise<boolean> {
  try {
    const r = await fetch('/api/found-us', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...a, website: '' }), keepalive: true });
    return r.ok;
  } catch { return false; }
}
