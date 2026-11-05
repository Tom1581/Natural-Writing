/**
 * Accounts with unlimited converter access. Checked only against a verified sign-in email,
 * never against an email sent in a request. Override with ADMIN_EMAILS (comma-separated).
 */
const DEFAULT_ADMIN_EMAILS = ['a15817348@gmail.com'];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const configured = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return (configured.length ? configured : DEFAULT_ADMIN_EMAILS).includes(
    email.trim().toLowerCase(),
  );
}

/** Educators who may review curriculum content (CONTENT_REVIEWER_EMAILS, comma-separated). Admins always can. */
export function isContentReviewerEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  if (isAdminEmail(email)) return true;
  return (process.env.CONTENT_REVIEWER_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.trim().toLowerCase());
}
