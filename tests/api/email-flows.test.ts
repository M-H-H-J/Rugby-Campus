import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { call, mockEnv } from './helpers';
import welcome, { welcomeCopy } from '../../api/welcome-email';
import contact from '../../api/contact';
import shortlist from '../../api/shortlist-email';
import { textToHtml } from '../../api/_lib/mail';

type Sent = { url: string; headers: Record<string, string>; body: any };
let sent: Sent[] = [];
function mockFetch(ok = true) {
  sent = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: any) => { sent.push({ url, headers: init.headers, body: JSON.parse(init.body) }); return { ok, status: ok ? 200 : 500, json: async () => ({}) }; }));
}
const MAIL = { RESEND_API_KEY: 're_test', SHORTLIST_FROM: 'Hugh at Rugby Campus <hello@rugbycampus.org>' };
const resend = () => sent.filter((s) => s.url === 'https://api.resend.com/emails');

beforeEach(() => { mockEnv(); delete process.env.RESEND_API_KEY; delete process.env.SHORTLIST_FROM; delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY; delete process.env.SHORTLIST_SINK; });
afterEach(() => vi.unstubAllGlobals());

describe('welcome-email', () => {
  it('sends one thank-you per source with from, reply-to and an idempotency key', async () => {
    mockEnv(MAIL); mockFetch();
    for (const source of ['newsletter', 'coach_unlock', 'training_program', 'article_notify']) {
      const r = await call(welcome as never, { email: 'Kid@Example.com', source, article: 'How to play' });
      expect(r.code).toBe(200); expect(r.body.emailed).toBe(true);
    }
    const m = resend(); expect(m.length).toBe(4);
    expect(m[0].body.from).toBe(MAIL.SHORTLIST_FROM); expect(m[0].body.to).toEqual(['kid@example.com']);
    expect(m[0].body.reply_to).toBe('hello@rugbycampus.org'); expect(m[0].headers['Idempotency-Key']).toMatch(/^welcome:newsletter:/);
    expect(m[2].body.text).toContain('/training'); expect(m[3].body.text).toContain('"How to play"');
  });
  it('same address + source twice sends once', async () => {
    mockEnv(MAIL); mockFetch();
    await call(welcome as never, { email: 'a@b.co', source: 'newsletter' });
    const r = await call(welcome as never, { email: 'a@b.co', source: 'newsletter' });
    expect(r.body.ok).toBe(true); expect(resend().length).toBe(1);
  });
  it('honeypot, bad input, no keys, failed send', async () => {
    mockEnv(MAIL); mockFetch();
    expect((await call(welcome as never, { email: 'a@b.co', source: 'newsletter', website: 'x' })).body.emailed).toBe(false);
    expect((await call(welcome as never, { email: 'nope', source: 'newsletter' })).code).toBe(400);
    expect((await call(welcome as never, { email: 'a@b.co', source: 'search_shortlist' })).code).toBe(400);
    expect(resend().length).toBe(0);
    mockEnv(); delete process.env.RESEND_API_KEY; mockFetch();
    expect((await call(welcome as never, { email: 'c@d.co', source: 'coach_unlock' })).body).toEqual({ ok: true, emailed: false });
    mockEnv(MAIL); mockFetch(false);
    const r = await call(welcome as never, { email: 'e@f.co', source: 'coach_unlock' });
    expect(r.code).toBe(200); expect(r.body.emailed).toBe(false);
  });
  it('rate limits per IP', async () => {
    mockEnv(MAIL); mockFetch(); let last = 0;
    for (let i = 0; i < 12; i++) last = (await call(welcome as never, { email: `p${i}@b.co`, source: 'newsletter' })).code;
    expect(last).toBe(429);
  });
  it('copy has no puff and article title cannot inject lines', () => {
    expect(welcomeCopy('newsletter').text).toContain('No spam');
    expect(welcomeCopy('article_notify').text).toContain("something worth sending");
    expect(textToHtml('<b>hi</b>')).toBe('<p>&lt;b&gt;hi&lt;/b&gt;</p>');
  });
});

describe('contact', () => {
  it('notifies hello@ with reply-to visitor, and auto-replies', async () => {
    mockEnv(MAIL); mockFetch();
    const r = await call(contact as never, { name: 'Sam', email: 'sam@x.com', type: 'coaching', message: 'Hi Hugh' });
    expect(r.body).toEqual({ ok: true, notified: true, replied: true });
    const [n, a] = resend();
    expect(n.body.to).toEqual(['hello@rugbycampus.org']); expect(n.body.reply_to).toBe('sam@x.com'); expect(n.body.text).toContain('Hi Hugh');
    expect(a.body.to).toEqual(['sam@x.com']); expect(a.body.subject).toBe('Got your message');
    expect(n.headers['Idempotency-Key']).not.toBe(a.headers['Idempotency-Key']);
  });
  it('honeypot, bad input, rate limit', async () => {
    mockEnv(MAIL); mockFetch();
    expect((await call(contact as never, { email: 'sam@x.com', message: 'x', website: 'y' })).body.notified).toBe(false);
    expect((await call(contact as never, { email: 'bad', message: 'x' })).code).toBe(400);
    expect((await call(contact as never, { email: 'sam@x.com', message: '' })).code).toBe(400);
    expect(resend().length).toBe(0);
    let last = 0; for (let i = 0; i < 7; i++) last = (await call(contact as never, { email: 'sam@x.com', message: 'm' + i })).code;
    expect(last).toBe(429);
  });
});

describe('shortlist save default', () => {
  it('uses Supabase automatically when the server keys exist, with no SHORTLIST_SINK', async () => {
    mockEnv({ ...MAIL, SUPABASE_URL: 'https://sb.example', SUPABASE_SERVICE_ROLE_KEY: 'srk' }); mockFetch();
    const r = await call(shortlist as never, { email: 'k@x.com', slugs: ['brown-university'] });
    expect(r.body).toMatchObject({ ok: true, saved: true, emailed: true });
    expect(sent.some((s) => s.url === 'https://sb.example/rest/v1/shortlist_emails')).toBe(true);
    expect(resend()[0].body.text).toContain('/colleges/brown-university');
    expect(resend()[0].headers['Idempotency-Key']).toMatch(/^shortlist:/);
  });
});
