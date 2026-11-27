import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { call, mockEnv } from './helpers';
import foundUs, { cleanDetail } from '../../api/found-us';

type Sent = { url: string; headers: Record<string, string>; body: any };
let sent: Sent[] = [];
function mockFetch(status = 201) {
  sent = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: any) => { sent.push({ url, headers: init.headers, body: JSON.parse(init.body) }); return { ok: status < 300, status, json: async () => ({}) }; }));
}
const RID = 'a1b2c3d4e5f6a1b2c3d4e5f6';
const ok = { rid: RID, channel: 'google', context: 'coach_unlock' };
const DB = { SUPABASE_URL: 'https://db.example.supabase.co/', SUPABASE_SERVICE_ROLE_KEY: 'service-key' };

let logs: string[] = [];
beforeEach(() => {
  mockEnv(); delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  logs = [];
  vi.spyOn(console, 'log').mockImplementation((m: string) => { logs.push(m); });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('/api/found-us', () => {
  it('rejects anything that is not a known choice from a known box, and GETs', async () => {
    for (const body of [{}, { ...ok, rid: 'short' }, { ...ok, rid: RID.toUpperCase() }, { ...ok, channel: 'tiktok' }, { ...ok, context: 'search_shortlist' }, { ...ok, channel: ['google'] }]) {
      expect((await call(foundUs as never, body)).code, JSON.stringify(body)).toBe(400);
    }
    expect((await call(foundUs as never, ok, {}, 'GET')).code).toBe(405);
    expect((await call(foundUs as never, ok, { 'content-type': 'text/plain' })).code).toBe(415);
    expect((await call(foundUs as never, ok, { origin: 'https://evil.example' })).code).toBe(403);
  });
  it('honeypot: pretends success and stores nothing', async () => {
    mockEnv(DB); mockFetch();
    const r = await call(foundUs as never, { ...ok, website: 'bot' });
    expect(r.body).toEqual({ ok: true, saved: false });
    expect(sent).toHaveLength(0);
  });
  it('no database keys: logs the answer (no email, no IP) and still answers 200', async () => {
    const r = await call(foundUs as never, ok);
    expect(r.code).toBe(200);
    expect(r.body).toEqual({ ok: true, saved: false });
    const line = logs.find((l) => l.startsWith('FOUND_US '))!;
    expect(JSON.parse(line.slice(9))).toMatchObject({ rid: RID, channel: 'google', context: 'coach_unlock' });
    expect(line).not.toContain('203.0.113.7');
  });
  it('with keys: upserts by rid into found_us_responses with the service key', async () => {
    mockEnv(DB); mockFetch();
    const r = await call(foundUs as never, { ...ok, channel: 'ai_assistant', detail: 'Claude: best D1A colleges for a flanker' });
    expect(r.body).toEqual({ ok: true, saved: true });
    expect(sent[0].url).toBe('https://db.example.supabase.co/rest/v1/found_us_responses?on_conflict=rid');
    expect(sent[0].headers.Prefer).toBe('resolution=merge-duplicates,return=minimal');
    expect(sent[0].headers.apikey).toBe('service-key');
    expect(sent[0].body).toEqual({ rid: RID, channel: 'ai_assistant', context: 'coach_unlock', ai_detail: 'Claude: best D1A colleges for a flanker' });
  });
  it('a free-text note is only kept for AI assistant, and loses emails, phones and links', async () => {
    mockEnv(DB); mockFetch();
    await call(foundUs as never, { ...ok, channel: 'reddit', detail: 'ignored' });
    expect(sent[0].body).not.toHaveProperty('ai_detail');
    expect(cleanDetail('ChatGPT, me@kid.com, +61 412 345 678, https://x.co/a')).toBe('ChatGPT, [email], [number], [link]');
    expect(cleanDetail('x'.repeat(500))!.length).toBe(300);
    expect(cleanDetail('   ')).toBeNull();
    expect(cleanDetail(42)).toBeNull();
  });
  it('table not created yet (404): still 200, saved false, and the answer goes to the logs', async () => {
    mockEnv(DB); mockFetch(404);
    const r = await call(foundUs as never, ok);
    expect(r.code).toBe(200);
    expect(r.body.saved).toBe(false);
    expect(logs.some((l) => l.startsWith('FOUND_US '))).toBe(true);
  });
  it('rate-limited per IP', async () => {
    let last = 0;
    for (let i = 0; i < 25; i++) last = (await call(foundUs as never, ok)).code;
    expect(last).toBe(429);
  });
});
