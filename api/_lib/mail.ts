// Sends one email through the Resend REST API. Never throws: returns true only if Resend accepted it.
// Off (returns false) until RESEND_API_KEY and SHORTLIST_FROM are set in Vercel.
export const HELLO = 'hello@rugbycampus.org';
export const SITE = (process.env.SITE_URL || 'https://www.rugbycampus.org').replace(/\/$/, '');

export interface Mail { to: string; subject: string; text: string; replyTo?: string; idempotencyKey?: string }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Plain text -> simple HTML: escaped, blank line = new paragraph, bare https links made clickable. */
export function textToHtml(text: string): string {
  return text.split(/\n{2,}/).map((p) => '<p>' + esc(p).replace(/\n/g, '<br>').replace(/(https:\/\/[^\s<]+)/g, '<a href="$1">$1</a>') + '</p>').join('');
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
      body: JSON.stringify({ from, to: [m.to], subject: m.subject, text: m.text, html: textToHtml(m.text), reply_to: m.replyTo ?? HELLO }),
    });
    if (!r.ok) console.error('RESEND ' + r.status);
    return r.ok;
  } catch { console.error('RESEND network error'); return false; }
}
