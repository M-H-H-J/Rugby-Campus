/** Set when a visitor gives an email in any unlock box. Opens coach emails and the training days. */
const EMAIL_KEY = 'rc_unlocked';
/** Set by the link in the training welcome email. Opens the training days only. */
const TRAINING_KEY = 'rc_training_unlocked';
/** Query parameter on the training link in the welcome email. */
export const TRAINING_EMAIL_PARAM = 'unlocked';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
const local = (): StorageLike | undefined => { try { return typeof localStorage !== 'undefined' ? localStorage : undefined; } catch { return undefined; } };

function read(key: string, s = local()): boolean {
  try { return s?.getItem(key) === 'true'; } catch { return false; }
}
function write(key: string, s = local()): void {
  try { s?.setItem(key, 'true'); } catch { /* private mode: unlocked for this visit only */ }
}

export const hasEmailUnlock = (s?: StorageLike) => read(EMAIL_KEY, s ?? local());
export const rememberEmailUnlock = (s?: StorageLike) => write(EMAIL_KEY, s ?? local());
export const hasTrainingUnlock = (s?: StorageLike) => read(TRAINING_KEY, s ?? local()) || read(EMAIL_KEY, s ?? local());
export const rememberTrainingUnlock = (s?: StorageLike) => write(TRAINING_KEY, s ?? local());
