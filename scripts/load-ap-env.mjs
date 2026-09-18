/**
 * Load TypeSafe credentials from repo-root AP.env into process.env.
 * Never logs secret values. AP.env is gitignored.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const AP_ENV_PATH = resolve(ROOT, "AP.env");

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseApEnv(text) {
  const out = {};
  const lines = text.split(/\r?\n/);
  const nonempty = lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (nonempty.length === 1 && !nonempty[0].includes("=")) {
    out.TYPESAFE_API_KEY = stripQuotes(nonempty[0]);
    return out;
  }

  for (const line of nonempty) {
    const body = line.startsWith("export ") ? line.slice(7).trim() : line;
    const eq = body.indexOf("=");
    if (eq <= 0) continue;
    const key = body.slice(0, eq).trim();
    const value = stripQuotes(body.slice(eq + 1));
    if (key) out[key] = value;
  }
  return out;
}

export function loadApEnv({ overwrite = false } = {}) {
  if (!existsSync(AP_ENV_PATH)) {
    return { ok: false, reason: "missing", path: AP_ENV_PATH, keys: [] };
  }
  const parsed = parseApEnv(readFileSync(AP_ENV_PATH, "utf8"));
  const applied = [];
  for (const [key, value] of Object.entries(parsed)) {
    if (!value) continue;
    if (!overwrite && process.env[key]) continue;
    process.env[key] = value;
    applied.push(key);
  }
  const hasKey = Boolean(process.env.TYPESAFE_API_KEY);
  return {
    ok: hasKey,
    reason: hasKey ? "loaded" : "no_key",
    path: AP_ENV_PATH,
    keys: applied,
  };
}
