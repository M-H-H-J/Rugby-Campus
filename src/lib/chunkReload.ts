import { lazy, type ComponentType } from 'react';

const RELOAD_KEY = 'rc_chunk_reload_at';
/** A second chunk failure within this window means the reload didn't help, so stop and show the error panel. */
const RELOAD_WINDOW_MS = 30_000;

const CHUNK_ERROR = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Loading (CSS )?chunk [\w-]+ failed|'text\/html' is not a valid JavaScript MIME type/i;

export function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  return CHUNK_ERROR.test(msg);
}

type SessionLike = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Reloads the page once after a redeploy removed the old hashed chunks.
 * Returns true when a reload was started, false when one already ran in the last 30 seconds.
 */
export function reloadOnce(
  storage: SessionLike | undefined = typeof sessionStorage !== 'undefined' ? sessionStorage : undefined,
  reload: () => void = () => window.location.reload(),
  now = Date.now(),
): boolean {
  try {
    const last = Number(storage?.getItem(RELOAD_KEY) ?? 0);
    if (last && now - last < RELOAD_WINDOW_MS) return false;
    storage?.setItem(RELOAD_KEY, String(now));
  } catch {
    // Storage blocked: reloading without a guard could loop, so don't.
    return false;
  }
  reload();
  return true;
}

/** `React.lazy` that reloads the page once when the chunk is gone after a deploy, instead of blanking the app. */
export function lazyWithReload<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() => factory().catch((err) => {
    if (isChunkLoadError(err) && reloadOnce()) return new Promise<{ default: T }>(() => {});
    throw err;
  }));
}
