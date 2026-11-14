'use client';

import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/learning/session';

/**
 * Pages written for adults. The footer row below appears only here: lessons, practice sets,
 * prompts and the writing and feedback pages are where students work, including students
 * practicing without an account, and a link to a tool that rewrites text has no place there.
 */
const ADULT_PAGES = [
  '/learn/for-parents',
  '/learn/for-teachers',
  '/learn/guides',
  '/learn/how-it-works',
  '/learn/curriculum',
  '/learn/rubrics',
  '/learn/privacy',
  '/learn/accessibility',
  '/learn/teach',
  '/learn/school',
];

/**
 * Footer row that names Natural Quill's tools for adults, so the two halves of the site share a
 * way back to each other. Hidden for students signed in with a code, like every other link to
 * the humanizer. Plain anchors: these pages live under the other root layout.
 */
export default function StudioFamilyLinks() {
  const { kind } = useSession();
  const pathname = usePathname();
  const adultPage = pathname === '/' || ADULT_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (kind === 'student' || !adultPage) return null;
  return (
    <div className="lw-footer-family">
      <span>Also from Natural Quill, for adults:</span>
      <nav aria-label="Natural Quill tools for adults">
        <a href="/converter">AI Humanizer</a>
        <a href="/ai-phrase-checker">Free Phrase Checker</a>
        <a href="/revision-audit">Revision Audit</a>
        <a href="/blog">Guides on AI and writing</a>
      </nav>
    </div>
  );
}
