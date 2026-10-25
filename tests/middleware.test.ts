import { afterEach, describe, expect, it } from 'vitest';
import middleware from '../middleware';

const basic = (user: string, pass: string) => 'Basic ' + btoa(`${user}:${pass}`);
const req = (auth?: string) =>
  new Request('https://www.rugbycampus.org/colleges', auth ? { headers: { authorization: auth } } : {});

describe('password gate middleware', () => {
  afterEach(() => { delete process.env.SITE_PASSWORD; });

  it('is open when SITE_PASSWORD is unset', async () => {
    expect(await middleware(req())).toBeUndefined();
  });

  it('returns 401 with Basic challenge and noindex when no credentials', async () => {
    process.env.SITE_PASSWORD = 'test-pass';
    const res = await middleware(req());
    expect(res?.status).toBe(401);
    expect(res?.headers.get('www-authenticate')).toContain('Basic realm="Rugby Campus"');
    expect(res?.headers.get('x-robots-tag')).toContain('noindex');
  });

  it('rejects a wrong password', async () => {
    process.env.SITE_PASSWORD = 'test-pass';
    expect((await middleware(req(basic('anyone', 'nope'))))?.status).toBe(401);
  });

  it('accepts the right password with any username', async () => {
    process.env.SITE_PASSWORD = 'test-pass';
    expect(await middleware(req(basic('whoever', 'test-pass')))).toBeUndefined();
  });

  it('handles passwords containing colons and dots', async () => {
    process.env.SITE_PASSWORD = 'a.b:c';
    expect(await middleware(req(basic('x', 'a.b:c')))).toBeUndefined();
  });

  it('rejects garbage auth headers', async () => {
    process.env.SITE_PASSWORD = 'test-pass';
    expect((await middleware(req('Basic !!!notbase64')))?.status).toBe(401);
  });
});
