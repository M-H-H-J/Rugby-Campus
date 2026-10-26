// POST /api/contact { name, email, type, message, website (honeypot) }
// The message is saved to the contacts table by the browser first (submitContact). This only sends:
// 1) a notification to hello@rugbycampus.org (reply-to = the visitor, so Hugh can just hit Reply), 2) a short auto-reply to the visitor.
import { hashed, readBody, send, type Req, type Res } from './_lib/http.js';
import { overLimit } from './_lib/limits.js';
import { sendMail, HELLO } from './_lib/mail.js';

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const TYPES = ['placement', 'coaching', 'featured_program', 'general'];
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r/g, '').trim().slice(0, max) : '');

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { ok: false }); }
  const b = readBody(req);
  if (typeof b.website === 'string' && b.website.trim()) return send(res, 200, { ok: true, notified: false, replied: false });
  const email = clean(b.email, 254).toLowerCase();
  const name = clean(b.name, 100).replace(/\n/g, ' ');
  const message = clean(b.message, 5000);
  const type = TYPES.includes(String(b.type)) ? String(b.type) : 'general';
  if (!EMAIL_RE.test(email) || !message) return send(res, 400, { ok: false });
  if (await overLimit(req, 'ct', 5)) return send(res, 429, { ok: false });
  const key = 'contact:' + hashed(email + '|' + message);
  const notified = await sendMail({ to: HELLO, replyTo: email, idempotencyKey: key + ':n',
    subject: `Contact form (${type.replace('_', ' ')}): ${name || email}`,
    text: `From: ${name || '(no name)'} <${email}>\nType: ${type}\n\n${message}\n\nHit Reply to answer them directly.` });
  const replied = await sendMail({ to: email, idempotencyKey: key + ':r', subject: 'Got your message',
    text: `Thanks, I've got it and will reply myself, usually within a few days.\n\nHugh, Rugby Campus` });
  return send(res, 200, { ok: true, notified, replied });
}
