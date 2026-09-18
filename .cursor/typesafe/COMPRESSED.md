# TypeSafe Jev — compressed API reference

Local working brain for TypeSafe’s System One model. Source: https://docs.typesafe.ai (fetched 2026-09-18) plus official skill https://github.com/typesafe-ai/skills. Live docs win if they disagree.

Jev is **not a chatbot**. It does not generate text, code, or explanations. You send **state** + typed **questions**; it returns **typed answers and calibrated probabilities** that code can branch on. Code owns the workflow.

---

## 1. What it is

- **Product:** TypeSafe AI. Flagship model **Jev**, first **System One** model.
- **System One:** fast, structured decisions for software (Kahneman System 1: snap judgments). Not System 2 reasoning, not an agent loop.
- **Training:** RLCD (Reinforcement Learning for Calibrated Decisions). Contrast: RLHF → chat; RLVR → slow reasoning.
- **Contract:** possible answers are defined in advance. The model never invents a value outside your options/levels. It cannot hallucinate a new string as the answer.
- **Latency:** typically ~70–500 ms; docs also say most queries ~100 ms; use-case map cites ~150 ms for real-time UI.
- **Cost:** **$0.042 / million input tokens**. Output tokens are **free**.
- **Access:** API key from https://console.typesafe.ai/settings/keys (also linked as `/keys`). Playground: https://console.typesafe.ai/playground. Contact: sales@typesafe.ai, privacy@typesafe.ai, Discord https://discord.com/invite/WUujKYBp8s.
- **Legal:** they say they do not train on user data. ZDR available for enterprise. DPA / MCA / privacy at typesafe.ai/legal/*.
- **Vercel AI Gateway:** third-party writeups mention `typesafe-ai/jev`; official docs here are the native API + official SDKs. Prefer native API unless we deliberately choose Gateway.

### Mental model (non-negotiable)

1. Keep control flow, math, lookups, side effects in **code**.
2. Ask **narrow, independent** questions. One snap judgment each.
3. **Batch** every question that shares the same state into **one** request (speculative fan-out).
4. Combine answers with **your** weights, thresholds, and `if`s.
5. Use **probabilities/confidence** to act, confirm, or escalate.
6. A second request is justified only when you need the first answer to fetch evidence, build new state, or choose the next option set.

---

## 2. HTTP API

Base URL: `https://api.typesafe.ai`

Auth on every call:

```
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Env: `TYPESAFE_API_KEY` (required). Optional: `TYPESAFE_BASE_URL`, `TYPESAFE_DEFAULT_MODEL`, `TYPESAFE_LOG_LEVEL`.

**This repo:** the key lives in gitignored **`AP.env`** at the repo root (`TYPESAFE_API_KEY=...`). Copy `AP.env.example`. Load it with `scripts/load-ap-env.mjs`. Confirm with `npm run typesafe:ping`. Never commit `AP.env`, never send the key to the browser, never print it in logs or PRs.

Request ID header on responses: `x-typesafe-request-id`.

### 2.1 `POST /v1/systemone`

Evaluate one `state` against a **map** of named questions. Answers come back under the **same keys**.

**Request**

```json
{
  "model": "jev-latest",
  "state": "Help! My payouts have been failing for 3 days.",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?",
      "criteria": { "true": "Explicitly time-sensitive", "false": "No urgency expressed" }
    }
  }
}
```

| Field | Required | Shape | Notes |
| --- | --- | --- | --- |
| `state` | yes | string \| object \| array | Content to judge. Text only. No images/audio/video. |
| `questions` | yes | `{ [id: string]: Question }` | Nonempty. **IDs are for your code only — not sent to the model.** Write the full question in `instructions`. |
| `model` | no | string | SDKs default to `jev-latest`. |

Do **not** send preview fields: `document`, `prompts`, `options`, `levels`, `key` on questions.

**Response**

```json
{
  "model": "jev-latest",
  "answers": { "is_urgent": { "type": "noul", "noul": 0.92 } },
  "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

`response.model` is the **versioned ID that actually ran** (log this). Aliases can move.

### 2.2 `GET /v1/models`

Lists names your account may send. Currently lists **aliases**. Versioned IDs such as `jev-1.13.0` are still accepted even if absent from the list.

Each card: `{ name, description, release_date }`.

### 2.3 Errors

JSON body + HTTP status.

| Status | Meaning |
| --- | --- |
| 400 | Bad request (JS/Python SDKs have a dedicated class) |
| 401 | Missing/invalid API key |
| 403 | Permission denied |
| 404 | Not found |
| 408 | Timeout (JS retries this) |
| 422 | Validation failed (missing field, malformed question). Body names the field. |
| 429 | Rate limit. Honor `Retry-After` / `retry-after-ms`. |
| 5xx | Server error |
| **529** | **Overloaded.** Retry with backoff (same as 429). |

SDKs retry 429 / 5xx (JS also 408 and 500–599, which includes 529) with exponential backoff by default.

---

## 3. Models, price, limits

Current flagship: **Jev 1.13** / id **`jev-1.13.0`**. Jaggedness notes last reviewed 2026-09-16.

| Alias | Points to | Meaning |
| --- | --- | --- |
| `jev-latest` | `jev-1.13.0` | Latest **stable**. SDK default. Use in examples. |
| `jev-preview` | `jev-1.13.0` | Latest including unofficial builds. **Currently same as latest.** |

Pin `jev-1.13.0` once you tune thresholds; aliases can move and change answers.

Python usage page also shows `TypeSafeClient(model="jev")` as an example string — prefer documented aliases/`jev-1.13.0`.

**Price (jev-1.13.0):** $42 / billion tokens = **$0.042 / million input tokens**. Output free.

**Rate limits (can change without notice):** 250,000 tokens/sec and 1,200 RPM. Over either → 429. Higher limits: enterprise / sales@typesafe.ai.

**Context (jev-1.13, jaggedness page — use this):**

- **64k tokens** total for all `state` + all `questions`
- **32k tokens** for `state` + the **longest single question**

Primitives page also says ~32k shared budget ≈ 150k characters of English. Pack many questions per call; state is paid once.

Jev **does** suffer context rot: extra unrelated state hurts accuracy. Filter in code first.

---

## 4. The three primitives

Mix freely in one call. Evaluated **in parallel and in isolation** against the **same state**. Adding questions barely changes latency; you pay extra question tokens only. Questions **cannot see each other’s answers**.

| Type | Ask when | `criteria` | Returns |
| --- | --- | --- | --- |
| **Choice** | one of a closed set, **unordered** | map `{ option: description \| null \| object \| array }` | `choice`, `probabilities`, `confidence` |
| **Score** | position on an **ordered** rubric | array of ≥2 descriptions (max **10**) | `score`, `legend`, `probabilities`, `confidence` |
| **Noul** | yes/no; probability **is** the signal | optional `{ true?, false? }` | `noul` (0–1) only — **no confidence field** |

`instructions` and criteria values are `EntryType`: `string | object | array | null`. Start with strings. Use objects when you need contrast (`what` / `not_for` / `examples`). Field names are yours; the model sees them.

Reference nested state with **backticked** paths: `` `ticket.messages[0].text` ``.

### 4.1 Choice

```json
"department": {
  "type": "choice",
  "instructions": "Which team should handle this?",
  "criteria": {
    "billing": "Payments, invoicing, refunds",
    "technical": "Bugs, outages, integrations",
    "sales": "Pricing, upgrades, new accounts"
  }
}
```

Answer:

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
  "confidence": 0.82
}
```

- `choice` = argmax of `probabilities` (sum to 1).
- Up to **255 options**. Include `other` / `none_of_the_above` when the list may not cover the input.
- Option **names and descriptions both go to the model**. IDs of questions do not.
- Use `null` descriptions only when the option name is already unambiguous.
- For similar options, structure criteria: `{ what, not_for, examples }`.
- Low confidence often means several options are plausible — inspect the **full distribution**, not just `choice`. A second-place probability of 0.38 is a real signal, not noise.

### 4.2 Score

```json
"frustration": {
  "type": "score",
  "instructions": "How frustrated is the customer?",
  "criteria": ["Calm", "Frustrated", "Very angry"]
}
```

Answer:

```json
{
  "type": "score",
  "score": 1.6,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
  "confidence": 0.78
}
```

- Levels are **0-indexed array positions**. You cannot skip levels.
- `score` = **expected value** Σ (level_index × P(level)). Can land **between** levels.
- Same score can come from different distributions (all mass on 1 vs 50/50 on 0 and 2). Always read `probabilities` + `confidence`.
- HTTP keys `legend`/`probabilities` as **strings** `"0"`, `"1"`. Python SDK keys them as **ints**.
- **2–10 levels.** Describe **situations**, not “mild/moderate/severe”. Each level is judged **alone**; the model does **not** see neighbors or numbers. `"worse than previous"` is useless. Numeric-only levels (`"0","1","2"`) fail.
- One dimension per Score. Split multi-factor judgments.
- **Do not interpolate Score to recover an exact magnitude** (jev-1.13 numerical calibration is weak). Threshold or round to nearest level is OK (entity-alignment cookbook rounds).
- Combine Scores in code: **normalize** `score / (n_levels - 1)` before weighting (different scales).

### 4.3 Noul

```json
"is_urgent": {
  "type": "noul",
  "instructions": "Does this convey urgency?",
  "criteria": { "true": "Explicitly time-sensitive", "false": "No urgency expressed" }
}
```

Answer: `{ "type": "noul", "noul": 0.92 }`

- `noul` = P(yes) ∈ [0, 1]. Near 1 yes, near 0 no, near **0.5 = uncertain**, **not** “medium intensity”.
- Phrase so high ≈ yes. Statement form (“the customer requests a refund”) is also valid; test both.
- Optional `criteria.true` / `criteria.false` when the boundary is subtle.
- Align instruction with criteria. Mapping `true`→no performs worse.
- Multi-label: **one Noul per label**, not one Choice of many labels that can co-occur.
- Threshold to boolean in code. Uncertain band e.g. 0.30–0.70 → human (cookbook illustration, not a universal law).

**Choice vs Noul vs Score:** “Is the candidate strong in Python?” is a bad Noul unless “strong” is defined. Use Score for skill level; Noul for a crisp fact (“resume states they used Python at work”).

---

## 5. Confidence vs probability

- **Choice/Score `confidence`:** a 0–1 **statistic of distribution peakedness**. Concentrated → high; flat → low. Convenient default; you can compute your own from `probabilities`.
- **Not** “probability the answer is correct”, **not** permission to act, **not** workflow quality.
- **Noul has no `confidence`.** Use distance from 0.5 (or an explicit uncertain band).
- Low Choice confidence can mean several **acceptable** alternatives — may still pick a harmless preference.
- v1 confidence **is a new formula** vs preview. Preview can be reproduced as `1 - H(p)/log(n)` (normalized Shannon entropy). Re-tune any old thresholds.
- Confidence 1.0 means all mass on one outcome. It is **not** a guarantee of truth.
- Gate by **stakes**: read-only action can fire at 0.6; irreversible money movement might need >0.85 plus confirm. Docs examples (0.3, 0.5, 0.6, 0.75, 0.8, 0.85, 0.9) are **starting points** — measure on **our** data.
- Hierarchical labels: if group confidence is low, report the parent (SIC cookbook: 0.9 cutoff; confident half 90% acc, unconfident 40% → 70% at division).

---

## 6. State

Pass what you’d hand a panel of experts.

| Shape | Use |
| --- | --- |
| string | One message/passage |
| object | Named fields, records, app state (preferred) |
| array | Sequences of messages/records |

```json
{
  "ticket": { "subject": "Duplicate charge", "messages": [{ "from": "customer", "text": "..." }] },
  "order": { "id": "A-104", "charges": [{ "amount_usd": 49, "status": "captured" }] },
  "refund_policy": "Duplicate charges are eligible for a refund."
}
```

Rules:

- State = facts. Questions = judgments. Don’t bury the question in the state.
- Send **only** what the questions need. Unrelated bulk drops accuracy.
- Jev is **text-only**.
- Keep inferred state distinct from observed facts; re-check if the world changed.
- Adversarial / injected instructions in state **can steer jev-1.13**. Be explicit in criteria; test attacks. State is not treated as hostile by default.

---

## 7. How to write questions

**Do**

- One coherent judgment a knowledgeable person could make in seconds.
- Complete meaning in `instructions` (IDs are invisible to the model).
- Closed sets: add `none`/`other`/`not_stated` when nothing may fit.
- For extraction: **code finds candidates**, Choice picks among them (model cannot choose an omitted span).
- Structured criteria when two options blur.
- Put questions **and thresholds in one module** so humans can review them.
- Ask speculative questions up front; ignore unused branches in code. State the speculative premise in the question (“If this is a shipping problem, which kind?”).

**Don’t**

- “Analyze this and decide the best course of action.”
- Hide several factors in one Score (“punctual and smart and experienced”).
- Sequential round-trips for independent questions.
- Force generation by chaining Choices for free text (slow and bad).
- Trust cookbook thresholds as universal.

**When a second request is warranted** (rare):

- Skill suggestion: rank 182, then re-read top 3 with full text.
- Structure recovery: stitch lines, then classify blocks that didn’t exist yet.
- Hierarchical classification: next option set depends on previous Choice.
- SDE cascade: cheap extract → verify → maybe expensive model.
- Citation/RAG: retrieve first, then judge evidence.

---

## 8. Patterns

| Pattern | Idea |
| --- | --- |
| **Speculative fan-out** | All questions in one call; code uses a subset. Extra questions ≈ free latency. |
| **Confidence-gated routing** | Answer = what; confidence = whether to act. Per-action thresholds. |
| **Composite scoring** | Atomic Scores/Nouls → normalize → weighted sum in code. Change weights without re-prompting. |
| **Intent routing** | Cheap classify, then DB / specialist LLM / human. Don’t send everything through an LLM. |

Also: keep deterministic rules in code (`days_overdue > 30`). Probabilities can become features for classical ML (CatBoost cookbook).

---

## 9. jev-1.13 jaggedness (known failure modes)

| Failure | Instead |
| --- | --- |
| Literal reading; misses implied intent | Write the exact condition; put boundary cases in criteria; split interpretation |
| Counting / arithmetic / hex colors / assembly | Do it in code. Per-item Noul + sum in code for “how many fruits” |
| Dates as quantities | Extract parts as Choice (`not_stated` option); compare/resolve in code |
| Indirection, double negatives, multi-hop | Direct questions; name the state field |
| Huge irrelevant state | Filter/retrieve first; optional Noul relevance filter |
| Adversarial content | Precise criteria; test jailbreaks |
| Contradictory instructions vs criteria | Align them; don’t invert true/false |
| Text generation | Use an LLM. Jev **selects**, it does not write |
| Score interpolation to recover a number | Don’t |

Avoid System Two / multi-hop “reason then decide” prompts. Avoid asking what regex/parser can compute.

---

## 10. TypeScript / JavaScript SDK (this repo’s stack)

```bash
npm install @typesafe-ai/sdk
```

Requires **Node 20+**. Package: ESM + CJS + types. Current public versions in docs: **v0.5.7** initial, **v0.6.0** (2026-09-15) **breaking:** `Score.criteria` is an **ordered array**, not a dict keyed by ints.

```ts
import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient(); // reads TYPESAFE_API_KEY
const { answers, model, usage } = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: "Payment or subscription issues",
      technical: "Bugs or integration problems",
      other: "Anything else",
    }),
    urgent: noul("The message conveys urgency"),
    frustration: score("How frustrated is the customer?", [
      "Calm, just stating facts",
      "Frustrated but civil",
      "Very angry, strong language",
    ]),
  },
});

answers.category.choice;      // typed union of keys
answers.urgent.noul;          // number
answers.frustration.score;    // number
```

Helpers:

- `choice(instructions, criteria) → ChoiceQuestion`
- `noul(instructions?, criteria?) → NoulQuestion`
- `score(instructions, criteria) → ScoreQuestion` — criteria length ≥ 2

`client.systemOne(request, options?)` → `APIPromise<SystemOneResult<Q>>` (answers inferred from questions).

**TypeSafeClientConfig**

| Option | Default / fallback |
| --- | --- |
| `apiKey` | `TYPESAFE_API_KEY` |
| `baseURL` | `TYPESAFE_BASE_URL` → `https://api.typesafe.ai` |
| `defaultModel` | `TYPESAFE_DEFAULT_MODEL` → `jev-latest` |
| `timeout` | **10000 ms per attempt** (no total retry budget) |
| `retry` | see below |
| `logLevel` | `TYPESAFE_LOG_LEVEL` → `warn`. `info` = summaries; `debug` = headers+bodies. Credential headers redacted; **bodies are not**. |
| `logger` | prefixed `console` |
| `fetch` | global `fetch` |
| `defaultHeaders` | extra headers |
| `dangerouslyAllowBrowser` | **false**. Do not ship the key to browsers. |

`client.models.list()` → `ModelCard[]` with `name`, `description`, `release_date`.

**RetryPolicy defaults (JS):** `maxRetries: 2`, `backoffInitialMs: 500`, `backoffMaxMs: 5000`, `backoffJitter: 0.25`, `httpStatuses: {408,429,500–599}`, `respectRetryAfter: true`, `maxRetryAfterMs: 60000`, retry connection + timeout errors: true.

**RequestOptions (per call):** `headers`, `retry`, `timeout`, `signal` (AbortSignal).

**APIPromise:** `.asResponse()` raw `Response` (don’t also await parsed body); `withResponse()` pattern via `WithResponse<T>`: `{ data, response, requestId }` from `x-typesafe-request-id`.

**JS errors:** `TypeSafeError` → `APIError` (`status`, `body`, `headers`, `requestId`) → `AuthenticationError`, `BadRequestError`, `PermissionDeniedError`, `NotFoundError`, `UnprocessableEntityError`, `RateLimitError`, `InternalServerError`; plus `APIConnectionError`, `APITimeoutError`, `APIUserAbortError`.

`SystemOneRequest.state` is `EntryType` (string | object | array | **null**). Extra request properties are forwarded (forward-compat).

Empty questions or Score criteria with fewer than 2 entries throw client-side.

---

## 11. Python SDK

```bash
pip install typesafe-sdk
# or: uv add typesafe-sdk
```

Python **≥ 3.10**. Package **`typesafe_sdk`** (not old `typesafe-client`). Versions: v0.5.7, v0.6.0 same Score-criteria breaking change.

```python
from typesafe_sdk import Choice, Noul, Score, NoulCriteria, TypeSafeClient, AsyncTypeSafeClient

with TypeSafeClient() as client:
    response = client.system_one(
        state=ticket,  # also allowed as first positional arg
        questions={
            "department": Choice(instructions="Which team?", criteria={"billing": "...", "technical": "..."}),
            "is_urgent": Noul(instructions="Conveys urgency", criteria=NoulCriteria(true="...", false="...")),
            "frustration": Score(instructions="Frustration", criteria=["Calm", "Frustrated", "Angry"]),
        },
        model="jev-latest",  # optional
    )

response.answers["department"].choice
response.choices["department"].choice
response.nouls["is_urgent"].noul
response.scores["frustration"].score
response.model
response.usage.input_tokens
response.request_id          # x-typesafe-request-id
response.raw_http_response   # httpx2.Response
```

- Sync: `TypeSafeClient` / `client.system_one`. Async: `AsyncTypeSafeClient` / `await client.system_one`.
- Constructor: `api_key`, `model`, `retry`, `timeout` (seconds, default **10.0**), `headers`, `transport` xor `http_client` (httpx2), `base_url`.
- Per-call: `model`, `retry`, `timeout`, `extra_headers`, `extra_body` (shallow merge; can override `state`/`model`/`questions`).
- Questions may be dataclasses **or** raw dicts (`{"type":"noul",...}`) mixed.
- Logger: `typesafe_sdk`. `TYPESAFE_LOG_LEVEL` = debug|info|warning|error|off. Bodies **not** redacted.
- Unknown answer kinds: warning + skip; inspect `raw_http_response.json()["answers"]`.
- RetryPolicy: `max_retries`, `backoff_initial`, `backoff_max`, `backoff_jitter`, `http_statuses`, `respect_retry_after`, `api_connection_error`, `api_timeout_error`, `exceptions`, `predicate`, `timeout` (total budget seconds). `RetryPolicy(max_retries=0)` disables.

**Python errors:** `TypeSafeError`; `TypeSafeAPIError` (`status`, `body`, `headers`, `endpoint`, `request_id`); `TypeSafeBadRequestError` 400; `TypeSafeAuthenticationError` 401; `TypeSafePermissionDeniedError` 403; `TypeSafeNotFoundError` 404; `TypeSafeUnprocessableEntityError` 422; `TypeSafeRateLimitError` 429 (`retry_after_ms`); `TypeSafeInternalServerError` 5xx; `TypeSafeAPIConnectionError`; `TypeSafeAPITimeoutError`; `TypeSafeAPIResponseValidationError` (`field_path` e.g. `answers.tone.confidence`).

**Old client mapping (do not use):** `typesafe-client` → `evaluate`/`document`/`prompts` is dead. New: `system_one`/`state`/`questions`; `.noul` not `.probability`; `.choice` not `.chosen`; `.score` not `.expectation`.

Cookbooks also install `cooksafe` from `--extra-index-url https://pypi.typesafe.ai/` (playground links + JSON cache). Not required for production.

---

## 12. Minimal HTTP (no SDK)

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": { "message": "I was charged twice." },
    "questions": {
      "billing": { "type": "noul", "instructions": "Is this about billing?" },
      "team": {
        "type": "choice",
        "instructions": "Which team should handle this?",
        "criteria": {
          "billing": "Payments and refunds",
          "technical": "Bugs and outages",
          "other": "Anything else"
        }
      },
      "frustration": {
        "type": "score",
        "instructions": "How frustrated is the customer?",
        "criteria": ["Calm", "Frustrated", "Very angry"]
      }
    }
  }'
```

On 429/529: exponential backoff; honor `Retry-After`.

---

## 13. Architecture for this project

Rugby Campus is a React + Vite site. If we call Jev:

- Call **server-side only** (Vite API route, serverless function, or backend). Never `dangerouslyAllowBrowser`.
- Keep question definitions + thresholds in **one TypeScript module**.
- Prefer `@typesafe-ai/sdk` over hand-rolled fetch unless we need something the SDK lacks (`extra` body fields can be forwarded).
- Batch college/article/ticket judgments: one state, many questions.
- Do not use Jev to write copy, invent coach names, or generate pages. Site rules still apply: never invent coaches, results, or scholarships; Jev does not generate those anyway.
- Validate on real examples; cookbook numbers (often `jev-1.12`) are historical.

---

## 14. Cookbook catalog (patterns, not copy-paste thresholds)

Official notebooks; many results from **jev-1.12** or jev-latest. Treat metrics as examples.

| Cookbook | Shape |
| --- | --- |
| [parallel_questions](https://docs.typesafe.ai/cookbooks/parallel_questions) | 13 questions on GDPR Wikipedia. Batch vs 13 calls: **12.2× cheaper, 10.0× faster**, answers unchanged. (Primitives page quotes 11.5× / 9.6× — use cookbook numbers.) |
| [fan-out / smart-home](https://docs.typesafe.ai/demos/smart-home) | Many speculative Choices; LLM only to split compound commands or chat. |
| [function_calling](https://docs.typesafe.ai/cookbooks/function_calling) | NL → function name + Literal args via Choice/Noul + confidence. |
| [pre_parsed_value_extraction](https://docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook) | Regex candidates → Choice pick → copy verbatim (no invented digits). |
| [date_extraction](https://docs.typesafe.ai/cookbooks/date_extraction_cookbook) | Choice over month/day/year/weekday/`not_stated`; calendar math in code; review if confidence < 0.60 (their gate). |
| [autoformat](https://docs.typesafe.ai/cookbooks/autoformat) | Pass1 Noul stitch wrapped lines; pass2 Choice block type. Never rewrite text. |
| [semantic_find](https://docs.typesafe.ai/cookbooks/semantic_find) | 218 ToS lines: Choice over line IDs (probs sum to 1 — winner even if none match) + Noul “does an answer exist?” |
| [rerank_typesafe](https://docs.typesafe.ai/cookbooks/rerank_typesafe) | BM25 top 30 → one question per pair. CLERC: top-1 5%→18%, top-10 38%→62%. |
| [classifying_rag_passages](https://docs.typesafe.ai/cookbooks/classifying_rag_passages) | Per passage: relevant / usable / contradicts premise / injection. Route in code; separate evidence vs conflict blocks. |
| [citation_check](https://docs.typesafe.ai/cookbooks/citation_check) | String-match quote; Choice supports/contradicts/says-nothing; confidence ≥ 0.8 auto-accept in their demo. |
| [llm_guardrails](https://docs.typesafe.ai/cookbooks/llm_guardrails) | Nouls for hazards + Score for harm; screen **in and out**. Thresholds in code. |
| [sde_cascade](https://docs.typesafe.ai/cookbooks/sde_cascade) | Cheap LLM extract → TypeSafe per-field Nouls → escalate to big reasoner if flags fire. Schema-valid ≠ true. |
| [hierarchical_classification](https://docs.typesafe.ai/cookbooks/hierarchical_classification) | Walk taxonomy with Choice; **beam search** K paths, length-normalized geometric mean. |
| [entity_alignment](https://docs.typesafe.ai/cookbooks/entity_alignment) | Score 3 ordered actions (unlink / curator / merge); round to nearest level; extra Nouls for curator. |
| [classification_using_confidence](https://docs.typesafe.ai/cookbooks/classification_using_confidence) | 75-way Choice; if low confidence, emit parent SIC division. |
| [skill_suggestion](https://docs.typesafe.ai/cookbooks/skill_suggestion) | Rank 182 skills + “need a skill?”; second call re-reads top 3 and may reject all. Wrong loads 16.8%→7.3%. |
| [consistency_noul](https://docs.typesafe.ai/cookbooks/consistency_noul_cookbook) | Repeatability; TypeSafe stdev ~0.0102; uncertain band 0.30–0.70. Fresh `uid` on repeats. |
| [consistency_choice](https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook) | Require P(top)≥0.60 else `uncertain`; agreement → 99.2% on auto subset. |
| [autoresearch_feature_discovery](https://docs.typesafe.ai/cookbooks/autoresearch_feature_discovery) | LLM proposes questions; TypeSafe → numeric features; CatBoost; loop on errors. |

Use-case map industries: support, recruiting, RAG, guardrails, model routing, semantic linting, claims, KYC, legal, marketplaces, ads, gaming, graphs, forecasting, etc.

---

## 15. Preview → v1 (do not mix)

| | Preview | v1 (use this) |
| --- | --- | --- |
| Endpoint | `POST /preview/evaluation` | `POST /v1/systemone` |
| Input | `document` | `state` (`document` **fails**) |
| Questions | `prompts[]` with `key` | `questions` map |
| Choice options | `options: [{option, description}]` | `criteria: {option: desc}` |
| Score levels | `levels: [{level, description}]` | `criteria: [desc, ...]` |
| Answers | `responses[]` | `answers` map |
| Noul value | `probability` | `noul` |
| Choice value | `chosen` | `choice` |
| Score value | `expectation` | `score` |
| Choice probs | array of `{option, probability}` | map |
| Score probs | absent | map over levels |
| Usage | `billing_units` | `input_tokens`, `output_tokens` |
| Python pkg | `typesafe-client` | `typesafe-sdk` |

---

## 16. Agent skill (official)

Install (one method only):

```bash
npx skills add typesafe-ai/skills --skill typesafe-ai
```

or Claude Code: `claude plugin marketplace add typesafe-ai/skills` then `claude plugin install typesafe@typesafe-ai`.

Local copy: `SKILL.md` in this folder. Live docs remain source of truth; this compressed file is the project cache.

Skill principles: code owns workflow; select don’t generate; ask independent questions together; keep policy in code; validate in-domain; don’t invent API fields (stale skill is a common cause).

---

## 17. Copy-paste: structured questions (Python shape, same JSON on the wire)

```python
from typesafe_sdk import Choice, Noul, NoulCriteria, Score, TypeSafeClient

questions = {
    "topic": Choice(
        instructions={
            "question": "Which team should handle `ticket.message`?",
            "focus": "Classify the customer's primary request.",
        },
        criteria={
            "billing": {
                "what": "Charges, invoices, refunds",
                "not_for": "Order tracking or account access",
                "examples": ["I was charged twice"],
            },
            "orders": {
                "what": "Order status, delivery, returns",
                "not_for": "Charges or account access",
                "examples": ["Where is my order?"],
            },
            "other": {"what": "Anything else", "not_for": None, "examples": []},
        },
    ),
    "refund_requested": Noul(
        instructions={
            "question": "Does the customer explicitly request a refund?",
            "inspect": "`ticket.message`",
        },
        criteria=NoulCriteria(
            true={"what": "Asks for money back", "examples": ["Please refund the duplicate"]},
            false={"what": "No refund/credit asked", "examples": ["Why was I charged twice?"]},
        ),
    ),
    "frustration": Score(
        instructions={"question": "How frustrated does the customer appear?", "inspect": "`ticket.message`"},
        criteria=[
            {"what": "Calm and matter-of-fact", "signals": ["Neutral wording"]},
            {"what": "Frustrated but civil", "signals": ["Annoyance, still constructive"]},
            {"what": "Very angry or threatening to leave", "signals": ["Hostile language", "Churn threat"]},
        ],
    ),
}
```

Equivalent TS: `choice(instructionsObject, criteriaObject)`, `noul(...)`, `score(...)`.

---

## 18. Hard “don’t invent” checklist

The HTTP body has **only**: `state`, `questions`, `model` (plus any documented `extra_body` we intentionally add).

A question has **only**: `type`, `instructions`, `criteria` (shape by type).

A noul answer has **only**: `type`, `noul`.

A choice answer has **only**: `type`, `choice`, `probabilities`, `confidence`.

A score answer has **only**: `type`, `score`, `legend`, `probabilities`, `confidence`.

Top-level response: `model`, `answers`, `usage`.

If a field is not in this list, it is not in the v1 API (unless live docs added it — check `raw/llms.txt` / docs.typesafe.ai).

---

## 19. Where to look next

- Index: `raw/llms.txt`
- Full dump: `raw/llms-full.txt`
- HTTP: https://docs.typesafe.ai/api.md
- JS SDK: https://docs.typesafe.ai/sdk/javascript.md
- Models: https://docs.typesafe.ai/models.md
- Jaggedness: https://docs.typesafe.ai/model-jaggedness/jev-1.13.md
- Build guide: https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md
