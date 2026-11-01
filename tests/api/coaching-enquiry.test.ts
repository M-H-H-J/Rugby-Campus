import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { call, mockEnv } from './helpers';
import handler from '../../api/coaching-enquiry';

type Sent = { url: string; headers: Record<string, string>; body: any };
let sent: Sent[] = [];
function mockFetch(ok = true) {
  sent = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: any) => { sent.push({ url, headers: init.headers, body: JSON.parse(init.body) }); return { ok, status: ok ? 200 : 500, json: async () => ({}) }; }));
}
const MAIL = { RESEND_API_KEY: 're_test', SHORTLIST_FROM: 'Hugh at Rugby Campus <hello@rugbycampus.org>' };
const resend = () => sent.filter((s) => s.url === 'https://api.resend.com/emails');
const good = { firstName: 'Sam', lastName: 'Lee', age: '18', location: 'Perth, Australia', position: 'Flanker', email: 'Sam@X.com', whatsapp: '+61 400 000 000' };

beforeEach(() => { mockEnv(); delete process.env.RESEND_API_KEY; delete process.env.SHORTLIST_FROM; });
afterEach(() => vi.unstubAllGlobals());

describe('coaching-enquiry', () => {
  it('emails hello@ with reply-to the player, and auto-replies in Hugh\'s voice', async () => {
    mockEnv(MAIL); mockFetch();
    const r = await call(handler as never, good);
    expect(r.body).toEqual({ ok: true, notified: true, replied: true });
    const [n, a] = resend();
    expect(n.body.to).toEqual(['hello@rugbycampus.org']); expect(n.body.reply_to).toBe('sam@x.com'); expect(n.body.from).toBe(MAIL.SHORTLIST_FROM);
    for (const t of ['Sam Lee', 'Age: 18', 'Perth, Australia', 'Flanker', 'WhatsApp: +61 400 000 000']) expect(n.body.text).toContain(t);
    expect(a.body.to).toEqual(['sam@x.com']); expect(a.body.text).toContain("I'll be in touch on WhatsApp or email to set up an intro chat");
    expect(n.headers['Idempotency-Key']).not.toBe(a.headers['Idempotency-Key']);
  });
  it('honeypot and bad input send nothing', async () => {
    mockEnv(MAIL); mockFetch();
    expect((await call(handler as never, { ...good, website: 'x' })).body.notified).toBe(false);
    for (const bad of [{ email: 'nope' }, { firstName: '' }, { age: 'abc' }, { age: '4' }, { whatsapp: '12' }, { position: '' }, { location: '' }]) {
      expect((await call(handler as never, { ...good, ...bad })).code).toBe(400);
    }
    expect((await call(handler as never, good, {}, 'GET')).code).toBe(405);
    expect(resend().length).toBe(0);
  });
  it('line breaks in names cannot add headers, and the IP limit applies', async () => {
    mockEnv(MAIL); mockFetch();
    await call(handler as never, { ...good, firstName: 'Sam\r\nBcc: x@y.com' });
    expect(resend()[0].body.subject).not.toMatch(/[\r\n]/);
    let last = 0; for (let i = 0; i < 7; i++) last = (await call(handler as never, { ...good, email: `p${i}@x.com` })).code;
    expect(last).toBe(429);
  });
  it('does nothing quietly when mail keys are missing', async () => {
    mockEnv(); mockFetch();
    expect((await call(handler as never, good)).body).toEqual({ ok: true, notified: false, replied: false });
  });
});
