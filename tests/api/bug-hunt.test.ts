import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { call, mockEnv } from './helpers';
import welcome from '../../api/welcome-email';
import contact from '../../api/contact';
import coaching from '../../api/coaching-enquiry';
import shortlist from '../../api/shortlist-email';
import searchParse from '../../api/search-parse';
import { isAllowedOrigin } from '../../api/_lib/http';
import { personName, stripLinks, textToHtml } from '../../api/_lib/mail';

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
