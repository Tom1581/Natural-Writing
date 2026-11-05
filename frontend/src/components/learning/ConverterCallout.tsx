'use client';

import Link from 'next/link';
import { useSession } from '@/lib/learning/session';

/**
 * The home page belongs to Writing Studio; this note keeps the Writing Converter easy to find for
 * the adults who came looking for it. Students signed in with a code never see it.
 */
export default function ConverterCallout() {
  const { kind } = useSession();
  if (kind === 'student') return null;
  return (
    <aside className="lw-converter-note" aria-label="Writing Converter">
      <p>
        <strong>Looking for the Writing Converter?</strong> Our AI humanizer for adults, for revising AI-assisted drafts into natural writing, now has
        its own page. Same account and plans.
      </p>
      <Link href="/converter" className="lw-btn lw-btn-secondary lw-btn-small">
        Open the Writing Converter
      </Link>
    </aside>
  );
}
