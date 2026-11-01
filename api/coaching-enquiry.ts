// POST /api/coaching-enquiry { firstName, lastName, age, location, position, email, whatsapp, website (honeypot) }
// Sends: 1) the enquiry to hello@rugbycampus.org (reply-to = the player, so Hugh can just hit Reply),
// 2) a short auto-reply to the player. The browser also saves a copy to the contacts table (type 'coaching').
import { hashed, readBody, send, type Req, type Res } from './_lib/http.js';
import { overLimit } from './_lib/limits.js';
import { sendMail, HELLO } from './_lib/mail.js';

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const line = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { ok: false }); }
  const b = readBody(req);
  if (typeof b.website === 'string' && b.website.trim()) return send(res, 200, { ok: true, notified: false, replied: false });
  const firstName = line(b.firstName, 60), lastName = line(b.lastName, 60), age = line(b.age, 3);
  const location = line(b.location, 120), position = line(b.position, 60), whatsapp = line(b.whatsapp, 30);
  const email = line(b.email, 254).toLowerCase();
  const ageNum = Number(age);
  if (!firstName || !lastName || !location || !position || !EMAIL_RE.test(email)
    || !/^\d{1,3}$/.test(age) || ageNum < 8 || ageNum > 99 || whatsapp.replace(/\D/g, '').length < 7) return send(res, 400, { ok: false });
  if (await overLimit(req, 'ce', 5)) return send(res, 429, { ok: false });
  const key = 'coaching:' + hashed(email + '|' + whatsapp);
  const full = `${firstName} ${lastName}`;
  const notified = await sendMail({ to: HELLO, replyTo: email, idempotencyKey: key + ':n', subject: `Coaching enquiry: ${full}`,
    text: `Name: ${full}\nAge: ${age}\nWhere they live: ${location}\nPosition: ${position}\nEmail: ${email}\nWhatsApp: ${whatsapp}\n\nHit Reply to answer them directly.` });
  const replied = await sendMail({ to: email, idempotencyKey: key + ':r', subject: 'Thanks for your coaching enquiry',
    text: `Hi ${firstName},\n\nThanks — I'll be in touch on WhatsApp or email to set up an intro chat.\n\nHugh, Rugby Campus` });
  return send(res, 200, { ok: true, notified, replied });
}
