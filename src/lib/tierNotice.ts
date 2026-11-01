// "Tiers are a guide" pop-up on /colleges. Shown once per browser; dismissal is remembered in localStorage.
export const TIER_NOTICE_KEY = 'rc_tier_notice_seen_v1';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function defaultStorage(): StorageLike | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

/** True until the visitor has clicked "I understand" in this browser. If storage is blocked, shows it each visit. */
export function shouldShowTierNotice(storage: StorageLike | null = defaultStorage()): boolean {
  try { return !storage || storage.getItem(TIER_NOTICE_KEY) !== '1'; } catch { return true; }
}

export function dismissTierNotice(storage: StorageLike | null = defaultStorage()): void {
  try { storage?.setItem(TIER_NOTICE_KEY, '1'); } catch { /* storage blocked: the notice will show again next visit */ }
}
