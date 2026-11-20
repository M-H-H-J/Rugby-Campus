import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { call, mockEnv, search } from './helpers';
import { writeSearchLog } from '../../api/_lib/logsink';
import vercel from '../../vercel.json';
import welcome from '../../api/welcome-email';
import contact from '../../api/contact';
import coaching from '../../api/coaching-enquiry';
import shortlist from '../../api/shortlist-email';
import searchParse from '../../api/search-parse';
import { isAllowedOrigin } from '../../api/_lib/http';
import { personName, stripLinks, textToHtml } from '../../api/_lib/mail';
import { FALLBACK_ALL_PER_HOUR, resetLimitWarning } from '../../api/_lib/limits';

type Sent = { url: string; headers: Record<string, string>; body: any };
let sent: Sent[] = [];
function mockFetch(ok = true) {
  sent = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: any) => { sent.push({ url, headers: init.headers, body: JSON.parse(init.body) }); return { ok, status: ok ? 200 : 500, json: async () => ({}) }; }));
}
const MAIL = { RESEND_API_KEY: 're_test', SHORTLIST_FROM: 'Hugh at Rugby Campus <hello@rugbycampus.org>' };
const resend = () => sent.filter((s) => s.url === 'https://api.resend.com/emails');

beforeEach(() => { mockEnv(); delete process.env.RESEND_API_KEY; delete process.env.SHORTLIST_FROM; delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY; delete process.env.SHORTLIST_SINK; delete process.env.API_ALLOWED_ORIGINS; });
afterEach(() => vi.unstubAllGlobals());

const ENDPOINTS: [string, (req: any, res: any) => Promise<unknown>, Record<string, unknown>][] = [
  ['welcome-email', welcome as never, { email: 'victim@example.com', source: 'newsletter' }],
  ['contact', contact as never, { email: 'victim@example.com', message: 'hi' }],
  ['coaching-enquiry', coaching as never, { firstName: 'A', lastName: 'B', age: '17', location: 'Ohio', position: 'Wing', email: 'victim@example.com', whatsapp: '+1 555 123 4567' }],
  ['shortlist-email', shortlist as never, { email: 'victim@example.com', slugs: ['brown-university'] }],
  ['search-parse', searchParse as never, { sentence: 'warm and cheap' }],
];

describe('bug hunt S4: cross-site posts are refused', () => {
  for (const [name, h, body] of ENDPOINTS) {
    it(`${name}: text/plain and form posts get 415 and send nothing`, async () => {
      mockEnv(MAIL); mockFetch();
      expect((await call(h, JSON.stringify(body), { 'content-type': 'text/plain;charset=UTF-8', origin: 'https://www.rugbycampus.org' })).code).toBe(415);
      expect((await call(h, body, { 'content-type': 'application/x-www-form-urlencoded', origin: 'https://www.rugbycampus.org' })).code).toBe(415);
      expect((await call(h, body, { 'content-type': '' })).code).toBe(415);
      expect(resend().length).toBe(0);
    });
    it(`${name}: another site's Origin or Referer gets 403`, async () => {
      mockEnv(MAIL); mockFetch();
      expect((await call(h, body, { origin: 'https://evil.example' })).code).toBe(403);
      expect((await call(h, body, { origin: 'null' })).code).toBe(403);
      expect((await call(h, body, { referer: 'https://evil.example/page' })).code).toBe(403);
      expect(resend().length).toBe(0);
    });
    it(`${name}: the live site is accepted`, async () => {
      mockEnv(MAIL); mockFetch();
      const r = await call(h, body, { origin: 'https://www.rugbycampus.org', referer: 'https://www.rugbycampus.org/colleges' });
      expect([200, 400]).toContain(r.code);
      expect(r.code).not.toBe(403);
    });
  }

  it('allowed origins: live domain, project previews, same host, localhost; nothing else', () => {
    expect(isAllowedOrigin('https://www.rugbycampus.org', 'x')).toBe(true);
    expect(isAllowedOrigin('https://rugbycampus.org', 'x')).toBe(true);
    expect(isAllowedOrigin('https://rugby-campus.vercel.app', 'x')).toBe(true);
    expect(isAllowedOrigin('https://rugby-campus-git-fix-hugh.vercel.app', 'x')).toBe(true);
    expect(isAllowedOrigin('https://preview.example.dev', 'preview.example.dev')).toBe(true);
    expect(isAllowedOrigin('http://localhost:3000', 'localhost:3000')).toBe(true);
    expect(isAllowedOrigin('http://www.rugbycampus.org', 'x')).toBe(false);
    expect(isAllowedOrigin('https://rugbycampus.org.evil.example', 'x')).toBe(false);
    expect(isAllowedOrigin('https://evil-rugby-campus.vercel.app', 'x')).toBe(false);
    expect(isAllowedOrigin('https://other-project.vercel.app', 'rugby-campus.vercel.app')).toBe(false);
    process.env.API_ALLOWED_ORIGINS = 'https://staging.rugbycampus.org';
    expect(isAllowedOrigin('https://staging.rugbycampus.org', 'x')).toBe(true);
  });
});

describe('bug hunt S5: visitor text never becomes a link in our emails', () => {
  const html = (m: Sent) => String(m.body.html);

  it('welcome-email ignores the article field and keys the once-per-address check on source + email only', async () => {
    mockEnv(MAIL); mockFetch();
    const bait = 'x". Your account is suspended, verify now at https://rugbycampus-verify.example/login';
    const r = await call(welcome as never, { email: 'victim@example.com', source: 'article_notify', article: bait });
    expect(r.body.emailed).toBe(true);
    expect(JSON.stringify(resend()[0].body)).not.toContain('rugbycampus-verify');
    for (let i = 0; i < 3; i++) await call(welcome as never, { email: 'victim@example.com', source: 'article_notify', article: 'other ' + i });
    expect(resend().length).toBe(1);
  });

  it('a failed send is not marked as sent, so the next try goes out', async () => {
    mockEnv(MAIL); mockFetch(false);
    expect((await call(welcome as never, { email: 'retry@example.com', source: 'newsletter' })).body.emailed).toBe(false);
    mockFetch(true);
    expect((await call(welcome as never, { email: 'retry@example.com', source: 'newsletter' })).body.emailed).toBe(true);
  });

  it('coaching auto-reply: a URL as the first name is dropped, the greeting stays plain', async () => {
    mockEnv(MAIL); mockFetch();
    const base = { lastName: 'B', age: '17', location: 'https://evil.example/where', position: 'Wing', email: 'victim@example.com', whatsapp: '+1 555 123 4567' };
    await call(coaching as never, { ...base, firstName: 'https://evil.example/pay' });
    const [toHugh, reply] = resend();
    expect(reply.body.text.startsWith('Hi there,')).toBe(true);
    expect(JSON.stringify(reply.body)).not.toContain('evil.example');
    expect(html(toHugh)).not.toContain('<a ');
    mockFetch();
    await call(coaching as never, { ...base, email: 'sam@example.com', firstName: "Seán O'Neil-Smith evil.example" });
    expect(resend()[1].body.text.startsWith("Hi Seán O'Neil-Smith,")).toBe(true);
  });

  it('contact: the copy to Hugh has no clickable visitor links', async () => {
    mockEnv(MAIL); mockFetch();
    await call(contact as never, { name: 'Sam', email: 'sam@x.com', type: 'general', message: 'see https://evil.example/pay now' });
    expect(html(resend()[0])).not.toContain('<a ');
  });

  it('shortlist: unknown slugs are dropped before anything is saved or sent', async () => {
    mockEnv({ ...MAIL, SUPABASE_URL: 'https://sb.example', SUPABASE_SERVICE_ROLE_KEY: 'srk' }); mockFetch();
    const r = await call(shortlist as never, { email: 'k@x.com', slugs: ['claim-your-scholarship-at-evil-example'] });
    expect(r.code).toBe(400);
    expect(sent.length).toBe(0);
    mockFetch();
    const ok = await call(shortlist as never, { email: 'k@x.com', slugs: ['claim-your-scholarship-at-evil-example', 'brown-university', 'toString', '__proto__'] });
    expect(ok.body.ok).toBe(true);
    const saved = sent.find((s) => s.url.endsWith('/shortlist_emails'));
    expect(saved?.body.slugs).toEqual(['brown-university']);
    expect(resend()[0].body.text).not.toMatch(/Claim Your Scholarship/i);
  });

  it('helpers: links, domains and emails are stripped; the auto-linker stops before punctuation', () => {
    expect(stripLinks('hello https://a.example/x www.b.example c.example d@e.co world')).toBe('hello world');
    expect(personName('Jo <img src=x onerror=1>')).not.toMatch(/[<>=]/);
    expect(personName('x'.repeat(100)).length).toBe(40);
    expect(textToHtml('see https://www.rugbycampus.org/colleges.')).toBe('<p>see <a href="https://www.rugbycampus.org/colleges">https://www.rugbycampus.org/colleges</a>.</p>');
    expect(textToHtml('pay "https://x.example/login"')).not.toContain('&quot;"');
    expect(textToHtml('https://x.example', false)).toBe('<p>https://x.example</p>');
  });
});

describe('bug hunt S6: email endpoints still have a limit without Upstash/KV', () => {
  const noStore = () => { mockEnv(MAIL); delete process.env.SEARCH_ALLOW_MEMORY_STORE; resetLimitWarning(); };

  it('falls back to a stricter in-memory per-IP limit and warns once', async () => {
    noStore(); mockFetch();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const codes: number[] = [];
    for (let i = 0; i < 7; i++) codes.push((await call(welcome as never, { email: `p${i}@b.co`, source: 'newsletter' })).code);
    expect(codes.slice(0, 5).every((c) => c === 200)).toBe(true);
    expect(codes[5]).toBe(429);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/RATE_LIMIT_FALLBACK/);
    warn.mockRestore();
  });

  it('caps all mail per instance per hour across many IPs', async () => {
    noStore(); mockFetch(); vi.spyOn(console, 'warn').mockImplementation(() => {});
    let last = 0;
    for (let i = 0; i < FALLBACK_ALL_PER_HOUR + 2; i++) last = (await call(contact as never, { email: `s${i}@x.com`, message: 'm' }, { 'x-forwarded-for': `198.51.100.${i}` })).code;
    expect(last).toBe(429);
  });

  it('shortlist-email uses the same limit (it had none without a store)', async () => {
    noStore(); mockFetch(); vi.spyOn(console, 'warn').mockImplementation(() => {});
    let last = 0;
    for (let i = 0; i < 4; i++) last = (await call(shortlist as never, { email: `k${i}@x.com`, slugs: ['brown-university'] })).code;
    expect(last).toBe(429);
  });

  it('welcome emails are de-duplicated in memory too', async () => {
    noStore(); mockFetch(); vi.spyOn(console, 'warn').mockImplementation(() => {});
    await call(welcome as never, { email: 'same@b.co', source: 'newsletter' });
    const r = await call(welcome as never, { email: 'same@b.co', source: 'newsletter' });
    expect(r.body.repeat).toBe(true);
    expect(resend().length).toBe(1);
  });
});

describe('bug hunt nitpicks (API)', () => {
  it('N1: a site-wide hourly ceiling holds even when every request drops the cookie', async () => {
    mockEnv({ SEARCH_LIMIT_PER_HOUR_ALL: '3' });
    const codes: number[] = [];
    for (let i = 0; i < 4; i++) codes.push((await search('warm and cheap', { 'x-forwarded-for': `198.51.100.${i}` })).code);
    expect(codes).toEqual([200, 200, 200, 429]);
    delete process.env.SEARCH_LIMIT_PER_HOUR_ALL;
  });

  it('N2: a failed Supabase log insert is reported, not silent', async () => {
    process.env.SEARCH_LOG_SINK = 'supabase'; process.env.SUPABASE_URL = 'https://sb.example'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'srk';
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    await writeSearchLog({ t: '', text: 'x', filters: null, ok: true, model: 'm', tokens_in: 0, tokens_out: 0, cost_usd: 0, ms: 0 });
    expect(err).toHaveBeenCalledWith('SEARCH_LOG supabase 404');
    err.mockRestore(); process.env.SEARCH_LOG_SINK = 'off';
  });

  it('N14: search-parse may run 30 seconds (two 9-second model attempts plus store calls)', () => {
    expect((vercel as { functions?: Record<string, { maxDuration?: number }> }).functions?.['api/search-parse.ts']?.maxDuration).toBe(30);
  });
});
