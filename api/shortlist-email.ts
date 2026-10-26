// POST /api/shortlist-email { email, slugs[], sentence?, website (honeypot) }
// Saves the visitor's email + shortlist. No gating, no double opt-in (Hugh's decision). Optionally emails the list via Resend.
import { clientIp, hashed, readBody, send, type Req, type Res } from './_lib/http.js';
import { getStore } from './_lib/store.js';
import { sendMail, SITE } from './_lib/mail.js';
import { cleanSentence, stripPII } from '../src/lib/search/filters.js';

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const SLUG_RE = /^[a-z0-9-]{3,80}$/;

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { ok: false }); }
  const b = readBody(req);
  if (typeof b.website === 'string' && b.website.trim()) return send(res, 200, { ok: true, emailed: false }); // honeypot: pretend success
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const slugs = Array.isArray(b.slugs) ? [...new Set(b.slugs.filter((s): s is string => typeof s === 'string' && SLUG_RE.test(s)))].slice(0, 12) : [];
  if (!EMAIL_RE.test(email) || email.length > 254) return send(res, 400, { ok: false, message: 'That email address does not look right.' });
  if (slugs.length === 0) return send(res, 400, { ok: false, message: 'Nothing to send yet. Run a search first.' });
  const sentence = stripPII(cleanSentence(b.sentence));

  const store = getStore();
  if (store) {
    const hour = new Date().toISOString().slice(0, 13);
    const n = await store.incr(`sl:ip:${hashed(clientIp(req))}:${hour}`, 1, 3700).catch(() => 0);
    if (n > 5) return send(res, 429, { ok: false, message: 'Please try again a bit later.' });
  }

  const sbUrl = process.env.SUPABASE_URL, sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Default: Supabase when its server keys are present, otherwise the console. SHORTLIST_SINK=console forces the console.
  const sink = (process.env.SHORTLIST_SINK || (sbUrl && sbKey ? 'supabase' : 'console')).toLowerCase();
  let saved = false;
  if (sink === 'supabase' && sbUrl && sbKey) {
    const h = { apikey: sbKey, Authorization: `Bearer ${sbKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
    const base = sbUrl.replace(/\/$/, '') + '/rest/v1/';
    // the address itself is saved into email_subscribers (source 'search_shortlist') by the browser via captureEmail(), like the newsletter box
    const r = await fetch(base + 'shortlist_emails', { method: 'POST', headers: h, body: JSON.stringify({ email, slugs, sentence }) }).catch(() => null);
    saved = !!r && r.ok;
  } else {
    console.log('SHORTLIST ' + JSON.stringify({ t: new Date().toISOString(), slugs, sentence, email_hash: hashed(email) })); // never log the address itself
  }

  const title = (s: string) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  const list = slugs.map((s) => `- ${title(s)}: ${SITE}/colleges/${s}`).join('\n');
  const emailed = await sendMail({ to: email, subject: 'Your Rugby Campus shortlist', idempotencyKey: 'shortlist:' + hashed(email + '|' + slugs.join(',')),
    text: `Here are the colleges you picked:\n\n${list}\n\nCosts on the site are before any scholarship, so ask each coach what's on offer. Then email the coaches directly. A short note with your position, your highlights and your grades does more than you'd think. I've been the player sending those emails and the coach reading them.\n\nHugh, Rugby Campus` });
  return send(res, 200, { ok: true, emailed, saved });
}
