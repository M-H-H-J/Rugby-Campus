import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const insertResult: { error: { message: string; code?: string } | null } = { error: null };
const inserts: { table: string; row: unknown }[] = [];
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => ({ insert: (row: unknown) => { inserts.push({ table, row }); return Promise.resolve(insertResult); } }),
  }),
}));

import { captureEmail, submitContact } from '@/lib/supabase';

const src = (p: string) => readFileSync(resolve(__dirname, '../../..', p), 'utf8');
let posts: { url: string; body: any }[] = [];
function mockApi(ok: boolean, json: Record<string, unknown> = {}) {
  posts = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: any) => { posts.push({ url, body: JSON.parse(init.body) }); return { ok, json: async () => json }; }));
}
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => { inserts.length = 0; insertResult.error = null; vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('bug hunt S7: forms only say "done" when something was saved', () => {
  it('newsletter: a failed insert returns false and sends no thank-you email', async () => {
    mockApi(true); insertResult.error = { message: 'new row violates row-level security policy', code: '42501' };
    expect(await captureEmail('a@b.co', 'newsletter')).toBe(false);
    await flush();
    expect(posts.length).toBe(0);
  });

  it('newsletter: a saved address returns true, then the thank-you goes out', async () => {
    mockApi(true);
    expect(await captureEmail('a@b.co', 'newsletter')).toBe(true);
    await flush();
    expect(posts.map((p) => p.url)).toEqual(['/api/welcome-email']);
    expect(posts[0].body).toEqual({ email: 'a@b.co', source: 'newsletter', website: '' });
  });

  it('newsletter: an address that is already on the list counts as saved', async () => {
    mockApi(true); insertResult.error = { message: 'duplicate key value violates unique constraint', code: '23505' };
    expect(await captureEmail('a@b.co', 'newsletter')).toBe(true);
  });

  it('for-coaches: fails only when neither the save nor the email to Hugh worked', async () => {
    const msg = { name: 'Coach', email: 'c@college.edu', type: 'featured_program', message: 'Hi' };
    insertResult.error = { message: 'down' }; mockApi(false);
    expect(await submitContact(msg)).toBe(false);
    insertResult.error = { message: 'down' }; mockApi(true, { ok: true, notified: true });
    expect(await submitContact(msg)).toBe(true);
    insertResult.error = { message: 'down' }; mockApi(true, { ok: true, notified: false });
    expect(await submitContact(msg)).toBe(false);
    insertResult.error = null; mockApi(false);
    expect(await submitContact(msg)).toBe(true);
  });

  it('every sign-up form shows an error on failure and has a busy state', () => {
    for (const f of ['src/components/ContactForm.tsx', 'src/components/Footer.tsx', 'src/pages/Home.tsx', 'src/pages/ArticlePage.tsx']) {
      const s = src(f);
      expect(s, f).toContain('useSaveState()');
      expect(s, f).toMatch(/=== 'failed' && <SaveError/);
      expect(s, f).toMatch(/disabled=\{(busy|state === 'busy'|subscribeState === 'busy')\}/);
    }
    expect(src('src/components/ContactForm.tsx')).not.toContain('within two days');
  });
});
