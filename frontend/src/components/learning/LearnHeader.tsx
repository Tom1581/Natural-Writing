'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandMark from '@/components/BrandMark';
import ReadingPrefs from './ReadingPrefs';
import RegionPicker from './RegionPicker';
import { signOutEverywhereOnDevice, useSession } from '@/lib/learning/session';

const PUBLIC_LINKS = [
  { href: '/learn/grades', label: 'Grades' },
  { href: '/learn/lessons', label: 'Lessons' },
  { href: '/learn/practice', label: 'Practice' },
  { href: '/learn/curriculum', label: 'Curriculum' },
];

export default function LearnHeader() {
  const pathname = usePathname();
  const { kind, student, ready } = useSession();
  // Signed in, the header gets busy: curriculum stays one click away in the footer.
  const links = [
    ...PUBLIC_LINKS.filter((l) => !kind || l.href !== '/learn/curriculum'),
    ...(kind ? [{ href: '/learn/dashboard', label: kind === 'student' ? 'My writing' : 'Students' }, { href: '/learn/plan', label: 'Plan' }, { href: '/learn/portfolio', label: 'Portfolio' }] : []),
    ...(kind === 'adult' ? [{ href: '/learn/teach', label: 'Teach' }, { href: '/learn/school', label: 'School' }] : []),
  ];
  const current = (href: string) => (pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined);

  return (
    <header className="lw-header">
      <div className="lw-header-inner">
        <Link href="/" className="lw-brand">
          <BrandMark size={28} />
          <span>
            Natural Quill <small>Writing Studio</small>
          </span>
        </Link>
        <nav className="lw-nav" aria-label="Writing Studio">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="lw-header-tools">
          <RegionPicker compact />
          <ReadingPrefs />
          {ready && kind && (
            <button
              type="button"
              className="lw-btn lw-btn-quiet lw-small"
              onClick={async () => {
                await signOutEverywhereOnDevice();
                window.location.href = '/';
              }}
            >
              {kind === 'student' ? `Sign out ${student?.learner.displayName ?? ''}`.trim() : 'Sign out'}
            </button>
          )}
          {ready && !kind && (
            <Link href="/learn/sign-in" className="lw-btn lw-btn-primary lw-btn-small">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
