import handler from '../../api/search-parse';
import { resetMemoryStore } from '../../api/_lib/store';

export interface FakeRes { code: number; body: any; headers: Record<string, any> }
export async function call(h: (req: any, res: any) => Promise<unknown>, body: unknown, headers: Record<string, string> = {}, method = 'POST'): Promise<FakeRes> {
  const out: FakeRes = { code: 200, body: null, headers: {} };
  const res = { status(n: number) { out.code = n; return res; }, json(b: unknown) { out.body = b; }, setHeader(k: string, v: unknown) { out.headers[k.toLowerCase()] = v; }, end() {} };
  await h({ method, headers: { 'x-forwarded-for': '203.0.113.7', ...headers }, body }, res);
  return out;
}
export const search = (sentence: unknown, headers: Record<string, string> = {}) => call(handler as never, { sentence }, headers);
export function mockEnv(extra: Record<string, string> = {}) {
  process.env.SEARCH_MOCK = '1'; process.env.SEARCH_ALLOW_MEMORY_STORE = 'true'; process.env.SEARCH_LOG_SINK = 'off';
  delete process.env.SEARCH_MONTHLY_CAP_USD; delete process.env.SEARCH_LIMIT_PER_HOUR; delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.KV_REST_API_URL;
  for (const [k, v] of Object.entries(extra)) process.env[k] = v;
  resetMemoryStore();
}
