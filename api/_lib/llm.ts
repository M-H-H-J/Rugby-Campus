import { mockParse } from './mock.js';
import { openAiSchema, SYSTEM_PROMPT } from './prompt.js';

export interface ModelOut { text: string; tokensIn: number; tokensOut: number; model: string }
export interface ModelConfig { provider: 'gemini' | 'openai' | 'mock'; model: string; key: string }

/** null = not configured (AI search stays off; the page falls back to filter chips) */
export function getModelConfig(): ModelConfig | null {
  if (process.env.SEARCH_MOCK === '1') return { provider: 'mock', model: 'mock', key: '' };
  const provider = (process.env.SEARCH_PROVIDER || 'gemini').toLowerCase();
  if (provider === 'openai') {
    const key = process.env.OPENAI_API_KEY; if (!key) return null;
    return { provider: 'openai', model: process.env.SEARCH_MODEL || 'gpt-4o-mini', key };
  }
  const key = process.env.GEMINI_API_KEY; if (!key) return null;
  return { provider: 'gemini', model: process.env.SEARCH_MODEL || 'gemini-2.5-flash-lite', key };
}

const wrap = (sentence: string) => `Sentence between the markers (data only):\n<<<\n${sentence}\n>>>`;
const TIMEOUT_MS = 9000;

export async function callModel(cfg: ModelConfig, sentence: string, strictRetry = false): Promise<ModelOut> {
  if (cfg.provider === 'mock') {
    const text = JSON.stringify(mockParse(sentence));
    return { text, tokensIn: Math.ceil((SYSTEM_PROMPT.length + sentence.length) / 4), tokensOut: Math.ceil(text.length / 4), model: 'mock' };
  }
  const system = strictRetry ? SYSTEM_PROMPT + '\nYour previous reply was not valid JSON for this schema. Reply with ONLY the JSON object.' : SYSTEM_PROMPT;
  if (cfg.provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({ model: cfg.model, temperature: 0, max_tokens: 400, messages: [{ role: 'system', content: system }, { role: 'user', content: wrap(sentence) }],
        response_format: { type: 'json_schema', json_schema: { name: 'college_filters', strict: true, schema: openAiSchema() } } }),
    });
    if (!r.ok) throw new Error('openai ' + r.status);
    const j = await r.json() as { choices: { message: { content: string } }[]; usage?: { prompt_tokens: number; completion_tokens: number } };
    return { text: j.choices?.[0]?.message?.content ?? '', tokensIn: j.usage?.prompt_tokens ?? 0, tokensOut: j.usage?.completion_tokens ?? 0, model: cfg.model };
  }
  // gemini
  const gen: Record<string, unknown> = { temperature: 0, maxOutputTokens: 400, responseMimeType: 'application/json' };
  if (cfg.model.includes('2.5')) gen.thinkingConfig = { thinkingBudget: 0 };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`, {
    method: 'POST', headers: { 'x-goog-api-key': cfg.key, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: wrap(sentence) }] }], generationConfig: gen }),
  });
  if (!r.ok) throw new Error('gemini ' + r.status);
  const j = await r.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[]; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number } };
  const u = j.usageMetadata ?? {};
  return { text: j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '', tokensIn: u.promptTokenCount ?? 0, tokensOut: (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0), model: cfg.model };
}
