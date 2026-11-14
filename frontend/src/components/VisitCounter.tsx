'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';
import { readStudentSession } from '@/lib/learning/student';

/**
 * Counts page visits with Vercel Web Analytics, the one visit counter that runs on both halves of
 * the site (Google Analytics and ads stay on the humanizer side only). It sets no cookies, keeps
 * no visitor profile, and reports external referrers only.
 *
 * What leaves the browser is decided here, before anything is sent:
 * - query strings and fragments are always removed (sign-in tokens, payment ids, deep-link options);
 * - in Writing Studio, only the public pages listed below are counted;
 * - nothing is counted while a student is signed in with a code.
 */

/** Studio pages anyone can open. Pages that show a learner's work or an account are never counted. */
const STUDIO_PUBLIC = [
  '/learn/grades',
  '/learn/lessons',
  '/learn/practice',
  '/learn/prompts',
  '/learn/rubrics',
  '/learn/examples',
  '/learn/curriculum',
  '/learn/guides',
  '/learn/write',
  '/learn/how-it-works',
  '/learn/for-parents',
  '/learn/for-teachers',
  '/learn/accessibility',
  '/learn/privacy',
  '/learn/sign-in',
];

/** Humanizer-side pages that only exist to carry a token or a receipt. */
const SITE_PRIVATE = ['/auth', '/payment-success'];

const under = (path: string, roots: string[]) => roots.some((root) => path === root || path.startsWith(`${root}/`));

function withoutQuery(event: BeforeSendEvent, url: URL): BeforeSendEvent {
  url.search = '';
  url.hash = '';
  return { ...event, url: url.href };
}

function studioOnly(event: BeforeSendEvent): BeforeSendEvent | null {
  if (readStudentSession()) return null;
  const url = new URL(event.url);
  if (url.pathname !== '/' && !under(url.pathname, STUDIO_PUBLIC)) return null;
  return withoutQuery(event, url);
}

function siteOnly(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  if (under(url.pathname, SITE_PRIVATE)) return null;
  return withoutQuery(event, url);
}

export default function VisitCounter({ scope }: { scope: 'studio' | 'site' }) {
  return <Analytics beforeSend={scope === 'studio' ? studioOnly : siteOnly} />;
}
