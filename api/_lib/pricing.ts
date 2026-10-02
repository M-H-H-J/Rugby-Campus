// $ per 1M tokens (list prices checked 2026-10-02). Override with SEARCH_PRICE_IN_PER_M / SEARCH_PRICE_OUT_PER_M.
export const PRICES: Record<string, { in: number; out: number }> = {
  'gemini-2.5-flash-lite': { in: 0.10, out: 0.40 },
  'gemini-3.1-flash-lite': { in: 0.25, out: 1.50 },
  'gemini-3.5-flash-lite': { in: 0.30, out: 2.50 },
  'gpt-4o-mini': { in: 0.15, out: 0.60 },
};
export function priceFor(model: string): { in: number; out: number } {
  const i = Number(process.env.SEARCH_PRICE_IN_PER_M), o = Number(process.env.SEARCH_PRICE_OUT_PER_M);
  if (i > 0 && o > 0) return { in: i, out: o };
  return PRICES[model] ?? { in: 0.30, out: 2.50 }; // unknown model: assume a pricier tier so the cap errs on the safe side
}
/** cost in micro-dollars (1e-6 USD), rounded up */
export function costMicros(model: string, tokensIn: number, tokensOut: number): number {
  const p = priceFor(model);
  return Math.ceil(tokensIn * p.in + tokensOut * p.out); // tokens * ($/1M) = micro-dollars
}
export function monthKey(d = new Date()): string { return d.toISOString().slice(0, 7); }
export function capMicros(): number {
  const usd = Number(process.env.SEARCH_MONTHLY_CAP_USD);
  return Math.round((usd > 0 ? usd : 10) * 1_000_000);
}
