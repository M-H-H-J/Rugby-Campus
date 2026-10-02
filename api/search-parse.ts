// POST /api/search-parse  { sentence: string }  ->  { ok: true, filters } | { ok: false, reason, message }
// The model ONLY converts a sentence into filters. It never names colleges or answers questions.
import { callModel, getModelConfig } from './_lib/llm.js';
import { writeSearchLog } from './_lib/logsink.js';
import { capMicros, costMicros, monthKey } from './_lib/pricing.js';
import { clientIp, ensureSid, hashed, readBody, send, type Req, type Res } from './_lib/http.js';
import { getStore } from './_lib/store.js';
import { cleanSentence, FILTER_VERSION, parseFilters, stripPII } from '../src/lib/search/filters.js';

const num = (v: string | undefined, d: number) => { const n = Number(v); return n > 0 ? n : d; };
const MSG = {
  rate: "You've done a lot of searches this hour. Please try again soon. The filters below still work in the meantime.",
  cap: 'Sentence search is taking a rest for now. The filters below still work, and it will be back soon.',
  off: 'Sentence search is not switched on yet. Use the filters below.',
  bad: 'Type a short sentence about what you want in a college (up to 300 characters).',
  model: "We couldn't read that one. Try rewording it, or use the filters below.",
};

export default async function handler(req: Req, res: Res) {
  const t0 = Date.now();
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { ok: false, reason: 'method', message: 'POST only' }); }
  const body = readBody(req);
  const sentence = cleanSentence(body.sentence);
  if (sentence.length < 3) return send(res, 400, { ok: false, reason: 'bad_input', message: MSG.bad });

  const cfg = getModelConfig(); const store = getStore();
  if (!cfg || !store) return send(res, 503, { ok: false, reason: 'not_configured', message: MSG.off });

  // ---- per-visitor rate limit: cookie 10/hour AND ip 30/hour (shared school wifi), both env-tunable ----
  const sid = ensureSid(req, res); const ip = hashed(clientIp(req));
  const hour = new Date().toISOString().slice(0, 13);
  try {
    const [ck, ipn] = await Promise.all([store.incr(`rl:ck:${sid}:${hour}`, 1, 3700), store.incr(`rl:ip:${ip}:${hour}`, 1, 3700)]);
    if (ck > num(process.env.SEARCH_LIMIT_PER_HOUR, 10) || ipn > num(process.env.SEARCH_LIMIT_PER_HOUR_IP, 30)) {
      return send(res, 429, { ok: false, reason: 'rate_limited', message: MSG.rate });
    }
    // ---- monthly spend cap (hard): refuse when spend + a worst-case reserve would pass the cap ----
    const key = `spend:${monthKey()}`; const spent = await store.get(key);
    if (spent + 2000 > capMicros()) return send(res, 503, { ok: false, reason: 'cap', message: MSG.cap });

    let out: Awaited<ReturnType<typeof callModel>>; let filters: ReturnType<typeof parseFilters> = null; let tokensIn = 0; let tokensOut = 0; let model = cfg.model;
    for (let attempt = 0; attempt < 2 && !filters; attempt++) {
      try {
        out = await callModel(cfg, sentence, attempt === 1);
        tokensIn += out.tokensIn; tokensOut += out.tokensOut; model = out.model;
        let raw: unknown = null; try { raw = JSON.parse(out.text); } catch { raw = null; }
        if (raw && typeof raw === 'object') filters = parseFilters(raw);
      } catch (e) { if (attempt === 1) break; }
    }
    const micros = costMicros(model, tokensIn, tokensOut);
    if (micros > 0) await store.incr(key, micros, 40 * 86400);
    const cost_usd = micros / 1_000_000;
    const base = { t: new Date().toISOString(), text: stripPII(sentence), model, tokens_in: tokensIn, tokens_out: tokensOut, cost_usd, ms: Date.now() - t0 };
    if (!filters) {
      await writeSearchLog({ ...base, filters: null, ok: false, reason: 'model_failed' });
      return send(res, 200, { ok: false, reason: 'model_failed', message: MSG.model, filters: parseFilters({}) });
    }
    filters.version = FILTER_VERSION;
    await writeSearchLog({ ...base, filters, ok: true });
    return send(res, 200, { ok: true, filters });
  } catch {
    // store/model infrastructure problem: fail closed to the chips, never throw a stack to the visitor
    return send(res, 503, { ok: false, reason: 'unavailable', message: MSG.off });
  }
}
