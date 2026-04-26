export function getAuthRedirectUrl() {
  if (typeof window === 'undefined') return 'https://naturalquill.one/auth/callback';
  return `${window.location.origin}/auth/callback`;
}
