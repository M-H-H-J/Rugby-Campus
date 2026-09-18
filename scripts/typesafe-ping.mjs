/**
 * Confirm AP.env is loadable and GET /v1/models works.
 * Prints model names only — never the API key.
 */
import { loadApEnv } from "./load-ap-env.mjs";

const loaded = loadApEnv();
if (!loaded.ok) {
  if (loaded.reason === "missing") {
    console.error(`No AP.env at ${loaded.path}. Copy AP.env.example to AP.env and add TYPESAFE_API_KEY.`);
  } else {
    console.error("AP.env was found but TYPESAFE_API_KEY is empty.");
  }
  process.exit(1);
}

const base = (process.env.TYPESAFE_BASE_URL || "https://api.typesafe.ai").replace(/\/$/, "");
const res = await fetch(`${base}/v1/models`, {
  headers: { Authorization: `Bearer ${process.env.TYPESAFE_API_KEY}` },
});

if (!res.ok) {
  const requestId = res.headers.get("x-typesafe-request-id") || "none";
  console.error(`TypeSafe /v1/models failed: HTTP ${res.status} (request ${requestId})`);
  process.exit(1);
}

const body = await res.json();
const models = Array.isArray(body.models) ? body.models : body;
const names = (Array.isArray(models) ? models : [])
  .map((m) => (typeof m === "string" ? m : m?.name))
  .filter(Boolean);

console.log(`TypeSafe auth ok. Models: ${names.join(", ") || "(none listed)"}`);
