const STORAGE_KEY = 'rc_email_unlocked';
const EMAIL_KEY = 'rc_user_email';

export function isEmailUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function unlockEmails(email: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(EMAIL_KEY, email);
  } catch {
    // localStorage not available — still works for session
  }
}

export function getStoredEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}
