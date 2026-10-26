// POST /api/welcome-email { email, source, article?, website (honeypot) }
// Sends a short thank-you for a sign-up box. The address itself is saved by the browser (captureEmail) before this is called,
// so a failed send never blocks a sign-up. Always answers 200 for valid input; `emailed` says whether Resend took it.
import { hashed, readBody, send, type Req, type Res } from './_lib/http.js';
import { overLimit, firstTime } from './_lib/limits.js';
import { sendMail, SITE } from './_lib/mail.js';

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
export type WelcomeSource = 'newsletter' | 'coach_unlock' | 'training_program' | 'article_notify';
const SOURCES: WelcomeSource[] = ['newsletter', 'coach_unlock', 'training_program', 'article_notify'];

export function welcomeCopy(source: WelcomeSource, article?: string): { subject: string; text: string } {
  switch (source) {
    case 'training_program': return { subject: 'Your 4-day program', text:
      `Here's the 4-day program: ${SITE}/training\n\nIt's what I'd give a player getting ready for college rugby. Lift with good form before you add weight, and don't skip the conditioning days.\n\nIf you want a program built around your position and your season, reply to this email.\n\nHugh` };
    case 'coach_unlock': return { subject: 'Coach emails unlocked', text:
      `You can now see coach emails on every college page: ${SITE}/colleges\n\nKeep your first email short: your position, your year, a highlight link and your grades. Coaches get a lot of these, and the clear ones get answered.\n\nHugh` };
    case 'article_notify': return { subject: "You'll get it when it's out", text:
      `Thanks. I'll email you when ${article ? `"${article}"` : 'the article'} goes up, and only when there's something worth sending.\n\nHugh` };
    default: return { subject: "You're on the list", text:
      `Thanks for signing up. I'll only email when there's something worth reading, like a new guide or a change to the college directory. No spam.\n\nHugh, Rugby Campus\n${SITE}` };
  }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { ok: false }); }
  const b = readBody(req);
  if (typeof b.website === 'string' && b.website.trim()) return send(res, 200, { ok: true, emailed: false }); // honeypot
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const source = SOURCES.find((s) => s === b.source);
  if (!EMAIL_RE.test(email) || email.length > 254 || !source) return send(res, 400, { ok: false });
  const article = typeof b.article === 'string' ? b.article.replace(/[\r\n<>]/g, ' ').trim().slice(0, 120) : undefined;
  if (await overLimit(req, 'we', 10)) return send(res, 429, { ok: false });
  const key = `welcome:${source}:${hashed(email + '|' + (article ?? ''))}`;
  if (!(await firstTime('we:once:' + key, 30))) return send(res, 200, { ok: true, emailed: false, repeat: true });
  const { subject, text } = welcomeCopy(source, article);
  const emailed = await sendMail({ to: email, subject, text, idempotencyKey: key });
  return send(res, 200, { ok: true, emailed });
}
