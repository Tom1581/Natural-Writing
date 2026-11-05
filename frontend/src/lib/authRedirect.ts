export function getAuthRedirectUrl() {
  if (typeof window === 'undefined') return 'https://naturalquill.one/auth/callback';
  return `${window.location.origin}/auth/callback`;
}

/**
 * Where /auth/callback should send someone after Google or an email-confirmation link.
 * Kept in localStorage, not sessionStorage, because confirmation links open in a new tab.
 * Only Writing Studio paths are honored; anything else falls back to the converter.
 */
const AUTH_NEXT_KEY = 'nq-auth-next';
const AUTH_NEXT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function rememberAuthNext(path: string) {
  try {
    localStorage.setItem(AUTH_NEXT_KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {
    /* storage unavailable: the callback falls back to the converter */
  }
}

/** Converter sign-ins clear any Writing Studio destination left by an unfinished studio sign-up. */
export function converterAuthRedirectUrl() {
  try {
    localStorage.removeItem(AUTH_NEXT_KEY);
  } catch {
    /* nothing stored */
  }
  return getAuthRedirectUrl();
}

export function takeAuthNext(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_NEXT_KEY);
    localStorage.removeItem(AUTH_NEXT_KEY);
    if (!raw) return null;
    const { path, at } = JSON.parse(raw) as { path?: unknown; at?: unknown };
    if (typeof path !== 'string' || typeof at !== 'number' || Date.now() - at > AUTH_NEXT_MAX_AGE_MS) return null;
    return /^\/($|learn(\/|$))/.test(path) ? path : null;
  } catch {
    return null;
  }
}
