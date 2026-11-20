// Sends one email through the Resend REST API. Never throws: returns true only if Resend accepted it.
// Off (returns false) until RESEND_API_KEY and SHORTLIST_FROM are set in Vercel.
export const HELLO = 'hello@rugbycampus.org';
export const SITE = (process.env.SITE_URL || 'https://www.rugbycampus.org').replace(/\/$/, '');

/** linkify: false for mail that carries visitor text, so nothing they typed becomes a clickable link. */
export interface Mail { to: string; subject: string; text: string; replyTo?: string; idempotencyKey?: string; linkify?: boolean }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Stops before trailing punctuation and escaped quotes, so "see https://x/colleges." links to /colleges. */
const LINK = /(https:\/\/[^\s<&]*[^\s<&.,;:!?)'"])/g;
/** Plain text -> simple HTML: escaped, blank line = new paragraph, bare https links made clickable unless linkify is false. */
export function textToHtml(text: string, linkify = true): string {
  return text.split(/\n{2,}/).map((p) => {
    const body = esc(p).replace(/\n/g, '<br>');
    return '<p>' + (linkify ? body.replace(LINK, '<a href="$1">$1</a>') : body) + '</p>';
  }).join('');
}

const LINKISH = /:\/\/|^www\.|[\p{L}\p{N}-]\.[\p{L}]{2,}|@/iu;
/** Drops any word that looks like a URL, domain or email address, so visitor text can't carry a link. */
export function stripLinks(s: string): string {
  return s.split(/\s+/).filter((w) => w && !LINKISH.test(w)).join(' ');
}
/** A first name safe to put in an auto-reply: letters, spaces, hyphens, apostrophes and dots only, no links, 40 chars. */
export function personName(s: string): string {
  return stripLinks(s.normalize('NFKC')).replace(/[^\p{L}\p{M} '’.-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40).trim();
}

export function mailEnabled(): boolean { return !!(process.env.RESEND_API_KEY && process.env.SHORTLIST_FROM); }

export async function sendMail(m: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY, from = process.env.SHORTLIST_FROM;
  if (!key || !from) return false;
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  if (m.idempotencyKey) headers['Idempotency-Key'] = m.idempotencyKey.slice(0, 256);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers, signal: AbortSignal.timeout(6000),
      body: JSON.stringify({ from, to: [m.to], subject: m.subject, text: m.text, html: textToHtml(m.text, m.linkify !== false), reply_to: m.replyTo ?? HELLO }),
    });
    if (!r.ok) console.error('RESEND ' + r.status);
    return r.ok;
  } catch { console.error('RESEND network error'); return false; }
}
