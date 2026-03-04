import { SELECTORS } from '../dom-selectors';

export function isActionBlocked(): boolean {
  const dialogs = document.querySelectorAll(SELECTORS.DIALOG);
  for (const dialog of dialogs) {
    const text = dialog.textContent ?? '';
    if (
      text.includes(SELECTORS.ACTION_BLOCKED_TEXT) ||
      text.includes(SELECTORS.TRY_AGAIN_TEXT)
    ) {
      return true;
    }
  }
  return false;
}

export function isRateLimited(): boolean {
  const body = document.body.textContent ?? '';
  return body.includes('Please wait') || body.includes('limit');
}

export function isLoggedOut(): boolean {
  return (
    window.location.pathname === '/accounts/login/' ||
    document.querySelector(SELECTORS.LOGIN_INPUT) !== null
  );
}

export function isNotFound(): boolean {
  const body = document.body.textContent ?? '';
  return body.includes("Sorry, this page isn't available");
}

export function detectError(): string | null {
  if (isActionBlocked()) return 'ACTION_BLOCKED';
  if (isRateLimited()) return 'RATE_LIMITED';
  if (isLoggedOut()) return 'LOGGED_OUT';
  if (isNotFound()) return 'NOT_FOUND';
  return null;
}
